"use server";

import { revalidatePath } from "next/cache";
import type { DeliveryTaskType, DeliveryTaskStatus } from "@/generated/prisma/browser";
import * as logisticsService from "@/services/logistics";
import { logAudit } from "@/lib/audit";

export type ActionResult = {
  success: boolean;
  error?: string;
};

export async function createDeliveryTaskAction(formData: FormData): Promise<ActionResult> {
  const raw = Object.fromEntries(formData.entries());

  try {
    const task = await logisticsService.createDeliveryTask({
      rentalId: raw.rentalId as string,
      type: raw.type as DeliveryTaskType,
      plannedAt: raw.plannedAt ? new Date(raw.plannedAt as string) : undefined,
      assignee: (raw.assignee as string) || undefined,
      address: (raw.address as string) || undefined,
      instructions: (raw.instructions as string) || undefined,
      comment: (raw.comment as string) || undefined,
    });
    await logAudit("delivery_task", task.id, "create", { type: raw.type });
    revalidatePath("/deals");
    revalidatePath("/calendar");
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка создания задачи";
    return { success: false, error: msg };
  }
}

export async function updateDeliveryTaskStatusAction(
  id: string,
  status: string
): Promise<ActionResult> {
  try {
    await logisticsService.updateDeliveryTaskStatus(id, status as DeliveryTaskStatus);
    await logAudit("delivery_task", id, "update_status", { status });
    revalidatePath("/deals");
    revalidatePath("/calendar");
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка обновления";
    return { success: false, error: msg };
  }
}
