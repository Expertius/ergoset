import { prisma } from "@/lib/db";
import type { DeliveryTaskStatus, DeliveryTaskType } from "@/generated/prisma/browser";

export type DeliveryTaskFilters = {
  status?: DeliveryTaskStatus;
  type?: DeliveryTaskType;
  assignee?: string;
};

export async function getDeliveryTasks(filters?: DeliveryTaskFilters) {
  const where: Record<string, unknown> = {};
  if (filters?.status) where.status = filters.status;
  if (filters?.type) where.type = filters.type;
  if (filters?.assignee) where.assignee = filters.assignee;

  return prisma.deliveryTask.findMany({
    where,
    include: {
      rental: {
        include: {
          asset: true,
          deal: { include: { client: true } },
        },
      },
    },
    orderBy: { plannedAt: "asc" },
    take: 100,
  });
}

export async function createDeliveryTask(data: {
  rentalId: string;
  type: DeliveryTaskType;
  plannedAt?: Date;
  assignee?: string;
  address?: string;
  instructions?: string;
  comment?: string;
}) {
  return prisma.deliveryTask.create({ data });
}

export async function updateDeliveryTaskStatus(
  id: string,
  status: DeliveryTaskStatus
) {
  return prisma.deliveryTask.update({
    where: { id },
    data: { status },
  });
}

export async function deleteDeliveryTask(id: string) {
  return prisma.deliveryTask.delete({ where: { id } });
}
