"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface Props {
  data: { month: string; utilization: number; revenue: number }[];
}

const config: ChartConfig = {
  utilization: { label: "Утилизация %", color: "hsl(var(--chart-4))" },
};

export function UtilizationChart({ data }: Props) {
  return (
    <ChartContainer config={config} className="h-[300px] w-full">
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <YAxis
          tickLine={false}
          axisLine={false}
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          width={45}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => `${value}%`}
            />
          }
        />
        <defs>
          <linearGradient id="utilGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-utilization)" stopOpacity={0.4} />
            <stop offset="95%" stopColor="var(--color-utilization)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="utilization"
          stroke="var(--color-utilization)"
          fill="url(#utilGradient)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}
