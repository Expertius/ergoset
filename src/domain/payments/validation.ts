import { z } from "zod";

export const paymentCreateSchema = z.object({
  dealId: z.string().min(1, "Сделка обязательна"),
  rentalId: z.string().optional(),
  date: z.coerce.date(),
  amount: z.coerce.number().int().positive("Сумма должна быть положительной"),
  currency: z.string().default("RUB"),
  method: z.enum(["cash", "card", "bank_transfer", "sbp", "other"]).default("cash"),
  kind: z.enum(["rent", "delivery", "assembly", "deposit", "sale", "refund", "penalty", "discount_adjustment"]),
  status: z.enum(["planned", "paid", "partially_paid", "refunded", "canceled"]).default("planned"),
  taxReceiptUrl: z.string().url().optional().or(z.literal("")),
  comment: z.string().optional(),
});

export const paymentUpdateSchema = paymentCreateSchema.partial().extend({
  id: z.string(),
});

export const expenseCreateSchema = z.object({
  category: z.enum(["asset_purchase", "accessory_purchase", "delivery_cost", "assembly_cost", "repair", "tax", "ads", "other"]),
  assetId: z.string().optional(),
  dealId: z.string().optional(),
  date: z.coerce.date(),
  amount: z.coerce.number().int().positive("Сумма должна быть положительной"),
  comment: z.string().optional(),
});

export const expenseUpdateSchema = expenseCreateSchema.partial().extend({
  id: z.string(),
});

export type PaymentCreateInput = z.infer<typeof paymentCreateSchema>;
export type PaymentUpdateInput = z.infer<typeof paymentUpdateSchema>;
export type ExpenseCreateInput = z.infer<typeof expenseCreateSchema>;
export type ExpenseUpdateInput = z.infer<typeof expenseUpdateSchema>;
