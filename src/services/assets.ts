import { prisma } from "@/lib/db";
import type { AssetStatus } from "@/generated/prisma/browser";
import type { AssetCreateInput, AssetUpdateInput } from "@/domain/assets/validation";

export type AssetFilters = {
  search?: string;
  status?: AssetStatus;
};

export async function getAssets(filters?: AssetFilters) {
  const where: Record<string, unknown> = { isActive: true };

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { code: { contains: filters.search, mode: "insensitive" } },
      { color: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return prisma.asset.findMany({
    where,
    orderBy: { code: "asc" },
  });
}

export async function getAssetById(id: string) {
  return prisma.asset.findUnique({
    where: { id },
    include: {
      rentals: {
        include: { deal: { include: { client: true } } },
        orderBy: { startDate: "desc" },
        take: 10,
      },
    },
  });
}

export async function createAsset(data: AssetCreateInput) {
  return prisma.asset.create({ data });
}

export async function updateAsset({ id, ...data }: AssetUpdateInput) {
  return prisma.asset.update({ where: { id }, data });
}

export async function deleteAsset(id: string) {
  return prisma.asset.update({
    where: { id },
    data: { isActive: false },
  });
}
