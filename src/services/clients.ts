import { prisma } from "@/lib/db";
import type { ClientCreateInput, ClientUpdateInput } from "@/domain/clients/validation";

export type ClientFilters = {
  search?: string;
  tag?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export async function getClients(filters?: ClientFilters) {
  const where: Record<string, unknown> = {};

  if (filters?.search) {
    where.OR = [
      { fullName: { contains: filters.search, mode: "insensitive" } },
      { phone: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters?.tag) {
    where.tags = { has: filters.tag };
  }

  const sortField = filters?.sortBy || "createdAt";
  const sortDir = filters?.sortOrder || "desc";
  const validFields = ["createdAt", "fullName", "email", "phone"];
  const orderBy = validFields.includes(sortField)
    ? { [sortField]: sortDir }
    : { createdAt: "desc" as const };

  return prisma.client.findMany({ where, orderBy });
}

export async function getClientById(id: string) {
  return prisma.client.findUnique({
    where: { id },
    include: {
      deals: {
        include: {
          rentals: { include: { asset: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
}

export async function createClient(data: ClientCreateInput) {
  return prisma.client.create({
    data: {
      ...data,
      email: data.email || undefined,
    },
  });
}

export async function updateClient({ id, ...data }: ClientUpdateInput) {
  return prisma.client.update({
    where: { id },
    data: {
      ...data,
      email: data.email || undefined,
    },
  });
}
