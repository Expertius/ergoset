"use client";

import { PieChart, Pie, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface DataItem {
  name: string;
  value: number;
  kind: string;
}

interface Props {
  data: DataItem[];
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(220, 70%, 55%)",
  "hsl(280, 60%, 55%)",
  "hsl(30, 80%, 55%)",
];

function fmt(v: number) {
  const rub = v / 100;
  if (rub >= 1_000_000) return `${(rub / 1_000_000).toFixed(1)}М ₽`;
  if (rub >= 1_000) return `${(rub / 1_000).toFixed(0)}К ₽`;
  return `${rub.toFixed(0)} ₽`;
}

export function RevenueBreakdownChart({ data }: Props) {
  const config: ChartConfig = Object.fromEntries(
    data.map((d, i) => [
      d.kind,
      { label: d.name, color: COLORS[i % COLORS.length] },
    ])
  );

  return (
    <ChartContainer config={config} className="h-[300px] w-full">
      <PieChart>
        <ChartTooltip
          content={
            <ChartTooltipContent
              nameKey="name"
              formatter={(value) => fmt(value as number)}
            />
          }
        />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius="55%"
          outerRadius="80%"
          paddingAngle={2}
          strokeWidth={0}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="name" />} />
      </PieChart>
    </ChartContainer>
  );
}
