"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  DEAL_STATUS_LABELS,
  DEAL_STATUS_COLORS,
  DEAL_TYPE_LABELS,
  DEAL_TYPE_COLORS,
} from "@/lib/constants";
import type { CalendarEvent } from "@/services/dashboard";
import type { DealStatus, DealType } from "@/generated/prisma/browser";

type SortKey = "client" | "asset" | "start" | "amount" | "delivery";
type SortDir = "asc" | "desc";

const DOT_COLORS: Record<string, string> = {
  lead: "bg-gray-400",
  booked: "bg-yellow-500",
  delivery_scheduled: "bg-orange-500",
  delivered: "bg-cyan-500",
  active: "bg-emerald-500",
  extended: "bg-blue-500",
  return_scheduled: "bg-amber-500",
  closed_return: "bg-slate-400",
  closed_purchase: "bg-purple-500",
  canceled: "bg-red-500",
};

type Props = {
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
};

export function CalendarTableView({ events, onSelectEvent }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("start");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sorted = useMemo(() => {
    const arr = [...events];
    const dir = sortDir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      switch (sortKey) {
        case "client":
          return a.clientName.localeCompare(b.clientName) * dir;
        case "asset":
          return a.assetCode.localeCompare(b.assetCode) * dir;
        case "start":
          return (new Date(a.startDate).getTime() - new Date(b.startDate).getTime()) * dir;
        case "amount":
          return (a.totalPlannedAmount - b.totalPlannedAmount) * dir;
        case "delivery":
          return (a.deliveryAmount - b.deliveryAmount) * dir;
        default:
          return 0;
      }
    });
    return arr;
  }, [events, sortKey, sortDir]);

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />;
    return sortDir === "asc"
      ? <ArrowUp className="h-3 w-3 ml-1" />
      : <ArrowDown className="h-3 w-3 ml-1" />;
  };

  const headerBtn = (col: SortKey, label: string, className?: string) => (
    <TableHead className={className}>
      <button
        onClick={() => toggleSort(col)}
        className="flex items-center text-xs font-medium hover:text-foreground transition-colors cursor-pointer"
      >
        {label}
        <SortIcon col={col} />
      </button>
    </TableHead>
  );

  return (
    <Card>
      <CardContent className="pt-4">
        {/* Desktop table */}
        <div className="hidden sm:block rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {headerBtn("client", "Клиент")}
                {headerBtn("asset", "Станция")}
                {headerBtn("start", "Период")}
                <TableHead>Статус</TableHead>
                <TableHead>Тип</TableHead>
                {headerBtn("amount", "Сумма", "text-right")}
                {headerBtn("delivery", "Доставка", "text-right")}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Нет аренд за этот период
                  </TableCell>
                </TableRow>
              )}
              {sorted.map((ev) => (
                <TableRow
                  key={ev.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onSelectEvent(ev)}
                >
                  <TableCell className="font-medium">{ev.clientName}</TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">{ev.assetCode}</span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(ev.startDate)} — {formatDate(ev.endDate)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      label={DEAL_STATUS_LABELS[ev.dealStatus as DealStatus] || ev.dealStatus}
                      colorClass={DEAL_STATUS_COLORS[ev.dealStatus as DealStatus]}
                    />
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      label={DEAL_TYPE_LABELS[ev.dealType as DealType] || ev.dealType}
                      colorClass={DEAL_TYPE_COLORS[ev.dealType as DealType]}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    {ev.totalPlannedAmount > 0 ? formatCurrency(ev.totalPlannedAmount) : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {ev.deliveryAmount > 0 ? formatCurrency(ev.deliveryAmount) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden space-y-2">
          {sorted.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Нет аренд за этот период
            </p>
          )}
          {sorted.map((ev) => (
            <button
              key={ev.id}
              onClick={() => onSelectEvent(ev)}
              className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      DOT_COLORS[ev.dealStatus] || "bg-gray-400"
                    }`}
                  />
                  <span className="font-medium text-sm truncate">
                    {ev.clientName}
                  </span>
                </div>
                <StatusBadge
                  label={DEAL_STATUS_LABELS[ev.dealStatus as DealStatus] || ev.dealStatus}
                  colorClass={DEAL_STATUS_COLORS[ev.dealStatus as DealStatus]}
                />
              </div>
              <div className="text-xs text-muted-foreground space-y-0.5 pl-4">
                <div className="flex justify-between">
                  <span className="font-mono">{ev.assetCode}</span>
                  {ev.totalPlannedAmount > 0 && (
                    <span className="font-medium text-foreground">
                      {formatCurrency(ev.totalPlannedAmount)}
                    </span>
                  )}
                </div>
                <p>
                  {formatDate(ev.startDate)} — {formatDate(ev.endDate)}
                </p>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
