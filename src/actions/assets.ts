"use server";

import { revalidatePath } from "next/cache";
import { assetCreateSchema, assetUpdateSchema } from "@/domain/assets/validation";
import * as assetService from "@/services/assets";

export type ActionResult = {
  success: boolean;
  error?: string;
};

export async function createAssetAction(formData: FormData): Promise<ActionResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = assetCreateSchema.safeParse({
    ...raw,
    purchasePrice: raw.purchasePrice ? Number(raw.purchasePrice) : undefined,
    dealerPrice: raw.dealerPrice ? Number(raw.dealerPrice) : undefined,
    retailPrice: raw.retailPrice ? Number(raw.retailPrice) : undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    await assetService.createAsset(parsed.data);
    revalidatePath("/assets");
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка создания актива";
    return { success: false, error: msg };
  }
}

export async function updateAssetAction(formData: FormData): Promise<ActionResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = assetUpdateSchema.safeParse({
    ...raw,
    purchasePrice: raw.purchasePrice ? Number(raw.purchasePrice) : undefined,
    dealerPrice: raw.dealerPrice ? Number(raw.dealerPrice) : undefined,
    retailPrice: raw.retailPrice ? Number(raw.retailPrice) : undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    await assetService.updateAsset(parsed.data);
    revalidatePath("/assets");
    revalidatePath(`/assets/${parsed.data.id}`);
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка обновления актива";
    return { success: false, error: msg };
  }
}

export async function deleteAssetAction(id: string): Promise<ActionResult> {
  try {
    await assetService.deleteAsset(id);
    revalidatePath("/assets");
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка удаления актива";
    return { success: false, error: msg };
  }
}
