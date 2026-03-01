"use server";

import { revalidatePath } from "next/cache";
import * as logisticsService from "@/services/logistics";
import { logAudit } from "@/lib/audit";
import { calculateRoute, geocodeAddress } from "@/lib/maps";
import {
  deliveryTaskCreateSchema,
  deliveryTaskUpdateSchema,
  deliveryTaskCompleteSchema,
  deliveryCommentCreateSchema,
  deliveryRateUpdateSchema,
  calculateRouteSchema,
} from "@/domain/logistics/validation";
import { getSession } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";

export type ActionResult<T = void> = {
  success: boolean;
  error?: string;
  data?: T;
};

function revalidateLogistics() {
  revalidatePath("/logistics");
  revalidatePath("/deals");
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
}

// ─── CRUD ───────────────────────────────────────────────

export async function createDeliveryTaskAction(
  formData: FormData
): Promise<ActionResult> {
  const session = await getSession();
  requireRole(session, "ADMIN", "LOGISTICS");
  try {
    const raw = Object.fromEntries(formData.entries());
    const parsed = deliveryTaskCreateSchema.parse({
      ...raw,
      hasElevator: raw.hasElevator === "true",
    });

    const task = await logisticsService.createDeliveryTask(parsed);
    await logAudit("delivery_task", task.id, "create", { type: parsed.type });
    revalidateLogistics();
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка создания задачи";
    return { success: false, error: msg };
  }
}

export async function updateDeliveryTaskAction(
  formData: FormData
): Promise<ActionResult> {
  const session = await getSession();
  requireRole(session, "ADMIN", "LOGISTICS");
  try {
    const raw = Object.fromEntries(formData.entries());
    const parsed = deliveryTaskUpdateSchema.parse({
      ...raw,
      hasElevator: raw.hasElevator === "true" ? true : raw.hasElevator === "false" ? false : undefined,
    });

    await logisticsService.updateDeliveryTask(parsed);
    await logAudit("delivery_task", parsed.id, "update", parsed);
    revalidateLogistics();
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка обновления задачи";
    return { success: false, error: msg };
  }
}

export async function updateDeliveryTaskStatusAction(
  id: string,
  status: string
): Promise<ActionResult> {
  const session = await getSession();
  requireRole(session, "ADMIN", "LOGISTICS");
  try {
    if (status === "in_progress") {
      await logisticsService.startDeliveryTask(id);
    } else {
      await logisticsService.updateDeliveryTaskStatus(
        id,
        status as Parameters<typeof logisticsService.updateDeliveryTaskStatus>[1]
      );
    }
    await logAudit("delivery_task", id, "update_status", { status });
    revalidateLogistics();
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка обновления";
    return { success: false, error: msg };
  }
}

export async function completeDeliveryTaskAction(
  formData: FormData
): Promise<ActionResult> {
  const session = await getSession();
  requireRole(session, "ADMIN", "LOGISTICS");
  try {
    const raw = Object.fromEntries(formData.entries());
    const parsed = deliveryTaskCompleteSchema.parse(raw);

    await logisticsService.completeDeliveryTask(parsed);
    await logAudit("delivery_task", parsed.id, "complete", parsed);
    revalidateLogistics();
    revalidatePath("/payments");
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка завершения задачи";
    return { success: false, error: msg };
  }
}

export async function deleteDeliveryTaskAction(
  id: string
): Promise<ActionResult> {
  const session = await getSession();
  requireRole(session, "ADMIN", "LOGISTICS");
  try {
    await logisticsService.deleteDeliveryTask(id);
    await logAudit("delivery_task", id, "delete", {});
    revalidateLogistics();
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка удаления";
    return { success: false, error: msg };
  }
}

// ─── Route calculation ──────────────────────────────────

export async function calculateRouteAction(
  origin: string,
  destination: string
): Promise<ActionResult<{ distanceKm: number; durationMin: number; originCoords?: { lat: number; lng: number }; destCoords?: { lat: number; lng: number } }>> {
  try {
    calculateRouteSchema.parse({ origin, destination });

    const [route, originCoords, destCoords] = await Promise.all([
      calculateRoute(origin, destination),
      geocodeAddress(origin),
      geocodeAddress(destination),
    ]);

    if (!route) {
      return {
        success: false,
        error: "Не удалось рассчитать маршрут. Проверьте адреса или введите расстояние вручную.",
      };
    }

    return {
      success: true,
      data: {
        ...route,
        originCoords: originCoords ?? undefined,
        destCoords: destCoords ?? undefined,
      },
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка расчёта маршрута";
    return { success: false, error: msg };
  }
}

// ─── Cost estimate ──────────────────────────────────────

export async function estimateDeliveryCostsAction(params: {
  distanceKm: number;
  floor?: number;
  hasElevator?: boolean;
  includeAssembly?: boolean;
  includeDisassembly?: boolean;
}): Promise<ActionResult<Awaited<ReturnType<typeof logisticsService.calculateDeliveryCosts>>>> {
  const session = await getSession();
  requireRole(session, "ADMIN", "LOGISTICS", "MANAGER");
  try {
    const result = await logisticsService.calculateDeliveryCosts(params);
    return { success: true, data: result };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка расчёта";
    return { success: false, error: msg };
  }
}

// ─── Comments ───────────────────────────────────────────

export async function addDeliveryCommentAction(
  formData: FormData
): Promise<ActionResult> {
  const session = await getSession();
  requireRole(session, "ADMIN", "LOGISTICS", "MANAGER");
  try {
    const raw = Object.fromEntries(formData.entries());
    const parsed = deliveryCommentCreateSchema.parse(raw);

    await logisticsService.addDeliveryComment(parsed, session.id);
    revalidateLogistics();
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка добавления комментария";
    return { success: false, error: msg };
  }
}

// ─── Rates ──────────────────────────────────────────────

export async function updateDeliveryRateAction(
  formData: FormData
): Promise<ActionResult> {
  const session = await getSession();
  requireRole(session, "ADMIN");
  try {
    const raw = Object.fromEntries(formData.entries());
    const parsed = deliveryRateUpdateSchema.parse(raw);

    await logisticsService.updateDeliveryRate(parsed);
    await logAudit("delivery_rate", "default", "update", parsed);
    revalidateLogistics();
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка сохранения ставок";
    return { success: false, error: msg };
  }
}
