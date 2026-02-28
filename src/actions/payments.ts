"use server";

import { revalidatePath } from "next/cache";
import {
  paymentCreateSchema,
  paymentUpdateSchema,
  expenseCreateSchema,
} from "@/domain/payments/validation";
import * as paymentService from "@/services/payments";
import { logAudit } from "@/lib/audit";

export type ActionResult = {
  success: boolean;
  error?: string;
};

export async function createPaymentAction(formData: FormData): Promise<ActionResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = paymentCreateSchema.safeParse({
    ...raw,
    amount: raw.amount ? Number(raw.amount) : undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const payment = await paymentService.createPayment(parsed.data);
    await logAudit("payment", payment.id, "create", { kind: parsed.data.kind, amount: parsed.data.amount });
    revalidatePath("/payments");
    revalidatePath("/deals");
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка создания платежа";
    return { success: false, error: msg };
  }
}

export async function updatePaymentAction(formData: FormData): Promise<ActionResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = paymentUpdateSchema.safeParse({
    ...raw,
    amount: raw.amount ? Number(raw.amount) : undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    await paymentService.updatePayment(parsed.data);
    revalidatePath("/payments");
    revalidatePath("/deals");
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка обновления платежа";
    return { success: false, error: msg };
  }
}

export async function deletePaymentAction(id: string): Promise<ActionResult> {
  try {
    await paymentService.deletePayment(id);
    revalidatePath("/payments");
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка удаления";
    return { success: false, error: msg };
  }
}

export async function createExpenseAction(formData: FormData): Promise<ActionResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = expenseCreateSchema.safeParse({
    ...raw,
    amount: raw.amount ? Number(raw.amount) : undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const expense = await paymentService.createExpense(parsed.data);
    await logAudit("expense", expense.id, "create", { category: parsed.data.category, amount: parsed.data.amount });
    revalidatePath("/payments");
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка создания расхода";
    return { success: false, error: msg };
  }
}

export async function deleteExpenseAction(id: string): Promise<ActionResult> {
  try {
    await paymentService.deleteExpense(id);
    revalidatePath("/payments");
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка удаления расхода";
    return { success: false, error: msg };
  }
}
