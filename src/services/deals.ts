import { prisma } from "@/lib/db";
import type { DealStatus, DealType } from "@/generated/prisma/browser";
import type {
  DealQuickCreateInput,
  RentalExtendInput,
} from "@/domain/deals/validation";

export type DealFilters = {
  search?: string;
  status?: DealStatus;
  type?: DealType;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  createdById?: string;
};

const BLOCKING_STATUSES: DealStatus[] = [
  "booked",
  "delivery_scheduled",
  "delivered",
  "active",
  "extended",
  "return_scheduled",
];

export async function getDeals(filters?: DealFilters) {
  const where: Record<string, unknown> = {};

  if (filters?.createdById) where.createdById = filters.createdById;
  if (filters?.status) where.status = filters.status;
  if (filters?.type) where.type = filters.type;

  if (filters?.search) {
    where.client = {
      fullName: { contains: filters.search, mode: "insensitive" },
    };
  }

  const sortField = filters?.sortBy || "createdAt";
  const sortDir = filters?.sortOrder || "desc";
  const validFields = ["createdAt", "status", "type"];
  const orderBy = validFields.includes(sortField)
    ? { [sortField]: sortDir }
    : { createdAt: "desc" as const };

  return prisma.deal.findMany({
    where,
    include: {
      client: true,
      rentals: { include: { asset: true } },
      _count: { select: { payments: true } },
    },
    orderBy,
    take: 100,
  });
}

export async function getDealById(id: string) {
  return prisma.deal.findUnique({
    where: { id },
    include: {
      client: true,
      parentDeal: { include: { client: true } },
      childDeals: {
        include: { client: true, rentals: { include: { asset: true } } },
        orderBy: { createdAt: "asc" },
      },
      rentals: {
        include: {
          asset: true,
          periods: { orderBy: { periodNumber: "asc" } },
          accessories: { include: { accessory: true } },
          deliveryTasks: { orderBy: { createdAt: "desc" } },
        },
      },
      payments: { orderBy: { date: "desc" } },
      documents: { orderBy: { createdAt: "desc" } },
      expenses: { orderBy: { date: "desc" } },
    },
  });
}

export async function checkAssetConflict(
  assetId: string,
  startDate: Date,
  endDate: Date,
  excludeRentalId?: string
) {
  const conflicts = await prisma.rental.findMany({
    where: {
      assetId,
      ...(excludeRentalId ? { id: { not: excludeRentalId } } : {}),
      deal: { status: { in: BLOCKING_STATUSES } },
      startDate: { lt: endDate },
      endDate: { gt: startDate },
    },
    include: { deal: { include: { client: true } } },
  });
  return conflicts;
}

export async function createDealWithRental(data: DealQuickCreateInput) {
  const conflicts = await checkAssetConflict(
    data.assetId,
    data.startDate,
    data.endDate
  );
  if (conflicts.length > 0) {
    const c = conflicts[0];
    throw new Error(
      `Конфликт дат: станция занята клиентом ${c.deal.client.fullName} (${c.startDate.toLocaleDateString("ru")} — ${c.endDate.toLocaleDateString("ru")})`
    );
  }

  const totalPlanned =
    (data.rentAmount || 0) +
    (data.deliveryAmount || 0) +
    (data.assemblyAmount || 0) -
    (data.discountAmount || 0);

  return prisma.$transaction(async (tx) => {
    const deal = await tx.deal.create({
      data: {
        type: data.type,
        status: "booked",
        clientId: data.clientId,
        source: data.source,
        comment: data.comment,
      },
    });

    const rental = await tx.rental.create({
      data: {
        dealId: deal.id,
        assetId: data.assetId,
        startDate: data.startDate,
        endDate: data.endDate,
        plannedMonths: data.plannedMonths,
        rentAmount: data.rentAmount || 0,
        deliveryAmount: data.deliveryAmount || 0,
        assemblyAmount: data.assemblyAmount || 0,
        depositAmount: data.depositAmount || 0,
        discountAmount: data.discountAmount || 0,
        totalPlannedAmount: totalPlanned,
        addressDelivery: data.addressDelivery,
        addressPickup: data.addressPickup,
        notes: data.notes,
      },
    });

    await tx.rentalPeriod.create({
      data: {
        rentalId: rental.id,
        periodNumber: 1,
        startDate: data.startDate,
        endDate: data.endDate,
        amountRent: data.rentAmount || 0,
        amountDelivery: data.deliveryAmount || 0,
        amountAssembly: data.assemblyAmount || 0,
        amountDiscount: data.discountAmount || 0,
        amountTotal: totalPlanned,
        type: "first",
      },
    });

    await tx.asset.update({
      where: { id: data.assetId },
      data: { status: "reserved" },
    });

    // Reserve accessories
    if (data.accessories && data.accessories.length > 0) {
      for (const acc of data.accessories) {
        const item = await tx.inventoryItem.findFirst({
          where: { accessoryId: acc.accessoryId },
        });
        if (item) {
          const available = item.qtyOnHand - item.qtyReserved;
          if (available < acc.qty) {
            const accessory = await tx.accessory.findUnique({
              where: { id: acc.accessoryId },
            });
            throw new Error(
              `Недостаточно аксессуара "${accessory?.name || acc.accessoryId}": доступно ${available}, требуется ${acc.qty}`
            );
          }
          await tx.inventoryItem.update({
            where: { id: item.id },
            data: { qtyReserved: { increment: acc.qty } },
          });
        }

        await tx.rentalAccessoryLine.create({
          data: {
            rentalId: rental.id,
            accessoryId: acc.accessoryId,
            qty: acc.qty,
            price: acc.price,
            isIncluded: acc.isIncluded,
          },
        });

        await tx.inventoryMovement.create({
          data: {
            accessoryId: acc.accessoryId,
            type: "reserve",
            qty: acc.qty,
            relatedRentalId: rental.id,
            comment: "Автоматическое резервирование при создании аренды",
          },
        });
      }
    }

    return deal;
  });
}

