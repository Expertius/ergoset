import { prisma } from "@/lib/db";
import type { AccessoryCategory } from "@/generated/prisma/browser";
import type { AccessoryCreateInput, AccessoryUpdateInput } from "@/domain/accessories/validation";

export type AccessoryFilters = {
  search?: string;
  category?: AccessoryCategory;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export async function getAccessories(filters?: AccessoryFilters) {
  const where: Record<string, unknown> = { isActive: true };

  if (filters?.category) {
    where.category = filters.category;
  }

  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { sku: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const sortField = filters?.sortBy || "name";
  const sortDir = filters?.sortOrder || "asc";
  const validFields = ["name", "sku", "category", "retailPrice"];
  const orderBy = validFields.includes(sortField)
    ? { [sortField]: sortDir }
    : { name: "asc" as const };

  return prisma.accessory.findMany({
    where,
    include: { inventoryItems: true },
    orderBy,
  });
}

export async function getAccessoryById(id: string) {
  return prisma.accessory.findUnique({
    where: { id },
    include: {
      inventoryItems: true,
      movements: { orderBy: { date: "desc" }, take: 20 },
    },
  });
}

export async function createAccessory(data: AccessoryCreateInput) {
  const accessory = await prisma.accessory.create({ data });
  await prisma.inventoryItem.create({
    data: {
      accessoryId: accessory.id,
      location: "warehouse",
      qtyOnHand: 0,
      qtyReserved: 0,
    },
  });
  return accessory;
}

export async function updateAccessory({ id, ...data }: AccessoryUpdateInput) {
  return prisma.accessory.update({ where: { id }, data });
}

export async function deleteAccessory(id: string) {
  return prisma.accessory.update({
    where: { id },
    data: { isActive: false },
  });
}
