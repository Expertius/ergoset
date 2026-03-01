"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  DEAL_STATUS_LABELS,
  DEAL_STATUS_COLORS,
  DEAL_TYPE_LABELS,
} from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { RentalCardSheet } from "./rental-card-sheet";
import type { CalendarEvent } from "@/services/dashboard";
import type { DealStatus, DealType } from "@/generated/prisma/browser";

const MONTH_NAMES = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

const DAY_NAMES = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const EVENT_COLORS: Record<string, string> = {
  lead: "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200",
  booked: "bg-yellow-50 text-yellow-800 hover:bg-yellow-100 border-yellow-200",
  delivery_scheduled:
    "bg-orange-50 text-orange-800 hover:bg-orange-100 border-orange-200",
  delivered: "bg-cyan-50 text-cyan-800 hover:bg-cyan-100 border-cyan-200",
  active:
    "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-emerald-200",
  extended: "bg-blue-50 text-blue-800 hover:bg-blue-100 border-blue-200",
  return_scheduled:
    "bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-200",
  closed_return:
    "bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200",
  closed_purchase:
    "bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200",
  canceled: "bg-red-50 text-red-700 hover:bg-red-100 border-red-200",
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
};

export function CalendarView({ events, month, year }: Props) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );

  const now = new Date();
  const todayKey = dateKey(now);
  const isCurrentMonth =
    now.getMonth() === month && now.getFullYear() === year;

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;

  const { weeks, eventsByDay } = useMemo(() => {
    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);
    const firstDow = (firstOfMonth.getDay() + 6) % 7;

    const allDays: Date[] = [];

    for (let i = firstDow - 1; i >= 0; i--) {
      allDays.push(new Date(year, month, -i));
    }

    for (let d = 1; d <= lastOfMonth.getDate(); d++) {
      allDays.push(new Date(year, month, d));
    }

    while (allDays.length % 7 !== 0) {
      const nextDay = allDays.length - firstDow - lastOfMonth.getDate() + 1;
      allDays.push(new Date(year, month + 1, nextDay));
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
      const from = new Date(
        Math.max(start.getTime(), gridStart.getTime()),
      );
      const to = new Date(Math.min(end.getTime(), gridEnd.getTime()));
      const cursor = new Date(from);
      while (cursor <= to) {
        const key = dateKey(cursor);
        if (!evtMap.has(key)) evtMap.set(key, []);
        const arr = evtMap.get(key)!;
        if (!arr.some((e) => e.id === ev.id)) {
          arr.push(ev);
        }
        cursor.setDate(cursor.getDate() + 1);
      }
    }

    return { weeks: ws, eventsByDay: evtMap };
  }, [events, month, year]);

  const sortedEvents = useMemo(
    () =>
      [...events].sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
      ),
    [events],
  );

  return (
    <>
      <Card>
        <CardContent className="pt-4 overflow-x-auto">
          <div className="min-w-[680px]">
            {/* Navigation */}
            <div className="flex items-center justify-between mb-4">
              <Button variant="outline" size="icon" asChild>
                <Link
                  href={`/calendar?month=${prevMonth}&year=${prevYear}`}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              </Button>

              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold">
                  {MONTH_NAMES[month]} {year}
                </h2>
                {!isCurrentMonth && (
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={`/calendar?month=${now.getMonth()}&year=${now.getFullYear()}`}
                    >
                      Сегодня
                    </Link>
                  </Button>
                )}
              </div>

              <Button variant="outline" size="icon" asChild>
                <Link
                  href={`/calendar?month=${nextMonth}&year=${nextYear}`}
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 border-b">
              {DAY_NAMES.map((d, i) => (
                <div
                  key={d}
                  className={`text-center text-xs font-medium py-2 ${
                    i >= 5 ? "text-rose-400" : "text-muted-foreground"
                  }`}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="border-l border-t">
              {weeks.map((w, wi) => (
                <div key={wi} className="grid grid-cols-7">
                  {w.map((day, di) => {
                    const key = dateKey(day);
                    const dayEvents = eventsByDay.get(key) || [];
                    const isToday = key === todayKey;
                    const isCurrMonth = day.getMonth() === month;
                    const isWeekend = di >= 5;

                    return (
                      <div
                        key={key}
                        className={`min-h-[100px] border-r border-b p-1.5 transition-colors ${
                          !isCurrMonth
                            ? "bg-muted/40"
                            : isWeekend
                              ? "bg-muted/15"
                              : ""
                        }`}
                      >
                        <div className="flex items-center justify-center mb-1">
                          <span
                            className={`text-sm w-7 h-7 flex items-center justify-center rounded-full ${
                              isToday
                                ? "bg-primary text-primary-foreground font-bold"
                                : !isCurrMonth
                                  ? "text-muted-foreground/40"
                                  : isWeekend
                                    ? "text-rose-400"
                                    : "text-foreground"
                            }`}
                          >
                            {day.getDate()}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          {dayEvents.slice(0, 3).map((ev) => (
                            <button
                              key={`${ev.id}-${key}`}
                              onClick={() => setSelectedEvent(ev)}
                              className={`w-full text-left text-[11px] leading-tight px-1.5 py-0.5 rounded border cursor-pointer transition-colors truncate ${
                                EVENT_COLORS[ev.dealStatus] ||
                                "bg-gray-100 text-gray-700 border-gray-200"
                              }`}
                            >
                              <span className="font-semibold">
                                {ev.assetCode.replace("EWS-M-", "")}
                              </span>{" "}
                              <span className="opacity-75">
                                {ev.clientName.split(" ")[0]}
                              </span>
                            </button>
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="text-[10px] text-muted-foreground text-center">
                              +{dayEvents.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5" />
            Аренды за {MONTH_NAMES[month].toLowerCase()} ({events.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Нет аренд в этом месяце
            </p>
          ) : (
            <div className="space-y-1">
              {sortedEvents.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => setSelectedEvent(ev)}
                  className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        DOT_COLORS[ev.dealStatus] || "bg-gray-400"
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">
                        {ev.clientName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <span className="font-mono">{ev.assetCode}</span>
                        <span className="mx-1.5">·</span>
                        {formatDate(ev.startDate)} —{" "}
                        {formatDate(ev.endDate)}
                        <span className="mx-1.5">·</span>
                        {DEAL_TYPE_LABELS[ev.dealType as DealType]}
                      </div>
                    </div>
                  </div>
                  <StatusBadge
                    label={
                      DEAL_STATUS_LABELS[ev.dealStatus as DealStatus] ||
                      ev.dealStatus
                    }
                    colorClass={
                      DEAL_STATUS_COLORS[ev.dealStatus as DealStatus]
                    }
                  />
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <RentalCardSheet
        event={selectedEvent}
        open={!!selectedEvent}
        onOpenChange={(open) => {
          if (!open) setSelectedEvent(null);
        }}
      />
    </>
  );
}
