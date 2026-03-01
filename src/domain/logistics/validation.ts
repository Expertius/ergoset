import { z } from "zod";

const deliveryTaskType = z.enum(["delivery", "pickup", "replacement", "maintenance_visit"]);
const deliveryTaskStatus = z.enum(["planned", "in_progress", "completed", "canceled"]);

export const deliveryTaskCreateSchema = z.object({
  rentalId: z.string().min(1, "Аренда обязательна"),
  type: deliveryTaskType,
  plannedAt: z.coerce.date().optional(),
  assignee: z.string().optional(),
  address: z.string().optional(),
  instructions: z.string().optional(),
  comment: z.string().optional(),

  pointFrom: z.string().optional(),
  pointFromLat: z.coerce.number().optional(),
  pointFromLng: z.coerce.number().optional(),
  pointTo: z.string().optional(),
  pointToLat: z.coerce.number().optional(),
  pointToLng: z.coerce.number().optional(),
  distanceKm: z.coerce.number().optional(),
  driveDurationMin: z.coerce.number().int().optional(),

  floor: z.coerce.number().int().optional(),
  hasElevator: z.boolean().optional(),
  logistComment: z.string().optional(),
  clientNote: z.string().optional(),
});

export const deliveryTaskUpdateSchema = z.object({
  id: z.string(),
  type: deliveryTaskType.optional(),
  status: deliveryTaskStatus.optional(),
  plannedAt: z.coerce.date().optional(),
  assignee: z.string().optional(),
  address: z.string().optional(),
  instructions: z.string().optional(),
  comment: z.string().optional(),

  pointFrom: z.string().optional(),
  pointFromLat: z.coerce.number().optional(),
  pointFromLng: z.coerce.number().optional(),
  pointTo: z.string().optional(),
  pointToLat: z.coerce.number().optional(),
  pointToLng: z.coerce.number().optional(),
  distanceKm: z.coerce.number().optional(),
  driveDurationMin: z.coerce.number().int().optional(),

  timeLoading: z.coerce.number().int().optional(),
  timeDriving: z.coerce.number().int().optional(),
  timeCarrying: z.coerce.number().int().optional(),
  timeAssembly: z.coerce.number().int().optional(),
  timeDisassembly: z.coerce.number().int().optional(),
  timeUnloading: z.coerce.number().int().optional(),

  fuelCost: z.coerce.number().int().optional(),
  tollCost: z.coerce.number().int().optional(),
  otherCost: z.coerce.number().int().optional(),

  salaryBase: z.coerce.number().int().optional(),
  salaryPerKm: z.coerce.number().int().optional(),

  floor: z.coerce.number().int().optional(),
  hasElevator: z.boolean().optional(),
  logistComment: z.string().optional(),
  clientNote: z.string().optional(),
});

export const deliveryTaskCompleteSchema = z.object({
  id: z.string(),
  timeLoading: z.coerce.number().int().min(0).default(0),
  timeDriving: z.coerce.number().int().min(0).default(0),
  timeCarrying: z.coerce.number().int().min(0).default(0),
  timeAssembly: z.coerce.number().int().min(0).default(0),
  timeDisassembly: z.coerce.number().int().min(0).default(0),
  timeUnloading: z.coerce.number().int().min(0).default(0),

  fuelCost: z.coerce.number().int().min(0).default(0),
  tollCost: z.coerce.number().int().min(0).default(0),
  otherCost: z.coerce.number().int().min(0).default(0),

  logistComment: z.string().optional(),
  clientNote: z.string().optional(),
});

export const deliveryCommentCreateSchema = z.object({
  deliveryTaskId: z.string().min(1),
  text: z.string().min(1, "Комментарий не может быть пустым"),
});

export const deliveryRateUpdateSchema = z.object({
  baseSalary: z.coerce.number().int().min(0).default(0),
  perKmRate: z.coerce.number().int().min(0).default(0),
  fuelPerKmRate: z.coerce.number().int().min(0).default(0),
  assemblyRate: z.coerce.number().int().min(0).default(0),
  disassemblyRate: z.coerce.number().int().min(0).default(0),
  floorRate: z.coerce.number().int().min(0).default(0),
});

export const calculateRouteSchema = z.object({
  origin: z.string().min(1, "Укажите адрес отправления"),
  destination: z.string().min(1, "Укажите адрес назначения"),
});

export type DeliveryTaskCreateInput = z.infer<typeof deliveryTaskCreateSchema>;
export type DeliveryTaskUpdateInput = z.infer<typeof deliveryTaskUpdateSchema>;
export type DeliveryTaskCompleteInput = z.infer<typeof deliveryTaskCompleteSchema>;
export type DeliveryCommentCreateInput = z.infer<typeof deliveryCommentCreateSchema>;
export type DeliveryRateUpdateInput = z.infer<typeof deliveryRateUpdateSchema>;
