import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats } from "@/services/dashboard";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DEAL_STATUS_LABELS, DEAL_STATUS_COLORS } from "@/lib/constants";
import { StatusBadge } from "@/components/shared/status-badge";
import { NotificationsPanel } from "@/components/notifications/notifications-panel";
import Link from "next/link";
import {
  Armchair,
  Users,
  TrendingUp,
  AlertTriangle,
  Clock,
  BarChart3,
  CalendarDays,
  Wallet,
} from "lucide-react";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const topCards = [
    { title: "Всего станций", value: stats.totalAssets, icon: Armchair, desc: "Активных в системе" },
    { title: "Доступно", value: stats.availableAssets, icon: Armchair, desc: "Готовы к аренде" },
    { title: "В аренде", value: stats.rentedAssets, icon: CalendarDays, desc: "Сейчас у клиентов" },
    { title: "Забронировано", value: stats.reservedAssets, icon: Clock, desc: "Ожидают доставки" },
  ];

  const finCards = [
    { title: "Доход (мес.)", value: formatCurrency(stats.revenueMTD), icon: TrendingUp, color: "text-green-600" },
    { title: "Расходы (мес.)", value: formatCurrency(stats.expensesMTD), icon: Wallet, color: "text-red-600" },
    { title: "Прибыль (мес.)", value: formatCurrency(stats.profitMTD), icon: BarChart3, color: stats.profitMTD >= 0 ? "text-green-600" : "text-red-600" },
    { title: "Утилизация", value: `${stats.utilization}%`, icon: BarChart3, color: "text-blue-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Дашборд</h1>
        <p className="text-muted-foreground">
          Обзор состояния бизнеса аренды рабочих станций
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {topCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {finCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Предстоящие возвраты (7 дней)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.upcomingReturns.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Нет предстоящих возвратов
              </p>
            ) : (
              <div className="space-y-3">
                {stats.upcomingReturns.map((r) => {
                  const daysLeft = Math.ceil(
                    (r.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  );
                  return (
                    <div
                      key={r.id}
                      className="flex items-center justify-between border-b pb-2 last:border-0"
                    >
                      <div>
                        <Link
                          href={`/deals/${r.dealId}`}
                          className="text-sm font-medium hover:underline"
                        >
                          {r.deal.client.fullName}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {r.asset.code} — до {formatDate(r.endDate)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge
                          label={DEAL_STATUS_LABELS[r.deal.status]}
                          colorClass={DEAL_STATUS_COLORS[r.deal.status]}
                        />
                        <span
                          className={`text-xs font-medium ${
                            daysLeft <= 1
                              ? "text-red-600"
                              : daysLeft <= 3
                                ? "text-orange-600"
                                : "text-yellow-600"
                          }`}
                        >
                          {daysLeft <= 0 ? "Сегодня!" : `${daysLeft} дн.`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <NotificationsPanel />
      </div>
    </div>
  );
}
