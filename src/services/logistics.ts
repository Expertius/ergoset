import { prisma } from "@/lib/db";
import type {
  DeliveryTaskStatus,
  DeliveryTaskType,
} from "@/generated/prisma/browser";
import type {
  DeliveryTaskCreateInput,
  DeliveryTaskUpdateInput,
  DeliveryTaskCompleteInput,
  DeliveryCommentCreateInput,
  DeliveryRateUpdateInput,
} from "@/domain/logistics/validation";

// ─── Types ──────────────────────────────────────────────

export type DeliveryTaskFilters = {
  status?: DeliveryTaskStatus;
  type?: DeliveryTaskType;
  assignee?: string;
  rentalId?: string;
  dateFrom?: Date;
  dateTo?: Date;
};

const TASK_INCLUDE = {
  rental: {
    include: {
      asset: true,
      deal: { include: { client: true } },
    },
  },
  comments: {
    include: { author: { select: { id: true, fullName: true } } },
    orderBy: { createdAt: "desc" as const },
  },
  expenses: true,
} as const;

// ─── CRUD ───────────────────────────────────────────────

export async function getDeliveryTasks(filters?: DeliveryTaskFilters) {
  const where: Record<string, unknown> = {};
  if (filters?.status) where.status = filters.status;
  if (filters?.type) where.type = filters.type;
  if (filters?.assignee) where.assignee = filters.assignee;
  if (filters?.rentalId) where.rentalId = filters.rentalId;
  if (filters?.dateFrom || filters?.dateTo) {
    where.plannedAt = {
      ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
      ...(filters.dateTo ? { lte: filters.dateTo } : {}),
    };
  }

  return prisma.deliveryTask.findMany({
    where,
    include: TASK_INCLUDE,
    orderBy: { plannedAt: "asc" },
    take: 200,
  });
}

export async function getDeliveryTaskById(id: string) {
  return prisma.deliveryTask.findUnique({
    where: { id },
    include: TASK_INCLUDE,
  });
}

export async function createDeliveryTask(data: DeliveryTaskCreateInput) {
  return prisma.deliveryTask.create({
    data,
    include: TASK_INCLUDE,
  });
}

