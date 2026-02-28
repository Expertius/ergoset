import { prisma } from "@/lib/db";

export async function getDashboardStats() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const in7days = new Date();
  in7days.setDate(in7days.getDate() + 7);

  const [
    totalAssets,
    availableAssets,
    rentedAssets,
    reservedAssets,
    maintenanceAssets,
    totalClients,
    upcomingReturns,
    revenueMTD,
    expensesMTD,
  ] = await Promise.all([
    prisma.asset.count({ where: { isActive: true } }),
    prisma.asset.count({ where: { status: "available", isActive: true } }),
    prisma.asset.count({ where: { status: "rented", isActive: true } }),
    prisma.asset.count({ where: { status: "reserved", isActive: true } }),
    prisma.asset.count({ where: { status: "maintenance", isActive: true } }),
    prisma.client.count(),
    prisma.rental.findMany({
      where: {
        deal: { status: { in: ["active", "extended"] } },
        endDate: { gte: now, lte: in7days },
        actualEndDate: null,
      },
      include: {
        asset: true,
        deal: { include: { client: true } },
      },
      orderBy: { endDate: "asc" },
    }),
    prisma.payment.aggregate({
      where: { status: "paid", date: { gte: monthStart } },
      _sum: { amount: true },
    }),
    prisma.expense.aggregate({
      where: { date: { gte: monthStart } },
      _sum: { amount: true },
    }),
  ]);

  const revenue = revenueMTD._sum.amount || 0;
  const expenses = expensesMTD._sum.amount || 0;
  const utilization =
    totalAssets > 0
      ? Math.round(((rentedAssets + reservedAssets) / totalAssets) * 100)
      : 0;

  return {
    totalAssets,
    availableAssets,
    rentedAssets,
    reservedAssets,
    maintenanceAssets,
    totalClients,
    upcomingReturns,
    revenueMTD: revenue,
    expensesMTD: expenses,
    profitMTD: revenue - expenses,
    utilization,
  };
}

export async function getCalendarEvents(
  from: Date,
  to: Date,
  filters?: { assetId?: string; clientId?: string }
) {
  const rentalWhere: Record<string, unknown> = {
    OR: [
      { startDate: { gte: from, lte: to } },
      { endDate: { gte: from, lte: to } },
      { startDate: { lte: from }, endDate: { gte: to } },
    ],
  };

  if (filters?.assetId) rentalWhere.assetId = filters.assetId;
  if (filters?.clientId) {
    rentalWhere.deal = { clientId: filters.clientId };
  }

  const rentals = await prisma.rental.findMany({
    where: rentalWhere,
    include: {
      asset: true,
      deal: { include: { client: true } },
      deliveryTasks: true,
    },
    orderBy: { startDate: "asc" },
  });

  return rentals.map((r) => ({
    id: r.id,
    dealId: r.dealId,
    assetCode: r.asset.code,
    assetName: r.asset.name,
    clientName: r.deal.client.fullName,
    startDate: r.startDate,
    endDate: r.endDate,
    dealStatus: r.deal.status,
    deliveryTasks: r.deliveryTasks,
  }));
}
