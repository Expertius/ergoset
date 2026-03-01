"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface KpiDeltaCardProps {
  title: string;
  value: string;
  delta: number;
  deltaLabel?: string;
  icon: ReactNode;
  invertColor?: boolean;
}

export function KpiDeltaCard({
  title,
  value,
  delta,
  deltaLabel = "vs прошлый мес.",
  icon,
  invertColor = false,
}: KpiDeltaCardProps) {
  const isPositive = invertColor ? delta < 0 : delta > 0;
  const isNegative = invertColor ? delta > 0 : delta < 0;

  const DeltaIcon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-1 mt-1">
          <DeltaIcon
            className={cn(
              "h-3 w-3",
              isPositive && "text-green-600",
              isNegative && "text-red-600",
              !isPositive && !isNegative && "text-muted-foreground"
            )}
          />
          <span
            className={cn(
              "text-xs font-medium",
              isPositive && "text-green-600",
              isNegative && "text-red-600",
              !isPositive && !isNegative && "text-muted-foreground"
            )}
          >
            {delta > 0 ? "+" : ""}
            {delta}%
          </span>
          <span className="text-xs text-muted-foreground">{deltaLabel}</span>
        </div>
      </CardContent>
    </Card>
  );
}
