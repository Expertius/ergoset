import { prisma } from "@/lib/db";
import type {
  DealStatus,
  DealType,
  DeliveryTaskType,
  DeliveryTaskStatus,
} from "@/generated/prisma/browser";

export type CalendarDeliveryTask = {
  id: string;
  type: DeliveryTaskType;
  status: DeliveryTaskStatus;
  plannedAt: string | null;
  assignee: string | null;
  address: string | null;
  instructions: string | null;
};

export type CalendarEvent = {
  id: string;
  dealId: string;
  clientName: string;
  clientPhone: string | null;
  clientEmail: string | null;
  assetCode: string;
  assetName: string;
  startDate: string;
  endDate: string;
  dealStatus: DealStatus;
  dealType: DealType;
  rentAmount: number;
  deliveryAmount: number;
  assemblyAmount: number;
  depositAmount: number;
  discountAmount: number;
  totalPlannedAmount: number;
  plannedMonths: number | null;
  addressDelivery: string | null;
  addressPickup: string | null;
  deliveryInstructions: string | null;
  source: string | null;
  comment: string | null;
  deliveryTasks: CalendarDeliveryTask[];
};

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

export type CalendarFilters = {
  assetId?: string;
  clientId?: string;
  statuses?: DealStatus[];
  dealType?: DealType;
  search?: string;
};

export async function getCalendarEvents(
  from: Date,
  to: Date,
  filters?: CalendarFilters
) {
  const rentalWhere: Record<string, unknown> = {
    OR: [
      { startDate: { gte: from, lte: to } },
      { endDate: { gte: from, lte: to } },
      { startDate: { lte: from }, endDate: { gte: to } },
    ],
  };

  if (filters?.assetId) rentalWhere.assetId = filters.assetId;

  const dealWhere: Record<string, unknown> = {};
  if (filters?.clientId) dealWhere.clientId = filters.clientId;
  if (filters?.statuses?.length) dealWhere.status = { in: filters.statuses };
  if (filters?.dealType) dealWhere.type = filters.dealType;
  if (filters?.search) {
    dealWhere.client = {
      fullName: { contains: filters.search, mode: "insensitive" },
    };
  }
  if (Object.keys(dealWhere).length > 0) rentalWhere.deal = dealWhere;

  const rentals = await prisma.rental.findMany({
    where: rentalWhere,
    include: {
      asset: true,
      deal: { include: { client: true } },
      deliveryTasks: true,
    },
    orderBy: { startDate: "asc" },
  });

  return rentals.map((r): CalendarEvent => ({
    id: r.id,
    dealId: r.dealId,
    clientName: r.deal.client.fullName,
    clientPhone: r.deal.client.phone,
    clientEmail: r.deal.client.email,
    assetCode: r.asset.code,
    assetName: r.asset.name,
    startDate: r.startDate.toISOString(),
    endDate: r.endDate.toISOString(),
    dealStatus: r.deal.status,
    dealType: r.deal.type,
    rentAmount: r.rentAmount,
    deliveryAmount: r.deliveryAmount,
    assemblyAmount: r.assemblyAmount,
    depositAmount: r.depositAmount,
    discountAmount: r.discountAmount,
    totalPlannedAmount: r.totalPlannedAmount,
    plannedMonths: r.plannedMonths,
    addressDelivery: r.addressDelivery,
    addressPickup: r.addressPickup,
    deliveryInstructions: r.deliveryInstructions,
    source: r.deal.source,
    comment: r.deal.comment,
    deliveryTasks: r.deliveryTasks.map((t) => ({
      id: t.id,
      type: t.type,
      status: t.status,
      plannedAt: t.plannedAt?.toISOString() ?? null,
      assignee: t.assignee,
      address: t.address,
      instructions: t.instructions,
    })),
  }));
}
