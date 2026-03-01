import { z } from "zod";

export const leadCreateSchema = z.object({
  name: z.string().min(2, "Укажите имя"),
  phone: z.string().optional(),
  email: z.string().email("Некорректный email").optional().or(z.literal("")),
  interest: z.enum(["rent", "buy", "rent_to_purchase", "info"]).default("rent"),
  desiredAssetId: z.string().optional(),
  desiredConfig: z.string().optional(),
  desiredStartDate: z.coerce.date().optional(),
  desiredMonths: z.coerce.number().int().min(1).max(36).optional(),
  source: z.enum(["website", "phone", "referral", "social", "ads", "other"]).default("website"),
  notes: z.string().optional(),
});

export const leadPublicCreateSchema = leadCreateSchema.refine(
  (d) => d.phone || d.email,
  { message: "Укажите телефон или email", path: ["phone"] },
);

export const leadUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  interest: z.enum(["rent", "buy", "rent_to_purchase", "info"]).optional(),
  desiredAssetId: z.string().nullable().optional(),
  desiredConfig: z.string().nullable().optional(),
  desiredStartDate: z.coerce.date().nullable().optional(),
  desiredMonths: z.coerce.number().int().min(1).max(36).nullable().optional(),
  source: z.enum(["website", "phone", "referral", "social", "ads", "other"]).optional(),
  status: z.enum(["new", "contacted", "qualified", "negotiation", "contract_pending", "contract_filled", "converted", "rejected"]).optional(),
  notes: z.string().nullable().optional(),
  managerNotes: z.string().nullable().optional(),
  assignedToId: z.string().nullable().optional(),
});

export const contractDataSchema = z.object({
  fullName: z.string().min(2, "Укажите ФИО"),
  phone: z.string().min(5, "Укажите телефон"),
  email: z.string().email("Некорректный email").optional().or(z.literal("")),
  passportSeries: z.string().min(4, "Укажите серию паспорта"),
  passportNumber: z.string().min(6, "Укажите номер паспорта"),
  passportIssuedBy: z.string().min(5, "Укажите кем выдан"),
  passportIssueDate: z.string().min(1, "Укажите дату выдачи"),
  registrationAddress: z.string().min(5, "Укажите адрес регистрации"),
  actualAddress: z.string().optional(),
  deliveryAddress: z.string().optional(),
  deliveryNotes: z.string().optional(),
});

export type LeadCreateInput = z.infer<typeof leadCreateSchema>;
export type LeadUpdateInput = z.infer<typeof leadUpdateSchema>;
export type ContractDataInput = z.infer<typeof contractDataSchema>;