export async function extendRental(data: RentalExtendInput) {
  const rental = await prisma.rental.findUnique({
    where: { id: data.rentalId },
    include: { deal: true, periods: { orderBy: { periodNumber: "desc" }, take: 1 } },
  });
  if (!rental) throw new Error("Аренда не найдена");

  if (data.newEndDate <= rental.endDate) {
    throw new Error("Новая дата окончания должна быть позже текущей");
  }

  const conflicts = await checkAssetConflict(
    rental.assetId,
    rental.endDate,
    data.newEndDate,
    rental.id
  );
  if (conflicts.length > 0) {
    throw new Error("Конфликт дат при продлении");
  }

  const lastPeriod = rental.periods[0];
  const nextNumber = lastPeriod ? lastPeriod.periodNumber + 1 : 2;
  const amountTotal =
    (data.amountRent || 0) + (data.amountDelivery || 0) - (data.amountDiscount || 0);

  return prisma.$transaction(async (tx) => {
    const extensionDeal = await tx.deal.create({
      data: {
        type: rental.deal.type,
        status: "active",
        clientId: rental.deal.clientId,
        parentDealId: rental.dealId,
        source: rental.deal.source,
        comment: data.comment,
      },
    });

    await tx.rentalPeriod.create({
      data: {
        rentalId: rental.id,
        periodNumber: nextNumber,
        startDate: rental.endDate,
        endDate: data.newEndDate,
        amountRent: data.amountRent || 0,
        amountDelivery: data.amountDelivery || 0,
        amountDiscount: data.amountDiscount || 0,
        amountTotal,
        type: "extension",
        comment: data.comment,
      },
    });

    await tx.rental.update({
      where: { id: rental.id },
      data: {
        endDate: data.newEndDate,
        rentAmount: { increment: data.amountRent || 0 },
        totalPlannedAmount: { increment: amountTotal },
      },
    });

    await tx.deal.update({
      where: { id: rental.dealId },
      data: { status: "extended" },
    });

    return extensionDeal;
  });
}

export async function closeRentalByReturn(rentalId: string) {
  const rental = await prisma.rental.findUnique({
    where: { id: rentalId },
    include: { deal: true },
  });
  if (!rental) throw new Error("Аренда не найдена");

  return prisma.$transaction(async (tx) => {
    await tx.rental.update({
      where: { id: rentalId },
      data: { actualEndDate: new Date(), closeReason: "return" },
    });

    await tx.deal.update({
      where: { id: rental.dealId },
      data: { status: "closed_return" },
    });

    await tx.asset.update({
      where: { id: rental.assetId },
      data: { status: "available" },
    });

    const accessories = await tx.rentalAccessoryLine.findMany({
      where: { rentalId },
    });

    if (accessories.length > 0) {
      const accIds = [...new Set(accessories.map((a) => a.accessoryId))];
      const items = await tx.inventoryItem.findMany({
        where: { accessoryId: { in: accIds } },
      });
      const itemMap = new Map(items.map((i) => [i.accessoryId, i]));

      const qtyByItem = new Map<string, number>();
      for (const acc of accessories) {
        const item = itemMap.get(acc.accessoryId);
        if (item) {
          qtyByItem.set(item.id, (qtyByItem.get(item.id) || 0) + acc.qty);
        }
      }

      await Promise.all(
        Array.from(qtyByItem.entries()).map(([itemId, qty]) =>
          tx.inventoryItem.update({
            where: { id: itemId },
            data: { qtyReserved: { decrement: qty } },
          })
        )
      );

      await tx.inventoryMovement.createMany({
        data: accessories.map((acc) => ({
          accessoryId: acc.accessoryId,
          type: "return_item" as const,
          qty: acc.qty,
          relatedRentalId: rentalId,
          comment: "Возврат при закрытии аренды",
        })),
      });
    }

    return rental;
  });
}