export async function updateDeliveryTask({
  id,
  ...data
}: DeliveryTaskUpdateInput) {
  return prisma.deliveryTask.update({
    where: { id },
    data,
    include: TASK_INCLUDE,
  });
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

// ─── Workflow ───────────────────────────────────────────

export async function startDeliveryTask(id: string) {
  return prisma.deliveryTask.update({
    where: { id },
    data: {
      status: "in_progress",
      startedAt: new Date(),
    },
    include: TASK_INCLUDE,
  });
}

export async function completeDeliveryTask(data: DeliveryTaskCompleteInput) {
  const task = await prisma.deliveryTask.findUniqueOrThrow({
    where: { id: data.id },
    include: {
      rental: { include: { deal: true } },
    },
  });

  const rate = await getOrCreateDefaultRate();

  const totalTimeMin =
    data.timeLoading +
    data.timeDriving +
    data.timeCarrying +
    data.timeAssembly +
    data.timeDisassembly +
    data.timeUnloading;

  const totalCost = data.fuelCost + data.tollCost + data.otherCost;

  const salaryBase = rate.baseSalary;
  const salaryPerKm = Math.round((task.distanceKm ?? 0) * rate.perKmRate);
  let salaryExtras = 0;

  if (data.timeAssembly > 0) salaryExtras += rate.assemblyRate;
  if (data.timeDisassembly > 0) salaryExtras += rate.disassemblyRate;
  if (
    task.floor &&
    task.floor > 1 &&
    !task.hasElevator
  ) {
    salaryExtras += (task.floor - 1) * rate.floorRate;
  }

  const salaryTotal = salaryBase + salaryPerKm + salaryExtras;

  const updated = await prisma.$transaction(async (tx) => {
    const updatedTask = await tx.deliveryTask.update({
      where: { id: data.id },
      data: {
        status: "completed",
        completedAt: new Date(),
        timeLoading: data.timeLoading,
        timeDriving: data.timeDriving,
        timeCarrying: data.timeCarrying,
        timeAssembly: data.timeAssembly,
        timeDisassembly: data.timeDisassembly,
        timeUnloading: data.timeUnloading,
        totalTimeMin,
        fuelCost: data.fuelCost,
        tollCost: data.tollCost,
        otherCost: data.otherCost,
        totalCost,
        salaryBase,
        salaryPerKm,
        salaryTotal,
        logistComment: data.logistComment,
        clientNote: data.clientNote,
      },
      include: TASK_INCLUDE,
    });

    if (totalCost > 0) {
      await tx.expense.create({
        data: {
          category: "delivery_cost",
          amount: totalCost,
          date: new Date(),
          dealId: task.rental.dealId,
          rentalId: task.rentalId,
          deliveryTaskId: task.id,
          comment: `Авто: расходы на доставку (${task.distanceKm ?? 0} км)`,
        },
      });
    }

    if (data.timeAssembly > 0 && salaryExtras > 0) {
      const assemblyExpense =
        rate.assemblyRate + (data.timeDisassembly > 0 ? rate.disassemblyRate : 0);
      if (assemblyExpense > 0) {
        await tx.expense.create({
          data: {
            category: "assembly_cost",
            amount: assemblyExpense,
            date: new Date(),
            dealId: task.rental.dealId,
            rentalId: task.rentalId,
            deliveryTaskId: task.id,
            comment: `Авто: сборка/разборка`,
          },
        });
      }
    }

    if (data.clientNote) {
      await tx.client.update({
        where: { id: task.rental.deal.clientId },
        data: { deliveryNotes: data.clientNote },
      });
    }

    return updatedTask;
  });

  return updated;
}

// ─── Cost calculation ───────────────────────────────────

export async function calculateDeliveryCosts(params: {
  distanceKm: number;
  floor?: number;
  hasElevator?: boolean;
  includeAssembly?: boolean;
  includeDisassembly?: boolean;
}) {
  const rate = await getOrCreateDefaultRate();

  const fuelCost = Math.round(params.distanceKm * rate.fuelPerKmRate);
  const salaryBase = rate.baseSalary;
  const salaryPerKm = Math.round(params.distanceKm * rate.perKmRate);

  let salaryExtras = 0;
  if (params.includeAssembly) salaryExtras += rate.assemblyRate;
  if (params.includeDisassembly) salaryExtras += rate.disassemblyRate;
  if (params.floor && params.floor > 1 && !params.hasElevator) {
    salaryExtras += (params.floor - 1) * rate.floorRate;
  }

  return {
    fuelCost,
    salaryBase,
    salaryPerKm,
    salaryExtras,
    salaryTotal: salaryBase + salaryPerKm + salaryExtras,
    totalEstimate: fuelCost + salaryBase + salaryPerKm + salaryExtras,
    rate,
  };
}

// ─── Comments ───────────────────────────────────────────

export async function addDeliveryComment(
  data: DeliveryCommentCreateInput,
  authorId?: string
) {
  return prisma.deliveryComment.create({
    data: {
      ...data,
      authorId: authorId || undefined,
    },
    include: {
      author: { select: { id: true, fullName: true } },
    },
  });
}

export async function getClientDeliveryHistory(clientId: string) {
  return prisma.deliveryTask.findMany({
    where: {
      rental: { deal: { clientId } },
      status: "completed",
    },
    include: {
      rental: { include: { asset: true } },
      comments: {
        include: { author: { select: { id: true, fullName: true } } },
      },
    },
    orderBy: { completedAt: "desc" },
    take: 20,
  });
}

// ─── Rates ──────────────────────────────────────────────

export async function getOrCreateDefaultRate() {
  let rate = await prisma.deliveryRate.findUnique({
    where: { name: "default" },
  });
  if (!rate) {
    rate = await prisma.deliveryRate.create({
      data: { name: "default" },
    });
  }
  return rate;
}

export async function updateDeliveryRate(data: DeliveryRateUpdateInput) {
  return prisma.deliveryRate.upsert({
    where: { name: "default" },
    update: data,
    create: { name: "default", ...data },
  });
}

// ─── Analytics ──────────────────────────────────────────

export async function getDeliveryAnalytics(period?: {
  from: Date;
  to: Date;
}) {
  const dateFilter = period
    ? { completedAt: { gte: period.from, lte: period.to } }
    : {};

  const tasks = await prisma.deliveryTask.findMany({
    where: {
      status: "completed",
      ...dateFilter,
    },
    select: {
      distanceKm: true,
      totalTimeMin: true,
      totalCost: true,
      salaryTotal: true,
      fuelCost: true,
      timeAssembly: true,
      timeDisassembly: true,
      timeDriving: true,
      timeCarrying: true,
      type: true,
      completedAt: true,
    },
  });

  const count = tasks.length;
  if (count === 0) {
    return {
      count: 0,
      totalDistanceKm: 0,
      avgDistanceKm: 0,
      totalTimeMin: 0,
      avgTimeMin: 0,
      totalCost: 0,
      totalSalary: 0,
      totalFuel: 0,
      avgCostPerTask: 0,
      byType: {} as Record<string, number>,
    };
  }

  const totalDistanceKm = tasks.reduce((s, t) => s + (t.distanceKm ?? 0), 0);
  const totalTimeMin = tasks.reduce((s, t) => s + (t.totalTimeMin ?? 0), 0);
  const totalCost = tasks.reduce((s, t) => s + (t.totalCost ?? 0), 0);
  const totalSalary = tasks.reduce((s, t) => s + (t.salaryTotal ?? 0), 0);
  const totalFuel = tasks.reduce((s, t) => s + (t.fuelCost ?? 0), 0);

  const byType: Record<string, number> = {};
  for (const t of tasks) {
    byType[t.type] = (byType[t.type] ?? 0) + 1;
  }

  return {
    count,
    totalDistanceKm: Math.round(totalDistanceKm * 10) / 10,
    avgDistanceKm: Math.round((totalDistanceKm / count) * 10) / 10,
    totalTimeMin,
    avgTimeMin: Math.round(totalTimeMin / count),
    totalCost,
    totalSalary,
    totalFuel,
    avgCostPerTask: Math.round(totalCost / count),
    byType,
  };
}

export async function getDeliveryCostsTrend(months = 6) {
  const now = new Date();
  const results: {
    month: string;
    deliveryCost: number;
    assemblyCost: number;
    salary: number;
    count: number;
  }[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(
      now.getFullYear(),
      now.getMonth() - i + 1,
      0,
      23,
      59,
      59
    );

    const tasks = await prisma.deliveryTask.findMany({
      where: {
        status: "completed",
        completedAt: { gte: start, lte: end },
      },
      select: {
        totalCost: true,
        salaryTotal: true,
        timeAssembly: true,
        timeDisassembly: true,
      },
    });

    const deliveryCost = tasks.reduce((s, t) => s + (t.totalCost ?? 0), 0);
    const salary = tasks.reduce((s, t) => s + (t.salaryTotal ?? 0), 0);
    const assemblyCost = tasks
      .filter((t) => (t.timeAssembly ?? 0) > 0 || (t.timeDisassembly ?? 0) > 0)
      .reduce((s, t) => s + (t.salaryTotal ?? 0), 0);

    results.push({
      month: start.toLocaleDateString("ru-RU", {
        month: "short",
        year: "2-digit",
      }),
      deliveryCost,
      assemblyCost,
      salary,
      count: tasks.length,
    });
  }

  return results;
}

export async function getDeliveryHistory(rentalId: string) {
  return prisma.deliveryTask.findMany({
    where: { rentalId },
    include: TASK_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
}
