import { prisma } from "@/lib/db";

export async function getManagerDashboardData(userId: string) {
  const now = new Date();
  const in7days = new Date();
  in7days.setDate(in7days.getDate() + 7);

  const [myDealsCount, myActiveDeals, myNewLeads, myUpcomingReturns] =
    await Promise.all([
      prisma.deal.count({ where: { createdById: userId } }),
      prisma.deal.count({
        where: {
          createdById: userId,
          status: { in: ["active", "extended", "booked", "delivery_scheduled", "delivered"] },
        },
      }),
      prisma.lead.count({
        where: { assignedToId: userId, status: "new" },
      }),
      prisma.rental.findMany({
        where: {
          deal: {
            createdById: userId,
            status: { in: ["active", "extended"] },
          },
          endDate: { gte: now, lte: in7days },
          actualEndDate: null,
        },
        include: {
          asset: { select: { code: true, name: true } },
          deal: { include: { client: { select: { fullName: true } } } },
        },
        orderBy: { endDate: "asc" },
      }),
    ]);

  return {
    myDealsCount,
    myActiveDeals,
    myNewLeads,
    myUpcomingReturns,
  };
}

export async function getLogisticsDashboardData() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);
  const weekEnd = new Date(todayStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const [
    todayTasks,
    weekTasks,
    inProgressTasks,
    totalAssets,
    rentedAssets,
    availableAssets,
    maintenanceAssets,
  ] = await Promise.all([
    prisma.deliveryTask.count({
      where: {
        plannedAt: { gte: todayStart, lt: todayEnd },
        status: { in: ["planned", "in_progress"] },
      },
    }),
    prisma.deliveryTask.count({
      where: {
        plannedAt: { gte: todayStart, lt: weekEnd },
        status: { in: ["planned", "in_progress"] },
      },
    }),
    prisma.deliveryTask.findMany({
      where: { status: "in_progress" },
      include: {
        rental: {
          include: {
            asset: { select: { code: true, name: true } },
            deal: { include: { client: { select: { fullName: true } } } },
          },
        },
      },
      orderBy: { plannedAt: "asc" },
      take: 10,
    }),
    prisma.asset.count({ where: { isActive: true } }),
    prisma.asset.count({ where: { status: "rented", isActive: true } }),
    prisma.asset.count({ where: { status: "available", isActive: true } }),
    prisma.asset.count({ where: { status: "maintenance", isActive: true } }),
  ]);

  return {
    todayTasks,
    weekTasks,
    inProgressTasks,
    totalAssets,
    rentedAssets,
    availableAssets,
    maintenanceAssets,
  };
}
