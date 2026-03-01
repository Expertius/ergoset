"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface Props {
  data: { name: string; revenue: number; dealsCount: number }[];
}

const config: ChartConfig = {
  revenue: { label: "Выручка", color: "var(--chart-3)" },
};

function fmt(v: number) {
  const rub = v / 100;
  if (rub >= 1_000_000) return `${(rub / 1_000_000).toFixed(1)}М`;
  if (rub >= 1_000) return `${(rub / 1_000).toFixed(0)}К`;
  return rub.toFixed(0);
}

function shortName(name: string) {
  const parts = name.split(" ");
  if (parts.length <= 1) return name;
  return `${parts[0]} ${parts[1]?.[0] ?? ""}.`;
}

export function TopClientsChart({ data }: Props) {
  const display = data.map((d) => ({ ...d, shortName: shortName(d.name) }));

  return (
    <ChartContainer config={config} className="h-[250px] w-full">
      <BarChart
        data={display}
        layout="vertical"
        margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
      >
        <CartesianGrid horizontal={false} />
        <YAxis
          dataKey="shortName"
          type="category"
          tickLine={false}
          axisLine={false}
          width={80}
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
