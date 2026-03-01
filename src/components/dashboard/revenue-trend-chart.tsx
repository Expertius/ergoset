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
  data: { month: string; revenue: number; expenses: number; profit: number }[];
}

const config: ChartConfig = {
  revenue: { label: "Доход", color: "hsl(var(--chart-1))" },
  expenses: { label: "Расходы", color: "hsl(var(--chart-2))" },
  profit: { label: "Прибыль", color: "hsl(var(--chart-3))" },
};

function fmt(v: number) {
  const rub = v / 100;
  if (rub >= 1_000_000) return `${(rub / 1_000_000).toFixed(1)}М`;
  if (rub >= 1_000) return `${(rub / 1_000).toFixed(0)}К`;
  return rub.toFixed(0);
}

export function RevenueTrendChart({ data }: Props) {
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
        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" fill="var(--color-expenses)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
