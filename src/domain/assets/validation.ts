import { z } from "zod";

export const assetCreateSchema = z.object({
  code: z.string().min(1, "Код обязателен"),
  name: z.string().min(1, "Название обязательно"),
  brand: z.string().optional(),
  model: z.string().optional(),
  type: z.string().optional(),
  upholstery: z.string().optional(),
  color: z.string().optional(),
  tableType: z.string().optional(),
  description: z.string().optional(),
  purchasePrice: z.coerce.number().int().nonnegative().optional(),
  dealerPrice: z.coerce.number().int().nonnegative().optional(),
  retailPrice: z.coerce.number().int().nonnegative().optional(),
  purchaseDate: z.coerce.date().optional(),
  status: z.enum(["available", "reserved", "rented", "maintenance", "sold", "archived"]).default("available"),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export const assetUpdateSchema = assetCreateSchema.partial().extend({
  id: z.string(),
});

export type AssetCreateInput = z.infer<typeof assetCreateSchema>;
export type AssetUpdateInput = z.infer<typeof assetUpdateSchema>;
