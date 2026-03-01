import { prisma } from "@/lib/db";
import type { PaymentStatus, PaymentKind } from "@/generated/prisma/browser";
import type {
  PaymentCreateInput,
  PaymentUpdateInput,
  ExpenseCreateInput,
  ExpenseUpdateInput,
} from "@/domain/payments/validation";

export type PaymentFilters = {
  search?: string;
  status?: PaymentStatus;
  kind?: PaymentKind;
  dealId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export async function getPayments(filters?: PaymentFilters) {
  const where: Record<string, unknown> = {};
  if (filters?.status) where.status = filters.status;
  if (filters?.kind) where.kind = filters.kind;
  if (filters?.dealId) where.dealId = filters.dealId;

  if (filters?.search) {
    where.deal = {
      client: {
        fullName: { contains: filters.search, mode: "insensitive" },
      },
    };
  }

  const sortField = filters?.sortBy || "date";
  const sortDir = filters?.sortOrder || "desc";
  const validFields = ["date", "amount", "status", "kind"];
  const orderBy = validFields.includes(sortField)
    ? { [sortField]: sortDir }
    : { date: "desc" as const };

  return prisma.payment.findMany({
    where,
    include: {
      deal: { include: { client: true } },
      rental: { include: { asset: true } },
    },
    orderBy,
    take: 200,
  });
}

export async function getPaymentById(id: string) {
  return prisma.payment.findUnique({
    where: { id },
    include: {
      deal: { include: { client: true } },
      rental: { include: { asset: true } },
    },
  });
}

export async function createPayment(data: PaymentCreateInput) {
  return prisma.payment.create({
    data: {
      ...data,
      taxReceiptUrl: data.taxReceiptUrl || undefined,
      rentalId: data.rentalId || undefined,
    },
  });
}

export async function updatePayment({ id, ...data }: PaymentUpdateInput) {
  return prisma.payment.update({ where: { id }, data });
}

export async function deletePayment(id: string) {
  return prisma.payment.delete({ where: { id } });
}

// Expenses

export type ExpenseFilters = {
  category?: string;
  assetId?: string;
};

export async function getExpenses(filters?: ExpenseFilters) {
  const where: Record<string, unknown> = {};
  if (filters?.category) where.category = filters.category;
  if (filters?.assetId) where.assetId = filters.assetId;

  return prisma.expense.findMany({
    where,
    include: { asset: true, deal: { include: { client: true } } },
    orderBy: { date: "desc" },
    take: 200,
  });
}

export async function createExpense(data: ExpenseCreateInput) {
  return prisma.expense.create({
    data: {
      ...data,
      assetId: data.assetId || undefined,
      dealId: data.dealId || undefined,
    },
  });
}

export async function updateExpense({ id, ...data }: ExpenseUpdateInput) {
  return prisma.expense.update({ where: { id }, data });
}

export async function deleteExpense(id: string) {
  return prisma.expense.delete({ where: { id } });
}

// Finance summaries

export async function getFinanceSummary(period?: { from: Date; to: Date }) {
  const dateFilter = period
    ? { date: { gte: period.from, lte: period.to } }
    : {};

  const [payments, expenses] = await Promise.all([
    prisma.payment.findMany({
      where: { status: "paid", ...dateFilter },
      select: { amount: true, kind: true },
    }),
    prisma.expense.findMany({
      where: dateFilter,
      select: { amount: true, category: true },
    }),
  ]);

  const totalIncome = payments.reduce((s, p) => s + p.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const rentIncome = payments
    .filter((p) => p.kind === "rent")
    .reduce((s, p) => s + p.amount, 0);
  const deliveryIncome = payments
    .filter((p) => p.kind === "delivery")
    .reduce((s, p) => s + p.amount, 0);
  const saleIncome = payments
    .filter((p) => p.kind === "sale")
    .reduce((s, p) => s + p.amount, 0);

  return {
    totalIncome,
    totalExpenses,
    profit: totalIncome - totalExpenses,
    rentIncome,
    deliveryIncome,
    saleIncome,
  };
}
