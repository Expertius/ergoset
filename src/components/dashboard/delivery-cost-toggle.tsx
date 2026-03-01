"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { KpiDeltaCard } from "./kpi-delta-card";
import { formatCurrency } from "@/lib/utils";
import {
  TrendingUp,
  Wallet,
  BarChart3,
  Percent,
  Receipt,
  RefreshCw,
  DollarSign,
  Truck,
} from "lucide-react";

type Comparison = {
  revenue: { current: number; previous: number; delta: number };
  expenses: { current: number; previous: number; delta: number };
  profit: { current: number; previous: number; delta: number };
  deals: { current: number; previous: number; delta: number };
  utilization: { current: number; previous: number; delta: number };
  margin: { current: number; previous: number; delta: number };
  avgCheck: { current: number; previous: number; delta: number };
};

type Kpis = {
  revenue: number;
  expenses: number;
  profit: number;
  margin: number;
  avgCheck: number;
  capitalTurnover: number;
  revenuePerAsset: number;
};

type DeliveryCosts = {
  expenses: number;
  income: number;
};

export function DeliveryCostToggle({
  comparison,
  kpis,
  deliveryCosts,
}: {
  comparison: Comparison;
  kpis: Kpis;
  deliveryCosts: DeliveryCosts;
}) {
  const [includeDelivery, setIncludeDelivery] = useState(true);

  const adj = includeDelivery
    ? { expenseAdj: 0, incomeAdj: 0 }
    : { expenseAdj: deliveryCosts.expenses, incomeAdj: deliveryCosts.income };

  const adjRevenue = comparison.revenue.current - adj.incomeAdj;
  const adjExpenses = comparison.expenses.current - adj.expenseAdj;
  const adjProfit = adjRevenue - adjExpenses;
  const adjMargin = adjRevenue > 0 ? Math.round((adjProfit / adjRevenue) * 100) : 0;

  const adjKpiRevenue = kpis.revenue - adj.incomeAdj;
  const adjKpiExpenses = kpis.expenses - adj.expenseAdj;
  const adjKpiProfit = adjKpiRevenue - adjKpiExpenses;
  const adjKpiMargin = adjKpiRevenue > 0 ? Math.round((adjKpiProfit / adjKpiRevenue) * 100) : 0;

  return (
    <>
      <div className="flex items-center gap-3 justify-end">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="delivery-toggle" className="text-sm text-muted-foreground cursor-pointer">
            Учитывать доставку/сборку
          </Label>
          <Switch
            id="delivery-toggle"
            checked={includeDelivery}
            onCheckedChange={setIncludeDelivery}
          />
        </div>
        {!includeDelivery && (
          <span className="text-xs text-orange-600 font-medium">
            Без доставки: -{formatCurrency(deliveryCosts.expenses + deliveryCosts.income)}
          </span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiDeltaCard
          title="Доход (мес.)"
          value={formatCurrency(adjRevenue)}
          delta={comparison.revenue.delta}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
        <KpiDeltaCard
          title="Расходы (мес.)"
          value={formatCurrency(adjExpenses)}
          delta={comparison.expenses.delta}
          icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
          invertColor
        />
        <KpiDeltaCard
          title="Прибыль (мес.)"
          value={formatCurrency(adjProfit)}
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiDeltaCard
          title="Маржинальность"
          value={`${adjKpiMargin}%`}
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
    </>
  );
}
