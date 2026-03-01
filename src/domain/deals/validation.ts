import { z } from "zod";

export const dealCreateSchema = z.object({
  type: z.enum(["rent", "sale", "rent_to_purchase", "reservation", "return_deal", "exchange"]),
  status: z.enum([
    "lead", "booked", "delivery_scheduled", "delivered", "active",
    "extended", "return_scheduled", "closed_return", "closed_purchase", "canceled",
  ]).default("lead"),
  clientId: z.string().min(1, "Клиент обязателен"),
  source: z.string().optional(),
  comment: z.string().optional(),
});

export const rentalCreateSchema = z.object({
  dealId: z.string().min(1),
  assetId: z.string().min(1, "Станция обязательна"),
  configurationId: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  plannedMonths: z.coerce.number().int().positive().optional(),
  rentAmount: z.coerce.number().int().nonnegative().default(0),
  deliveryAmount: z.coerce.number().int().nonnegative().default(0),
  assemblyAmount: z.coerce.number().int().nonnegative().default(0),
  depositAmount: z.coerce.number().int().nonnegative().default(0),
  discountAmount: z.coerce.number().int().nonnegative().default(0),
  addressDelivery: z.string().optional(),
  addressPickup: z.string().optional(),
  deliveryInstructions: z.string().optional(),
  notes: z.string().optional(),
  accessories: z
    .array(
      z.object({
        accessoryId: z.string(),
        qty: z.coerce.number().int().positive(),
        price: z.coerce.number().int().nonnegative().default(0),
        isIncluded: z.boolean().default(false),
      })
    )
    .default([]),
}).refine((d) => d.endDate > d.startDate, {
  message: "Дата окончания должна быть позже даты начала",
  path: ["endDate"],
});

export const rentalExtendSchema = z.object({
  rentalId: z.string().min(1),
  newEndDate: z.coerce.date(),
  plannedMonths: z.coerce.number().int().positive().optional(),
  amountRent: z.coerce.number().int().nonnegative().default(0),
  amountDelivery: z.coerce.number().int().nonnegative().default(0),
  amountDiscount: z.coerce.number().int().nonnegative().default(0),
  comment: z.string().optional(),
});

export const accessoryLineSchema = z.object({
  accessoryId: z.string().min(1),
  qty: z.coerce.number().int().positive(),
  price: z.coerce.number().int().nonnegative().default(0),
  isIncluded: z.boolean().default(false),
});

export const dealQuickCreateSchema = z.object({
  clientId: z.string().min(1, "Клиент обязателен"),
  type: z.enum(["rent", "sale", "rent_to_purchase", "reservation", "return_deal", "exchange"]).default("rent"),
  source: z.string().optional(),
  comment: z.string().optional(),
  assetId: z.string().min(1, "Станция обязательна"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  plannedMonths: z.coerce.number().int().positive().optional(),
  rentAmount: z.coerce.number().int().nonnegative().default(0),
  deliveryAmount: z.coerce.number().int().nonnegative().default(0),
  assemblyAmount: z.coerce.number().int().nonnegative().default(0),
  depositAmount: z.coerce.number().int().nonnegative().default(0),
  discountAmount: z.coerce.number().int().nonnegative().default(0),
  addressDelivery: z.string().optional(),
  addressPickup: z.string().optional(),
  notes: z.string().optional(),
  accessories: z.array(accessoryLineSchema).default([]),
}).refine((d) => d.endDate > d.startDate, {
  message: "Дата окончания должна быть позже даты начала",
  path: ["endDate"],
});

export type DealCreateInput = z.infer<typeof dealCreateSchema>;
export type RentalCreateInput = z.infer<typeof rentalCreateSchema>;
export type RentalExtendInput = z.infer<typeof rentalExtendSchema>;
export type DealQuickCreateInput = z.infer<typeof dealQuickCreateSchema>;
