"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { formatDate, formatCurrency } from "@/lib/utils";
import { DEAL_STATUS_LABELS } from "@/lib/constants";
import type { CalendarEvent } from "@/services/dashboard";
import type { DealStatus } from "@/generated/prisma/browser";

const DAY_NAMES = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const MONTH_NAMES = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

const EVENT_COLORS: Record<string, string> = {
  lead: "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
  booked: "bg-yellow-50 text-yellow-800 hover:bg-yellow-100 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
  delivery_scheduled: "bg-orange-50 text-orange-800 hover:bg-orange-100 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
  delivered: "bg-cyan-50 text-cyan-800 hover:bg-cyan-100 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800",
  active: "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
  extended: "bg-blue-50 text-blue-800 hover:bg-blue-100 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  return_scheduled: "bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
  closed_return: "bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
  closed_purchase: "bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
  canceled: "bg-red-50 text-red-700 hover:bg-red-100 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
};

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

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type Props = {
  events: CalendarEvent[];
  month: number;
  year: number;
  range: number;
  zoom: number;
  fitToScreen: boolean;
  onSelectEvent: (event: CalendarEvent) => void;
};

type MonthData = {
  month: number;
  year: number;
  weeks: Date[][];
  eventsByDay: Map<string, CalendarEvent[]>;
};

