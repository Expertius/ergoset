"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { updateDeliveryRateAction } from "@/actions/logistics";
import {
  Truck,
  Clock,
  MapPin,
  Wallet,
  Banknote,
  Fuel,
  Settings2,
  Loader2,
} from "lucide-react";
import { useState, useTransition } from "react";
import { DeliveryCostTrendChart } from "./delivery-cost-trend-chart";

type Analytics = {
  count: number;
  totalDistanceKm: number;
  avgDistanceKm: number;
  totalTimeMin: number;
  avgTimeMin: number;
  totalCost: number;
  totalSalary: number;
  totalFuel: number;
  avgCostPerTask: number;
  byType: Record<string, number>;
};

type TrendItem = {
  month: string;
  deliveryCost: number;
  assemblyCost: number;
  salary: number;
  count: number;
};

type Rate = {
  id: string;
  name: string;
  baseSalary: number;
  perKmRate: number;
  fuelPerKmRate: number;
  assemblyRate: number;
  disassemblyRate: number;
  floorRate: number;
};

const TYPE_LABELS: Record<string, string> = {
  delivery: "Доставка",
  pickup: "Забор",
  replacement: "Замена",
  maintenance_visit: "Обслуживание",
};

export function DeliveryAnalytics({
  analytics,
  trend,
  rate,
}: {
  analytics: Analytics;
  trend: TrendItem[];
  rate: Rate;
}) {
  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Всего доставок
            </CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.count}</div>
            <p className="text-xs text-muted-foreground mt-1">Завершённых</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Общий пробег
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.totalDistanceKm} км</div>
            <p className="text-xs text-muted-foreground mt-1">
              Среднее: {analytics.avgDistanceKm} км/доставка
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Общее время
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round(analytics.totalTimeMin / 60)} ч
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Среднее: {analytics.avgTimeMin} мин/доставка
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Расходы на доставку
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(analytics.totalCost)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Среднее: {formatCurrency(analytics.avgCostPerTask)}/доставка
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: salary + fuel + breakdown */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ЗП за доставки
            </CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.totalSalary)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Расход на топливо
            </CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.totalFuel)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              По типам
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {Object.entries(analytics.byType).map(([type, count]) => (
                <div key={type} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {TYPE_LABELS[type] ?? type}
                  </span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
              {Object.keys(analytics.byType).length === 0 && (
                <p className="text-sm text-muted-foreground">Нет данных</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend chart */}
      <Card>
        <CardHeader>
          <CardTitle>Расходы на логистику по месяцам</CardTitle>
          <p className="text-sm text-muted-foreground">
            Динамика расходов на доставку, сборку и ЗП
          </p>
        </CardHeader>
        <CardContent>
          <DeliveryCostTrendChart data={trend} />
        </CardContent>
      </Card>

      {/* Rate settings */}
      <RateSettings rate={rate} />
    </div>
  );
}

function RateSettings({ rate }: { rate: Rate }) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSubmit(formData: FormData) {
    setSaved(false);
    startTransition(async () => {
      await updateDeliveryRateAction(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-4 w-4" />
          Ставки расчёта
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Используются для автоматического расчёта расходов и ЗП. Все значения в
          копейках.
        </p>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Фикс за доставку (коп.)</Label>
              <Input
                name="baseSalary"
                type="number"
                min={0}
                defaultValue={rate.baseSalary}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">ЗП за км (коп.)</Label>
              <Input
                name="perKmRate"
                type="number"
                min={0}
                defaultValue={rate.perKmRate}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Топливо за км (коп.)</Label>
              <Input
                name="fuelPerKmRate"
                type="number"
                min={0}
                defaultValue={rate.fuelPerKmRate}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Фикс за сборку (коп.)</Label>
              <Input
                name="assemblyRate"
                type="number"
                min={0}
                defaultValue={rate.assemblyRate}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Фикс за разборку (коп.)</Label>
              <Input
                name="disassemblyRate"
                type="number"
                min={0}
                defaultValue={rate.disassemblyRate}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">За этаж без лифта (коп.)</Label>
              <Input
                name="floorRate"
                type="number"
                min={0}
                defaultValue={rate.floorRate}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Сохранить ставки
            </Button>
            {saved && (
              <span className="text-sm text-green-600">Сохранено</span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
