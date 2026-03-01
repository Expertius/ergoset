import { prisma } from "@/lib/db";

export async function getAssetReport() {
  const assets = await prisma.asset.findMany({
    where: { isActive: true },
    include: {
      rentals: {
        include: {
          deal: true,
          payments: { where: { status: "paid" } },
        },
      },
      expenses: true,
    },
    orderBy: { code: "asc" },
  });

  return assets.map((asset) => {
    const totalRevenue = asset.rentals.reduce(
      (sum, r) => sum + r.payments.reduce((s, p) => s + p.amount, 0),
      0
    );
    const totalExpenses = asset.expenses.reduce((s, e) => s + e.amount, 0);
    const purchasePrice = asset.purchasePrice || 0;

    let totalRentedDays = 0;
    let lastEndDate: Date | null = null;
    let totalDowntimeDays = 0;

    const sortedRentals = [...asset.rentals]
      .filter((r) => ["active", "extended", "closed_return", "closed_purchase"].includes(r.deal.status))
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    for (const rental of sortedRentals) {
      const end = rental.actualEndDate || rental.endDate;
      const now = new Date();
      const effectiveEnd = end > now ? now : end;
      const days = Math.max(
        0,
        Math.ceil(
          (effectiveEnd.getTime() - rental.startDate.getTime()) / (1000 * 60 * 60 * 24)
        )
      );
      totalRentedDays += days;

      if (lastEndDate) {
        const gap = Math.max(
          0,
          Math.ceil(
            (rental.startDate.getTime() - lastEndDate.getTime()) / (1000 * 60 * 60 * 24)
          )
        );
        totalDowntimeDays += gap;
      }
      lastEndDate = effectiveEnd;
    }

    if (
      lastEndDate &&
      asset.status === "available" &&
      sortedRentals.length > 0
    ) {
      const currentDowntime = Math.ceil(
        (Date.now() - lastEndDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      totalDowntimeDays += Math.max(0, currentDowntime);
    }

    const avgDailyRevenue =
      totalRentedDays > 0 ? totalRevenue / totalRentedDays : 0;
    const downtimeLoss = Math.round(avgDailyRevenue * totalDowntimeDays);

    const paybackPercent =
      purchasePrice > 0 ? Math.round((totalRevenue / purchasePrice) * 100) : 0;
    const paybackDaysLeft =
      avgDailyRevenue > 0 && purchasePrice > totalRevenue
        ? Math.ceil((purchasePrice - totalRevenue) / avgDailyRevenue)
        : 0;

    return {
      id: asset.id,
      code: asset.code,
      name: asset.name,
      status: asset.status,
      purchasePrice,
      totalRevenue,
      totalExpenses,
      profit: totalRevenue - totalExpenses,
      totalRentedDays,
      totalDowntimeDays,
      downtimeLoss,
      paybackPercent,
      paybackDaysLeft,
      rentalsCount: sortedRentals.length,
    };
  });
}

export async function getClientReport() {
  const clients = await prisma.client.findMany({
    include: {
      deals: {
        include: {
          payments: { where: { status: "paid" } },
          rentals: true,
        },
      },
    },
    orderBy: { fullName: "asc" },
  });

  return clients.map((client) => {
    const totalPaid = client.deals.reduce(
      (sum, d) => sum + d.payments.reduce((s, p) => s + p.amount, 0),
      0
    );
    const activeDeals = client.deals.filter((d) =>
      ["active", "extended", "booked", "delivery_scheduled", "delivered"].includes(d.status)
    ).length;
    const totalDeals = client.deals.length;
    const totalRentals = client.deals.reduce((s, d) => s + d.rentals.length, 0);

    return {
      id: client.id,
      fullName: client.fullName,
      phone: client.phone,
      totalPaid,
      totalDeals,
      activeDeals,
      totalRentals,
    };
  });
}

export async function getUtilizationReport(monthsBack: number = 6) {
  const clampedMonths = Math.min(monthsBack, 24);
  const now = new Date();
  const totalAssets = await prisma.asset.count({ where: { isActive: true } });

  const months = Array.from({ length: clampedMonths }, (_, idx) => {
    const i = clampedMonths - 1 - idx;
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    return { start, end };
  });

  const results = await Promise.all(
    months.map(async ({ start, end }) => {
      const [activeRentals, payments] = await Promise.all([
        prisma.rental.count({
          where: {
            deal: { status: { in: ["active", "extended"] } },
            startDate: { lte: end },
            endDate: { gte: start },
          },
        }),
        prisma.payment.aggregate({
          where: { status: "paid", date: { gte: start, lte: end } },
          _sum: { amount: true },
        }),
      ]);

      return {
        month: start.toLocaleDateString("ru-RU", { month: "short", year: "2-digit" }),
        utilization: totalAssets > 0 ? Math.round((activeRentals / totalAssets) * 100) : 0,
        revenue: payments._sum.amount || 0,
      };
    })
  );

  return results;
}
