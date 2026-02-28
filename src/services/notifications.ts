import { prisma } from "@/lib/db";

export type Notification = {
  id: string;
  type:
    | "return_7d"
    | "return_3d"
    | "return_today"
    | "asset_free"
    | "asset_idle"
    | "accessory_shortage"
    | "unpaid_payment";
  title: string;
  message: string;
  severity: "info" | "warning" | "critical";
  entityType?: string;
  entityId?: string;
  createdAt: Date;
};

export async function getNotifications(): Promise<Notification[]> {
  const notifications: Notification[] = [];
  const now = new Date();

  // 1. Upcoming returns (7/3/1 days)
  const in7days = new Date();
  in7days.setDate(in7days.getDate() + 7);

  const upcomingRentals = await prisma.rental.findMany({
    where: {
      deal: { status: { in: ["active", "extended"] } },
      endDate: { gte: now, lte: in7days },
      actualEndDate: null,
    },
    include: { asset: true, deal: { include: { client: true } } },
    orderBy: { endDate: "asc" },
  });

  for (const r of upcomingRentals) {
    const daysLeft = Math.ceil(
      (r.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    let type: Notification["type"];
    let severity: Notification["severity"];

    if (daysLeft <= 0) {
      type = "return_today";
      severity = "critical";
    } else if (daysLeft <= 3) {
      type = "return_3d";
      severity = "warning";
    } else {
      type = "return_7d";
      severity = "info";
    }

    notifications.push({
      id: `return-${r.id}`,
      type,
      title: `Возврат ${daysLeft <= 0 ? "сегодня" : `через ${daysLeft} дн.`}`,
      message: `${r.deal.client.fullName} — ${r.asset.code} (${r.asset.name})`,
      severity,
      entityType: "rental",
      entityId: r.dealId,
      createdAt: now,
    });
  }

  // 2. Idle assets (> 14 days without rental)
  const idleThreshold = new Date();
  idleThreshold.setDate(idleThreshold.getDate() - 14);

  const freeAssets = await prisma.asset.findMany({
    where: { status: "available", isActive: true },
    include: {
      rentals: {
        where: { actualEndDate: { not: null } },
        orderBy: { actualEndDate: "desc" },
        take: 1,
      },
    },
  });

  for (const a of freeAssets) {
    if (a.rentals.length === 0) {
      notifications.push({
        id: `idle-${a.id}`,
        type: "asset_idle",
        title: "Станция никогда не арендовалась",
        message: `${a.code} — ${a.name}`,
        severity: "warning",
        entityType: "asset",
        entityId: a.id,
        createdAt: now,
      });
    } else {
      const lastEnd = a.rentals[0].actualEndDate!;
      if (lastEnd < idleThreshold) {
        const idleDays = Math.ceil(
          (now.getTime() - lastEnd.getTime()) / (1000 * 60 * 60 * 24)
        );
        notifications.push({
          id: `idle-${a.id}`,
          type: "asset_idle",
          title: `Простой ${idleDays} дн.`,
          message: `${a.code} — ${a.name}`,
          severity: idleDays > 30 ? "critical" : "warning",
          entityType: "asset",
          entityId: a.id,
          createdAt: now,
        });
      } else {
        notifications.push({
          id: `free-${a.id}`,
          type: "asset_free",
          title: "Станция свободна",
          message: `${a.code} — ${a.name}`,
          severity: "info",
          entityType: "asset",
          entityId: a.id,
          createdAt: now,
        });
      }
    }
  }

  // 3. Accessory shortages (qtyAvailable <= 0)
  const lowStock = await prisma.inventoryItem.findMany({
    where: {
      accessory: { isActive: true },
    },
    include: { accessory: true },
  });

  for (const item of lowStock) {
    const available = item.qtyOnHand - item.qtyReserved;
    if (available <= 0) {
      notifications.push({
        id: `shortage-${item.id}`,
        type: "accessory_shortage",
        title: "Нехватка аксессуара",
        message: `${item.accessory.name} — доступно: ${available} (на складе: ${item.qtyOnHand}, резерв: ${item.qtyReserved})`,
        severity: "critical",
        entityType: "accessory",
        entityId: item.accessoryId,
        createdAt: now,
      });
    }
  }

  // 4. Unpaid planned payments
  const unpaidPayments = await prisma.payment.findMany({
    where: {
      status: "planned",
      date: { lte: now },
    },
    include: { deal: { include: { client: true } } },
  });

  for (const p of unpaidPayments) {
    notifications.push({
      id: `unpaid-${p.id}`,
      type: "unpaid_payment",
      title: "Неоплаченный платёж",
      message: `${p.deal.client.fullName} — ${(p.amount / 100).toLocaleString("ru-RU")} ₽`,
      severity: "warning",
      entityType: "payment",
      entityId: p.dealId,
      createdAt: now,
    });
  }

  // Sort: critical first, then warning, then info
  const severityOrder = { critical: 0, warning: 1, info: 2 };
  notifications.sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
  );

  return notifications;
}

// Telegram integration placeholder
export async function sendTelegramNotification(
  chatId: string,
  message: string
): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return false;

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "HTML",
        }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}
