"use server";

import { revalidatePath } from "next/cache";
import { inventoryAdjustSchema } from "@/domain/inventory/validation";
import * as inventoryService from "@/services/inventory";

export type ActionResult = {
  success: boolean;
  error?: string;
};

export async function adjustInventoryAction(formData: FormData): Promise<ActionResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = inventoryAdjustSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    await inventoryService.adjustInventory(parsed.data);
    revalidatePath("/inventory");
    revalidatePath("/accessories");
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка корректировки склада";
    return { success: false, error: msg };
  }
}
