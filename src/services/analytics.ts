import { prisma } from "@/lib/db";

// ─── Revenue / Expense Trend (monthly) ─────────────────

export async function getRevenueExpenseTrend(months = 6) {
  const now = new Date();
  const results: {
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

    const [rev, exp] = await Promise.all([
      prisma.payment.aggregate({
        where: { status: "paid", date: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: { date: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
    ]);

    const revenue = rev._sum.amount ?? 0;
    const expenses = exp._sum.amount ?? 0;

    results.push({
      month: start.toLocaleDateString("ru-RU", { month: "short", year: "2-digit" }),
      revenue,
      expenses,
      profit: revenue - expenses,
    });
  }

  return results;
}

// ─── Revenue breakdown by PaymentKind ───────────────────

const KIND_LABELS: Record<string, string> = {
  rent: "Аренда",
  delivery: "Доставка",
  assembly: "Сборка",
  deposit: "Залог",
  sale: "Продажа",
  refund: "Возврат",
  penalty: "Штраф",
  discount_adjustment: "Корректировка",
};

export async function getRevenueByKind(period?: { from: Date; to: Date }) {
  const dateFilter = period ? { date: { gte: period.from, lte: period.to } } : {};

  const payments = await prisma.payment.groupBy({
    by: ["kind"],
    where: { status: "paid", ...dateFilter },
    _sum: { amount: true },
  });

  return payments
    .map((p) => ({
      name: KIND_LABELS[p.kind] ?? p.kind,
      value: p._sum.amount ?? 0,
      kind: p.kind,
    }))
    .filter((p) => p.value > 0)
    .sort((a, b) => b.value - a.value);
}

// ─── Expenses breakdown by category ─────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  asset_purchase: "Закупка станций",
  accessory_purchase: "Аксессуары",
  delivery_cost: "Доставка",
  assembly_cost: "Сборка",
  repair: "Ремонт",
  tax: "Налоги",
  ads: "Реклама",
  other: "Прочее",
};

export async function getExpensesByCategory(period?: { from: Date; to: Date }) {
  const dateFilter = period ? { date: { gte: period.from, lte: period.to } } : {};

  const expenses = await prisma.expense.groupBy({
    by: ["category"],
    where: dateFilter,
    _sum: { amount: true },
  });

  return expenses
    .map((e) => ({
      name: CATEGORY_LABELS[e.category] ?? e.category,
      value: e._sum.amount ?? 0,
      category: e.category,
    }))
    .filter((e) => e.value > 0)
    .sort((a, b) => b.value - a.value);
}

// ─── Financial KPIs ─────────────────────────────────────

export async function getFinancialKPIs(period?: { from: Date; to: Date }) {
  const dateFilter = period ? { date: { gte: period.from, lte: period.to } } : {};

  const [revAgg, expAgg, dealCount, totalAssetValue, totalAssets] =
    await Promise.all([
      prisma.payment.aggregate({
        where: { status: "paid", ...dateFilter },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.expense.aggregate({
        where: dateFilter,
        _sum: { amount: true },
      }),
      prisma.deal.count({
        where: period
          ? { createdAt: { gte: period.from, lte: period.to } }
          : undefined,
      }),
      prisma.asset.aggregate({
        where: { isActive: true },
        _sum: { purchasePrice: true },
      }),
      prisma.asset.count({ where: { isActive: true } }),
    ]);

  const revenue = revAgg._sum.amount ?? 0;
  const expenses = expAgg._sum.amount ?? 0;
  const profit = revenue - expenses;
  const assetValue = totalAssetValue._sum.purchasePrice ?? 0;

  const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;
  const avgCheck = dealCount > 0 ? Math.round(revenue / dealCount) : 0;
  const capitalTurnover = assetValue > 0 ? +(revenue / assetValue).toFixed(2) : 0;
  const revenuePerAsset = totalAssets > 0 ? Math.round(revenue / totalAssets) : 0;

  return {
    revenue,
    expenses,
    profit,
    margin,
    avgCheck,
    capitalTurnover,
    revenuePerAsset,
    dealCount,
    paymentCount: revAgg._count,
    assetValue,
  };
}

// ─── Financial KPIs excluding delivery/assembly ─────────

export async function getDeliveryAssemblyCosts(period?: { from: Date; to: Date }) {
  const dateFilter = period ? { date: { gte: period.from, lte: period.to } } : {};

  const [deliveryExpenses, deliveryPayments] = await Promise.all([
    prisma.expense.aggregate({
      where: {
        category: { in: ["delivery_cost", "assembly_cost"] },
        ...dateFilter,
      },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: {
        status: "paid",
        kind: { in: ["delivery", "assembly"] },
        ...dateFilter,
      },
      _sum: { amount: true },
    }),
  ]);

  return {
    expenses: deliveryExpenses._sum.amount ?? 0,
    income: deliveryPayments._sum.amount ?? 0,
  };
}

// ─── Period comparison (current month vs previous) ──────

export async function getPeriodComparison() {
  const now = new Date();
  const curStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const curEnd = now;
  const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [cur, prev, curDeals, prevDeals, curRented, prevRented, totalAssets] =
    await Promise.all([
      getFinancialKPIs({ from: curStart, to: curEnd }),
      getFinancialKPIs({ from: prevStart, to: prevEnd }),
      prisma.deal.count({
        where: { createdAt: { gte: curStart, lte: curEnd } },
      }),
      prisma.deal.count({
        where: { createdAt: { gte: prevStart, lte: prevEnd } },
      }),
      prisma.rental.count({
        where: {
          deal: { status: { in: ["active", "extended"] } },
          startDate: { lte: curEnd },
          endDate: { gte: curStart },
        },
      }),
      prisma.rental.count({
        where: {
          deal: { status: { in: ["active", "extended"] } },
          startDate: { lte: prevEnd },
          endDate: { gte: prevStart },
        },
      }),
      prisma.asset.count({ where: { isActive: true } }),
    ]);

  const delta = (cur: number, prev: number) =>
    prev === 0 ? (cur > 0 ? 100 : 0) : Math.round(((cur - prev) / prev) * 100);

  const curUtil = totalAssets > 0 ? Math.round((curRented / totalAssets) * 100) : 0;
  const prevUtil = totalAssets > 0 ? Math.round((prevRented / totalAssets) * 100) : 0;

  return {
    revenue: { current: cur.revenue, previous: prev.revenue, delta: delta(cur.revenue, prev.revenue) },
    expenses: { current: cur.expenses, previous: prev.expenses, delta: delta(cur.expenses, prev.expenses) },
    profit: { current: cur.profit, previous: prev.profit, delta: delta(cur.profit, prev.profit) },
    deals: { current: curDeals, previous: prevDeals, delta: delta(curDeals, prevDeals) },
    utilization: { current: curUtil, previous: prevUtil, delta: curUtil - prevUtil },
    margin: { current: cur.margin, previous: prev.margin, delta: cur.margin - prev.margin },
    avgCheck: { current: cur.avgCheck, previous: prev.avgCheck, delta: delta(cur.avgCheck, prev.avgCheck) },
  };
}

// ─── Deals funnel ───────────────────────────────────────

const STATUS_ORDER: string[] = [
  "lead", "booked", "delivery_scheduled", "delivered",
  "active", "extended", "return_scheduled",
  "closed_return", "closed_purchase", "canceled",
];

const STATUS_LABELS: Record<string, string> = {
  lead: "Лид",
  booked: "Бронь",
  delivery_scheduled: "Доставка",
  delivered: "Доставлено",
  active: "Активна",
  extended: "Продлено",
  return_scheduled: "Возврат",
  closed_return: "Закрыто (возврат)",
  closed_purchase: "Закрыто (выкуп)",
  canceled: "Отменено",
};

export async function getDealsFunnel() {
  const groups = await prisma.deal.groupBy({
    by: ["status"],
    _count: true,
  });

  const map = new Map(groups.map((g) => [g.status, g._count]));

  return STATUS_ORDER.map((s) => ({
    status: s,
    label: STATUS_LABELS[s] ?? s,
    count: map.get(s as never) ?? 0,
  })).filter((s) => s.count > 0);
}

// ─── Top assets by revenue ──────────────────────────────

export async function getTopAssetsByRevenue(limit = 5) {
  const results = await prisma.$queryRaw<
    { id: string; code: string; name: string; revenue: bigint }[]
  >`
    SELECT a.id, a.code, a.name, COALESCE(SUM(p.amount), 0) AS revenue
    FROM assets a
    LEFT JOIN rentals r ON r."assetId" = a.id
    LEFT JOIN payments p ON p."rentalId" = r.id AND p.status = 'paid'
    WHERE a."isActive" = true
    GROUP BY a.id, a.code, a.name
    ORDER BY revenue DESC
    LIMIT ${limit}
  `;

  return results.map((r) => ({
    id: r.id,
    code: r.code,
    name: r.name,
    revenue: Number(r.revenue),
  }));
}

// ─── Top clients by revenue ─────────────────────────────

export async function getTopClientsByRevenue(limit = 5) {
  const results = await prisma.$queryRaw<
    { id: string; name: string; revenue: bigint; deals_count: bigint }[]
  >`
    SELECT c.id, c."fullName" AS name,
           COALESCE(SUM(p.amount), 0) AS revenue,
           COUNT(DISTINCT d.id) AS deals_count
    FROM clients c
    LEFT JOIN deals d ON d."clientId" = c.id
    LEFT JOIN payments p ON p."dealId" = d.id AND p.status = 'paid'
    GROUP BY c.id, c."fullName"
    ORDER BY revenue DESC
    LIMIT ${limit}
  `;

  return results.map((r) => ({
    id: r.id,
    name: r.name,
    revenue: Number(r.revenue),
    dealsCount: Number(r.deals_count),
  }));
}
