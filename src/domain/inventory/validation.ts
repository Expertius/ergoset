import { z } from "zod";

export const inventoryAdjustSchema = z.object({
  accessoryId: z.string().min(1),
  type: z.enum(["incoming", "reserve", "issue", "return_item", "writeoff", "repair", "lost"]),
  qty: z.coerce.number().int().positive("Количество должно быть положительным"),
  location: z.string().default("warehouse"),
  comment: z.string().optional(),
});

export type InventoryAdjustInput = z.infer<typeof inventoryAdjustSchema>;
