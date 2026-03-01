import { prisma } from "@/lib/db";

export async function getClientByUserId(userId: string) {
  return prisma.client.findUnique({
    where: { userId },
  });
}

export async function getClientRentals(clientId: string) {
  return prisma.rental.findMany({
    where: { deal: { clientId } },
    include: {
      asset: { select: { id: true, code: true, name: true, brand: true, model: true } },
      deal: { select: { id: true, status: true, type: true } },
      deliveryTasks: {
        select: {
          id: true,
          type: true,
          status: true,
          plannedAt: true,
          address: true,
          completedAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { startDate: "desc" },
  });
}

export async function getClientRentalById(clientId: string, rentalId: string) {
  const rental = await prisma.rental.findFirst({
    where: { id: rentalId, deal: { clientId } },
    include: {
      asset: { select: { id: true, code: true, name: true, brand: true, model: true, type: true } },
      deal: { select: { id: true, status: true, type: true } },
      periods: { orderBy: { periodNumber: "asc" } },
      accessories: {
        include: { accessory: { select: { id: true, name: true, sku: true } } },
      },
      deliveryTasks: {
        select: {
          id: true,
          type: true,
          status: true,
          plannedAt: true,
          address: true,
          completedAt: true,
          comment: true,
        },
        orderBy: { createdAt: "desc" },
      },
      documents: {
        select: { id: true, type: true, status: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return rental;
}

export async function getClientPayments(clientId: string) {
  return prisma.payment.findMany({
    where: { deal: { clientId } },
    include: {
      deal: { select: { id: true, type: true } },
      rental: { select: { id: true, asset: { select: { code: true, name: true } } } },
    },
    orderBy: { date: "desc" },
  });
}

export async function getClientDocuments(clientId: string) {
  return prisma.document.findMany({
    where: { deal: { clientId } },
    include: {
      deal: { select: { id: true, type: true } },
      rental: { select: { id: true, asset: { select: { code: true, name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getClientDashboardData(clientId: string) {
  const [activeRentals, upcomingPayments, recentDocuments] = await Promise.all([
    prisma.rental.findMany({
      where: {
        deal: {
          clientId,
          status: { in: ["active", "extended", "booked", "delivery_scheduled", "delivered"] },
        },
        actualEndDate: null,
      },
      include: {
        asset: { select: { code: true, name: true, brand: true } },
        deal: { select: { status: true } },
        deliveryTasks: {
          where: { status: { in: ["planned", "in_progress"] } },
          select: { type: true, status: true, plannedAt: true },
          orderBy: { plannedAt: "asc" },
          take: 1,
        },
      },
      orderBy: { endDate: "asc" },
    }),
    prisma.payment.findMany({
      where: {
        deal: { clientId },
        status: { in: ["planned", "partially_paid"] },
      },
      include: {
        rental: { select: { asset: { select: { code: true, name: true } } } },
      },
      orderBy: { date: "asc" },
      take: 5,
    }),
    prisma.document.findMany({
      where: { deal: { clientId } },
      include: {
        rental: { select: { asset: { select: { code: true, name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return { activeRentals, upcomingPayments, recentDocuments };
}

export async function updateClientProfile(
  clientId: string,
  data: { phone?: string; email?: string; actualAddress?: string }
) {
  return prisma.client.update({
    where: { id: clientId },
    data,
  });
}
