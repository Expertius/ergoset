import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats } from "@/services/dashboard";
import { getUtilizationReport } from "@/services/reports";
import {
  getRevenueExpenseTrend,
  getRevenueByKind,
  getExpensesByCategory,
  getFinancialKPIs,
  getPeriodComparison,
  getTopAssetsByRevenue,
  getTopClientsByRevenue,
} from "@/services/analytics";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DEAL_STATUS_LABELS, DEAL_STATUS_COLORS } from "@/lib/constants";
import { StatusBadge } from "@/components/shared/status-badge";
import { NotificationsPanel } from "@/components/notifications/notifications-panel";
import { KpiDeltaCard } from "@/components/dashboard/kpi-delta-card";
import { RevenueTrendChart } from "@/components/dashboard/revenue-trend-chart";
import { UtilizationChart } from "@/components/dashboard/utilization-chart";
import { RevenueBreakdownChart } from "@/components/dashboard/revenue-breakdown-chart";
import { ExpenseBreakdownChart } from "@/components/dashboard/expense-breakdown-chart";
import { TopAssetsChart } from "@/components/dashboard/top-assets-chart";
import { TopClientsChart } from "@/components/dashboard/top-clients-chart";
import Link from "next/link";
import {
  Armchair,
  CalendarDays,
  Clock,
  TrendingUp,
  Wallet,
  BarChart3,
  Percent,
  Receipt,
  RefreshCw,
  DollarSign,
  AlertTriangle,
} from "lucide-react";

export default async function DashboardPage() {
  const [
    stats,
    comparison,
    kpis,
    revenueTrend,
    utilization,
    revenueByKind,
    expensesByCategory,
    topAssets,
    topClients,
  ] = await Promise.all([
    getDashboardStats(),
    getPeriodComparison(),
    getFinancialKPIs(),
    getRevenueExpenseTrend(6),
    getUtilizationReport(6),
    getRevenueByKind(),
    getExpensesByCategory(),
    getTopAssetsByRevenue(5),
    getTopClientsByRevenue(5),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Дашборд</h1>
        <p className="text-muted-foreground">
          Обзор состояния бизнеса аренды рабочих станций
        </p>
      </div>

      {/* ─── Row 1: Asset stats ──────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Всего станций</CardTitle>
            <Armchair className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalAssets}</div>
            <p className="text-xs text-muted-foreground mt-1">Активных в системе</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Доступно</CardTitle>
            <Armchair className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.availableAssets}</div>
            <p className="text-xs text-muted-foreground mt-1">Готовы к аренде</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">В аренде</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.rentedAssets}</div>
            <p className="text-xs text-muted-foreground mt-1">Сейчас у клиентов</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Забронировано</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.reservedAssets}</div>
            <p className="text-xs text-muted-foreground mt-1">Ожидают доставки</p>
          </CardContent>
        </Card>
      </div>

      {/* ─── Row 2: Financial KPIs with deltas ───────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiDeltaCard
          title="Доход (мес.)"
          value={formatCurrency(comparison.revenue.current)}
          delta={comparison.revenue.delta}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
        <KpiDeltaCard
          title="Расходы (мес.)"
          value={formatCurrency(comparison.expenses.current)}
          delta={comparison.expenses.delta}
          icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
          invertColor
        />
        <KpiDeltaCard
          title="Прибыль (мес.)"
          value={formatCurrency(comparison.profit.current)}
          delta={comparison.profit.delta}
          icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
        />
        <KpiDeltaCard
          title="Утилизация"
          value={`${comparison.utilization.current}%`}
          delta={comparison.utilization.delta}
          deltaLabel="п.п. vs прошлый мес."
          icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* ─── Row 3: Business KPIs ────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiDeltaCard
          title="Маржинальность"
          value={`${kpis.margin}%`}
          delta={comparison.margin.delta}
          deltaLabel="п.п. vs прошлый мес."
          icon={<Percent className="h-4 w-4 text-muted-foreground" />}
        />
        <KpiDeltaCard
          title="Средний чек"
          value={formatCurrency(kpis.avgCheck)}
          delta={comparison.avgCheck.delta}
          icon={<Receipt className="h-4 w-4 text-muted-foreground" />}
        />
        <KpiDeltaCard
          title="Оборачиваемость капитала"
          value={`${kpis.capitalTurnover}x`}
          delta={comparison.deals.delta}
          deltaLabel="сделки vs прошлый мес."
          icon={<RefreshCw className="h-4 w-4 text-muted-foreground" />}
        />
        <KpiDeltaCard
          title="Доход на станцию"
          value={formatCurrency(kpis.revenuePerAsset)}
          delta={comparison.revenue.delta}
          deltaLabel="доход vs прошлый мес."
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* ─── Row 4: Trend charts ─────────────────────── */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Доход и расходы</CardTitle>
            <p className="text-sm text-muted-foreground">Помесячная динамика за 6 месяцев</p>
          </CardHeader>
          <CardContent>
            <RevenueTrendChart data={revenueTrend} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Утилизация парка</CardTitle>
            <p className="text-sm text-muted-foreground">% загрузки станций помесячно</p>
          </CardHeader>
          <CardContent>
            <UtilizationChart data={utilization} />
          </CardContent>
        </Card>
      </div>

      {/* ─── Row 5: Breakdown charts ─────────────────── */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Структура дохода</CardTitle>
            <p className="text-sm text-muted-foreground">Разбивка по типам платежей</p>
          </CardHeader>
          <CardContent>
            {revenueByKind.length > 0 ? (
              <RevenueBreakdownChart data={revenueByKind} />
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Нет данных о платежах
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Структура расходов</CardTitle>
            <p className="text-sm text-muted-foreground">Разбивка по категориям</p>
          </CardHeader>
          <CardContent>
            {expensesByCategory.length > 0 ? (
              <ExpenseBreakdownChart data={expensesByCategory} />
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Нет данных о расходах
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── Row 6: Top rankings ─────────────────────── */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>ТОП-5 станций по выручке</CardTitle>
          </CardHeader>
          <CardContent>
            {topAssets.length > 0 ? (
              <TopAssetsChart data={topAssets} />
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Нет данных
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>ТОП-5 клиентов по выручке</CardTitle>
          </CardHeader>
          <CardContent>
            {topClients.length > 0 ? (
              <TopClientsChart data={topClients} />
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Нет данных
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── Row 7: Upcoming returns + notifications ── */}
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
