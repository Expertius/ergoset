import { z } from "zod";

export const clientCreateSchema = z.object({
  fullName: z.string().min(1, "ФИО обязательно"),
  phone: z.string().optional(),
  email: z.string().email("Некорректный email").optional().or(z.literal("")),
  birthDate: z.coerce.date().optional(),
  passportSeries: z.string().optional(),
  passportNumber: z.string().optional(),
  passportIssuedBy: z.string().optional(),
  passportIssueDate: z.coerce.date().optional(),
  registrationAddress: z.string().optional(),
  actualAddress: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export const clientUpdateSchema = clientCreateSchema.partial().extend({
  id: z.string(),
});

export type ClientCreateInput = z.infer<typeof clientCreateSchema>;
export type ClientUpdateInput = z.infer<typeof clientUpdateSchema>;
