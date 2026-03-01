import { prisma } from "@/lib/db";
import type { InventoryAdjustInput } from "@/domain/inventory/validation";

export type InventoryFilters = {
  search?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export async function getInventoryOverview(filters?: InventoryFilters) {
  const where: Record<string, unknown> = {};

  if (filters?.search || filters?.category) {
    const accessoryWhere: Record<string, unknown> = {};
    if (filters.search) {
      accessoryWhere.name = { contains: filters.search, mode: "insensitive" };
    }
    if (filters.category) {
      accessoryWhere.category = filters.category;
    }
    where.accessory = accessoryWhere;
  }

  return prisma.inventoryItem.findMany({
    where,
    include: { accessory: true },
    orderBy: { accessory: { name: filters?.sortOrder || "asc" } },
  });
}

export async function getMovements(accessoryId?: string) {
  const where = accessoryId ? { accessoryId } : {};
  return prisma.inventoryMovement.findMany({
    where,
    include: { accessory: true },
    orderBy: { date: "desc" },
    take: 50,
  });
}

export async function adjustInventory(data: InventoryAdjustInput) {
  const { accessoryId, type, qty, location, comment } = data;

  await prisma.inventoryMovement.create({
    data: {
      accessoryId,
      type,
      qty,
      locationTo: type === "incoming" ? location : undefined,
      locationFrom: ["issue", "writeoff", "lost"].includes(type) ? location : undefined,
      comment,
    },
  });

  const item = await prisma.inventoryItem.upsert({
    where: { accessoryId_location: { accessoryId, location } },
    create: {
      accessoryId,
      location,
      qtyOnHand: type === "incoming" ? qty : 0,
      qtyReserved: type === "reserve" ? qty : 0,
    },
    update: {},
  });

  let qtyDelta = 0;
  let reserveDelta = 0;

  switch (type) {
    case "incoming":
    case "return_item":
      qtyDelta = qty;
      break;
    case "writeoff":
    case "lost":
    case "issue":
      qtyDelta = -qty;
      break;
    case "reserve":
      reserveDelta = qty;
      break;
    case "repair":
      qtyDelta = -qty;
      break;
  }

  return prisma.inventoryItem.update({
    where: { id: item.id },
    data: {
      qtyOnHand: { increment: qtyDelta },
      qtyReserved: { increment: reserveDelta },
    },
  });
}
