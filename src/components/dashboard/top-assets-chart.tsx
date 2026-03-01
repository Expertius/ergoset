"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface Props {
  data: { code: string; name: string; revenue: number }[];
}

const config: ChartConfig = {
  revenue: { label: "Выручка", color: "hsl(var(--chart-1))" },
};

function fmt(v: number) {
  const rub = v / 100;
  if (rub >= 1_000_000) return `${(rub / 1_000_000).toFixed(1)}М`;
  if (rub >= 1_000) return `${(rub / 1_000).toFixed(0)}К`;
  return rub.toFixed(0);
}

export function TopAssetsChart({ data }: Props) {
  return (
    <ChartContainer config={config} className="h-[250px] w-full">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
      >
        <CartesianGrid horizontal={false} />
        <YAxis
          dataKey="code"
          type="category"
          tickLine={false}
          axisLine={false}
          width={60}
          className="text-xs"
        />
        <XAxis type="number" tickLine={false} axisLine={false} tickFormatter={fmt} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => fmt(value as number) + " ₽"}
            />
          }
        />
        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