export async function closeRentalByBuyout(
  rentalId: string,
  purchaseAmount?: number
) {
  const rental = await prisma.rental.findUnique({
    where: { id: rentalId },
    include: { deal: true },
  });
  if (!rental) throw new Error("Аренда не найдена");

  return prisma.$transaction(async (tx) => {
    await tx.rental.update({
      where: { id: rentalId },
      data: {
        actualEndDate: new Date(),
        closeReason: "purchase",
        purchaseConversionAmount: purchaseAmount,
      },
    });

    await tx.deal.update({
      where: { id: rental.dealId },
      data: { status: "closed_purchase" },
    });

    await tx.asset.update({
      where: { id: rental.assetId },
      data: { status: "sold" },
    });

    return rental;
  });
}

export async function cancelDeal(dealId: string) {
  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    include: { rentals: true },
  });
  if (!deal) throw new Error("Сделка не найдена");

  return prisma.$transaction(async (tx) => {
    await tx.deal.update({
      where: { id: dealId },
      data: { status: "canceled" },
    });

    const assetIds = deal.rentals.map((r) => r.assetId);
    await tx.asset.updateMany({
      where: { id: { in: assetIds } },
      data: { status: "available" },
    });

    const rentalIds = deal.rentals.map((r) => r.id);
    const allAccessories = await tx.rentalAccessoryLine.findMany({
      where: { rentalId: { in: rentalIds } },
    });

    if (allAccessories.length > 0) {
      const accIds = [...new Set(allAccessories.map((a) => a.accessoryId))];
      const items = await tx.inventoryItem.findMany({
        where: { accessoryId: { in: accIds } },
      });
      const itemMap = new Map(items.map((i) => [i.accessoryId, i]));

      const qtyByItem = new Map<string, number>();
      for (const acc of allAccessories) {
        const item = itemMap.get(acc.accessoryId);
        if (item) {
          qtyByItem.set(item.id, (qtyByItem.get(item.id) || 0) + acc.qty);
        }
      }

      await Promise.all(
        Array.from(qtyByItem.entries()).map(([itemId, qty]) =>
          tx.inventoryItem.update({
            where: { id: itemId },
            data: { qtyReserved: { decrement: qty } },
          })
        )
      );
    }

    return deal;
  });
}

export async function activateDeal(dealId: string) {
  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    include: { rentals: true },
  });
  if (!deal) throw new Error("Сделка не найдена");

  return prisma.$transaction(async (tx) => {
    await tx.deal.update({
      where: { id: dealId },
      data: { status: "active" },
    });

    for (const rental of deal.rentals) {
      await tx.asset.update({
        where: { id: rental.assetId },
        data: { status: "rented" },
      });
    }

    return deal;
  });
}

export async function getUpcomingReturns(daysAhead: number = 7) {
  const now = new Date();
  const until = new Date();
  until.setDate(until.getDate() + daysAhead);

  return prisma.rental.findMany({
    where: {
      deal: { status: { in: ["active", "extended"] } },
      endDate: { gte: now, lte: until },
      actualEndDate: null,
    },
    include: {
      asset: true,
      deal: { include: { client: true } },
    },
    orderBy: { endDate: "asc" },
  });
}

export async function getIdleAssets(idleDaysThreshold: number = 14) {
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - idleDaysThreshold);

  const assets = await prisma.asset.findMany({
    where: {
      status: "available",
      isActive: true,
    },
    include: {
      rentals: {
        where: { actualEndDate: { not: null } },
        orderBy: { actualEndDate: "desc" },
        take: 1,
      },
    },
  });

  return assets.filter((a) => {
    if (a.rentals.length === 0) return true;
    const lastEnd = a.rentals[0].actualEndDate!;
    return lastEnd < threshold;
  });
}
