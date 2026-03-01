"use server";

import { revalidatePath } from "next/cache";
import { accessoryCreateSchema, accessoryUpdateSchema } from "@/domain/accessories/validation";
import * as accessoryService from "@/services/accessories";
import { getSession } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";

export type ActionResult = {
  success: boolean;
  error?: string;
};

export async function createAccessoryAction(formData: FormData): Promise<ActionResult> {
  const session = await getSession();
  requireRole(session, "ADMIN");
  const raw = Object.fromEntries(formData.entries());
  const parsed = accessoryCreateSchema.safeParse({
    ...raw,
    purchasePrice: raw.purchasePrice ? Number(raw.purchasePrice) : undefined,
    dealerPrice: raw.dealerPrice ? Number(raw.dealerPrice) : undefined,
    retailPrice: raw.retailPrice ? Number(raw.retailPrice) : undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    await accessoryService.createAccessory(parsed.data);
    revalidatePath("/accessories");
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка создания аксессуара";
    return { success: false, error: msg };
  }
}

export async function updateAccessoryAction(formData: FormData): Promise<ActionResult> {
  const session = await getSession();
  requireRole(session, "ADMIN");
  const raw = Object.fromEntries(formData.entries());
  const parsed = accessoryUpdateSchema.safeParse({
    ...raw,
    purchasePrice: raw.purchasePrice ? Number(raw.purchasePrice) : undefined,
    dealerPrice: raw.dealerPrice ? Number(raw.dealerPrice) : undefined,
    retailPrice: raw.retailPrice ? Number(raw.retailPrice) : undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    await accessoryService.updateAccessory(parsed.data);
    revalidatePath("/accessories");
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка обновления аксессуара";
    return { success: false, error: msg };
  }
}

export async function deleteAccessoryAction(id: string): Promise<ActionResult> {
  const session = await getSession();
  requireRole(session, "ADMIN");
  try {
    await accessoryService.deleteAccessory(id);
    revalidatePath("/accessories");
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка удаления аксессуара";
    return { success: false, error: msg };
  }
}