function buildMonthData(m: number, y: number, events: CalendarEvent[]): MonthData {
  const firstOfMonth = new Date(y, m, 1);
  const lastOfMonth = new Date(y, m + 1, 0);
  const firstDow = (firstOfMonth.getDay() + 6) % 7;

  const allDays: Date[] = [];
  for (let i = firstDow - 1; i >= 0; i--) {
    allDays.push(new Date(y, m, -i));
  }
  for (let d = 1; d <= lastOfMonth.getDate(); d++) {
    allDays.push(new Date(y, m, d));
  }
  while (allDays.length % 7 !== 0) {
    const nextDay = allDays.length - firstDow - lastOfMonth.getDate() + 1;
    allDays.push(new Date(y, m + 1, nextDay));
  }

  const ws: Date[][] = [];
  for (let i = 0; i < allDays.length; i += 7) {
    ws.push(allDays.slice(i, i + 7));
  }

  const gridStart = allDays[0];
  const gridEnd = allDays[allDays.length - 1];

  const evtMap = new Map<string, CalendarEvent[]>();
  for (const ev of events) {
    const start = new Date(ev.startDate);
    const end = new Date(ev.endDate);
    const from = new Date(Math.max(start.getTime(), gridStart.getTime()));
    const to = new Date(Math.min(end.getTime(), gridEnd.getTime()));
    const cursor = new Date(from);
    while (cursor <= to) {
      const key = dateKey(cursor);
      if (!evtMap.has(key)) evtMap.set(key, []);
      const arr = evtMap.get(key)!;
      if (!arr.some((e) => e.id === ev.id)) arr.push(ev);
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  return { month: m, year: y, weeks: ws, eventsByDay: evtMap };
}

type ZoomMode = "compact" | "medium" | "normal";

function getZoomMode(zoom: number, fitToScreen: boolean, range: number): ZoomMode {
  if (range <= 1) return "normal";
  if (fitToScreen) return "compact";
  if (zoom < 30) return "compact";
  if (zoom < 65) return "medium";
  return "normal";
}

function getGridCols(range: number, mode: ZoomMode): number {
  if (mode === "normal") return 1;
  if (range === 3) return 3;
  if (range === 6) return mode === "compact" ? 3 : 2;
  return 1;
}

export function MonthGridView({ events, month, year, range, zoom, fitToScreen, onSelectEvent }: Props) {
  const now = new Date();
  const todayKey = dateKey(now);

  const zoomMode = getZoomMode(zoom, fitToScreen, range);
  const gridCols = getGridCols(range, zoomMode);
  const isMultiCol = gridCols > 1;

  const cellMinH = zoomMode === "compact" ? 28 : zoomMode === "medium" ? 50 : 90;
  const maxEventsPerCell = zoomMode === "compact" ? 0 : zoomMode === "medium" ? 1 : range > 1 ? 2 : 3;
  const showDayNames = zoomMode !== "compact";

  const months = useMemo(() => {
    const result: MonthData[] = [];
    for (let i = 0; i < range; i++) {
      const m = (month + i) % 12;
      const y = year + Math.floor((month + i) / 12);
      result.push(buildMonthData(m, y, events));
    }
    return result;
  }, [events, month, year, range]);

  const gridClassName = isMultiCol
    ? `grid gap-3 ${gridCols === 3 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2"}`
    : range > 1 ? "space-y-4" : "";

  return (
    <div className={gridClassName}>
      {months.map((md) => (
        <Card key={`${md.year}-${md.month}`}>
          <CardContent className={`overflow-x-auto ${isMultiCol ? "pt-3 p-2 sm:p-3 sm:pt-3" : "pt-4"}`}>
            {range > 1 && (
              <h3 className={`font-semibold mb-1.5 px-1 ${isMultiCol ? "text-xs" : "text-sm mb-2"}`}>
                {MONTH_NAMES[md.month]} {md.year}
              </h3>
            )}

            {/* Desktop grid */}
            <div className={`hidden sm:block ${isMultiCol ? "" : "min-w-[680px]"}`}>
              {showDayNames && (
                <div className="grid grid-cols-7 border-b">
                  {DAY_NAMES.map((d, i) => (
                    <div
                      key={d}
                      className={`text-center font-medium py-1 ${
                        i >= 5 ? "text-rose-400" : "text-muted-foreground"
                      }`}
                      style={{ fontSize: isMultiCol ? 10 : 12 }}
                    >
                      {isMultiCol ? d[0] : d}
                    </div>
                  ))}
                </div>
              )}
              <TooltipProvider>
                <div className="border-l border-t">
                  {md.weeks.map((w, wi) => (
                    <div key={wi} className="grid grid-cols-7">
                      {w.map((day, di) => {
                        const key = dateKey(day);
                        const dayEvents = md.eventsByDay.get(key) || [];
                        const isToday = key === todayKey;
                        const isCurrMonth = day.getMonth() === md.month;
                        const isWeekend = di >= 5;

                        return (
                          <div
                            key={key}
                            className={`border-r border-b transition-colors ${
                              !isCurrMonth
                                ? "bg-muted/40"
                                : isWeekend
                                  ? "bg-muted/15"
                                  : ""
                            }`}
                            style={{
                              minHeight: cellMinH,
                              padding: zoomMode === "compact" ? 2 : 6,
                            }}
                          >
                            <div className={`flex items-center justify-center ${zoomMode !== "compact" ? "mb-1" : ""}`}>
                              <span
                                className={`flex items-center justify-center rounded-full ${
                                  isToday
                                    ? "bg-primary text-primary-foreground font-bold"
                                    : !isCurrMonth
                                      ? "text-muted-foreground/40"
                                      : isWeekend
                                        ? "text-rose-400"
                                        : "text-foreground"
                                }`}
                                style={{
                                  fontSize: zoomMode === "compact" ? 10 : zoomMode === "medium" ? 11 : 14,
                                  width: zoomMode === "compact" ? 18 : zoomMode === "medium" ? 22 : 28,
                                  height: zoomMode === "compact" ? 18 : zoomMode === "medium" ? 22 : 28,
                                }}
                              >
                                {day.getDate()}
                              </span>
                            </div>

                            {zoomMode === "compact" ? (
                              dayEvents.length > 0 && (
                                <div className="flex flex-wrap gap-[2px] justify-center mt-0.5">
                                  {dayEvents.slice(0, 3).map((ev) => (
                                    <Tooltip key={`${ev.id}-${key}`}>
                                      <TooltipTrigger asChild>
                                        <button
                                          onClick={() => onSelectEvent(ev)}
                                          className={`rounded-full cursor-pointer hover:ring-1 ring-foreground/30 ${
                                            DOT_COLORS[ev.dealStatus] || "bg-gray-400"
                                          }`}
                                          style={{ width: 6, height: 6 }}
                                        />
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="max-w-[220px]">
                                        <div className="text-xs space-y-1">
                                          <p className="font-semibold">{ev.clientName}</p>
                                          <p>{ev.assetCode} — {ev.assetName}</p>
                                          <p>{formatDate(ev.startDate)} — {formatDate(ev.endDate)}</p>
                                          <p>{DEAL_STATUS_LABELS[ev.dealStatus as DealStatus]}</p>
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  ))}
                                  {dayEvents.length > 3 && (
                                    <span className="text-[8px] text-muted-foreground leading-none">
                                      +{dayEvents.length - 3}
                                    </span>
                                  )}
                                </div>
                              )
                            ) : (
                              <div className="space-y-0.5">
                                {dayEvents.slice(0, maxEventsPerCell).map((ev) => (
                                  <Tooltip key={`${ev.id}-${key}`}>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={() => onSelectEvent(ev)}
                                        className={`w-full text-left leading-tight rounded border cursor-pointer transition-colors truncate ${
                                          EVENT_COLORS[ev.dealStatus] ||
                                          "bg-gray-100 text-gray-700 border-gray-200"
                                        }`}
                                        style={{
                                          fontSize: zoomMode === "medium" ? 10 : 11,
                                          padding: zoomMode === "medium" ? "1px 4px" : "2px 6px",
                                        }}
                                      >
                                        <span className="font-semibold">
                                          {ev.assetCode.replace("EWS-M-", "")}
                                        </span>{" "}
                                        {zoomMode === "normal" && (
                                          <span className="opacity-75">
                                            {ev.clientName.split(" ")[0]}
                                          </span>
                                        )}
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-[220px]">
                                      <div className="text-xs space-y-1">
                                        <p className="font-semibold">{ev.clientName}</p>
                                        <p>{ev.assetCode} — {ev.assetName}</p>
                                        <p>{formatDate(ev.startDate)} — {formatDate(ev.endDate)}</p>
                                        <p>{DEAL_STATUS_LABELS[ev.dealStatus as DealStatus]}</p>
                                        {ev.totalPlannedAmount > 0 && (
                                          <p>{formatCurrency(ev.totalPlannedAmount)}</p>
                                        )}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                ))}
                                {dayEvents.length > maxEventsPerCell && (
                                  <div className="text-[10px] text-muted-foreground text-center">
                                    +{dayEvents.length - maxEventsPerCell}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </TooltipProvider>
            </div>

            {/* Mobile compact list */}
            <div className="sm:hidden space-y-1">
              {md.weeks.flat().filter((d) => d.getMonth() === md.month).map((day) => {
                const key = dateKey(day);
                const dayEvents = md.eventsByDay.get(key) || [];
                const isToday = key === todayKey;
                const isWeekend = (day.getDay() + 6) % 7 >= 5;

                if (dayEvents.length === 0 && !isToday) return null;

                return (
                  <div
                    key={key}
                    className={`rounded-lg border p-2.5 ${
                      isToday ? "border-primary/50 bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={`text-sm font-medium ${
                          isToday
                            ? "text-primary font-bold"
                            : isWeekend
                              ? "text-rose-400"
                              : ""
                        }`}
                      >
                        {day.getDate()} {DAY_NAMES[(day.getDay() + 6) % 7]}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          ({dayEvents.length})
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.map((ev) => (
                        <button
                          key={`${ev.id}-${key}`}
                          onClick={() => onSelectEvent(ev)}
                          className="w-full flex items-center gap-2 text-left p-1.5 rounded border hover:bg-muted/50 transition-colors"
                        >
                          <div
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              DOT_COLORS[ev.dealStatus] || "bg-gray-400"
                            }`}
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-mono font-semibold">
                              {ev.assetCode.replace("EWS-M-", "")}
                            </span>
                            <span className="text-xs text-muted-foreground ml-1.5">
                              {ev.clientName.split(" ")[0]}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {events.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <p className="text-sm text-muted-foreground text-center">
              Нет аренд в выбранном периоде
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
