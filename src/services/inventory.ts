import { prisma } from "@/lib/db";
import type { InventoryAdjustInput } from "@/domain/inventory/validation";

export async function getInventoryOverview() {
  return prisma.inventoryItem.findMany({
    include: {
      accessory: true,
    },
    orderBy: { accessory: { name: "asc" } },
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
