"use server";

import { revalidatePath } from "next/cache";
import { dealQuickCreateSchema, rentalExtendSchema } from "@/domain/deals/validation";
import * as dealService from "@/services/deals";
import { logAudit } from "@/lib/audit";

export type ActionResult = {
  success: boolean;
  error?: string;
  id?: string;
};

export async function createDealAction(formData: FormData): Promise<ActionResult> {
  const raw = Object.fromEntries(formData.entries());
  const accessoriesJson = raw.accessories as string | undefined;
  let accessories: { accessoryId: string; qty: number; price: number; isIncluded: boolean }[] = [];
  if (accessoriesJson) {
    try {
      accessories = JSON.parse(accessoriesJson);
    } catch { /* ignore parse errors */ }
  }
  const parsed = dealQuickCreateSchema.safeParse({
    ...raw,
    rentAmount: raw.rentAmount ? Number(raw.rentAmount) : 0,
    deliveryAmount: raw.deliveryAmount ? Number(raw.deliveryAmount) : 0,
    assemblyAmount: raw.assemblyAmount ? Number(raw.assemblyAmount) : 0,
    depositAmount: raw.depositAmount ? Number(raw.depositAmount) : 0,
    discountAmount: raw.discountAmount ? Number(raw.discountAmount) : 0,
    plannedMonths: raw.plannedMonths ? Number(raw.plannedMonths) : undefined,
    accessories,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const deal = await dealService.createDealWithRental(parsed.data);
    await logAudit("deal", deal.id, "create", { type: parsed.data.type, clientId: parsed.data.clientId });
    revalidatePath("/deals");
    revalidatePath("/assets");
    revalidatePath("/calendar");
    revalidatePath("/");
    return { success: true, id: deal.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка создания сделки";
    return { success: false, error: msg };
  }
}

export async function extendRentalAction(formData: FormData): Promise<ActionResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = rentalExtendSchema.safeParse({
    ...raw,
    amountRent: raw.amountRent ? Number(raw.amountRent) : 0,
    amountDelivery: raw.amountDelivery ? Number(raw.amountDelivery) : 0,
    amountDiscount: raw.amountDiscount ? Number(raw.amountDiscount) : 0,
    plannedMonths: raw.plannedMonths ? Number(raw.plannedMonths) : undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const extensionDeal = await dealService.extendRental(parsed.data);
    await logAudit("deal", extensionDeal.id, "extend", {
      parentDealId: extensionDeal.parentDealId,
      rentalId: parsed.data.rentalId,
      newEndDate: parsed.data.newEndDate.toISOString(),
    });
    revalidatePath("/deals");
    revalidatePath("/calendar");
    revalidatePath("/");
    return { success: true, id: extensionDeal.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка продления";
    return { success: false, error: msg };
  }
}

export async function closeByReturnAction(rentalId: string): Promise<ActionResult> {
  try {
    await dealService.closeRentalByReturn(rentalId);
    await logAudit("rental", rentalId, "close_return");
    revalidatePath("/deals");
    revalidatePath("/assets");
    revalidatePath("/calendar");
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка закрытия";
    return { success: false, error: msg };
  }
}

export async function closeByBuyoutAction(
  rentalId: string,
  purchaseAmount?: number
): Promise<ActionResult> {
  try {
    await dealService.closeRentalByBuyout(rentalId, purchaseAmount);
    await logAudit("rental", rentalId, "close_buyout", { purchaseAmount });
    revalidatePath("/deals");
    revalidatePath("/assets");
    revalidatePath("/calendar");
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка оформления выкупа";
    return { success: false, error: msg };
  }
}

export async function cancelDealAction(dealId: string): Promise<ActionResult> {
  try {
    await dealService.cancelDeal(dealId);
    await logAudit("deal", dealId, "cancel");
    revalidatePath("/deals");
    revalidatePath("/assets");
    revalidatePath("/calendar");
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка отмены сделки";
    return { success: false, error: msg };
  }
}

export async function activateDealAction(dealId: string): Promise<ActionResult> {
  try {
    await dealService.activateDeal(dealId);
    await logAudit("deal", dealId, "activate");
    revalidatePath("/deals");
    revalidatePath("/assets");
    revalidatePath("/calendar");
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка активации";
    return { success: false, error: msg };
  }
}
