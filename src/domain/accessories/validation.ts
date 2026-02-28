import { z } from "zod";

export const accessoryCreateSchema = z.object({
  sku: z.string().min(1, "SKU обязателен"),
  name: z.string().min(1, "Название обязательно"),
  category: z.enum(["bracket", "rail", "platform", "block", "cable", "adapter", "other"]).default("other"),
  purchasePrice: z.coerce.number().int().nonnegative().optional(),
  dealerPrice: z.coerce.number().int().nonnegative().optional(),
  retailPrice: z.coerce.number().int().nonnegative().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
});

export const accessoryUpdateSchema = accessoryCreateSchema.partial().extend({
  id: z.string(),
});

export type AccessoryCreateInput = z.infer<typeof accessoryCreateSchema>;
export type AccessoryUpdateInput = z.infer<typeof accessoryUpdateSchema>;
