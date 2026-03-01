"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface Props {
  data: {
    month: string;
    deliveryCost: number;
    assemblyCost: number;
    salary: number;
    count: number;
  }[];
}

const config: ChartConfig = {
  deliveryCost: { label: "Расходы на доставку", color: "var(--chart-1)" },
  salary: { label: "ЗП логистика", color: "var(--chart-2)" },
  count: { label: "Кол-во доставок", color: "var(--chart-4)" },
};

function fmt(v: number) {
  const rub = v / 100;
  if (rub >= 1_000_000) return `${(rub / 1_000_000).toFixed(1)}М`;
  if (rub >= 1_000) return `${(rub / 1_000).toFixed(0)}К`;
  return rub.toFixed(0);
}

export function DeliveryCostTrendChart({ data }: Props) {
  if (data.every((d) => d.deliveryCost === 0 && d.salary === 0)) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        Нет данных о расходах на доставку
      </p>
    );
  }

  return (
    <ChartContainer config={config} className="h-[300px] w-full">
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} tickFormatter={fmt} width={50} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => fmt(value as number) + " ₽"}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="deliveryCost" fill="var(--color-deliveryCost)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="salary" fill="var(--color-salary)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
