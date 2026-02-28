import { prisma } from "@/lib/db";
import type { ClientCreateInput, ClientUpdateInput } from "@/domain/clients/validation";

export type ClientFilters = {
  search?: string;
  tag?: string;
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

  return prisma.client.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
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
