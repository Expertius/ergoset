"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import { DEAL_STATUS_LABELS, DEAL_STATUS_COLORS } from "@/lib/constants";
import type { CalendarEvent } from "@/services/dashboard";
import type { DealStatus } from "@/generated/prisma/browser";

const DAY_NAMES_FULL = [
  "воскресенье", "понедельник", "вторник", "среда",
  "четверг", "пятница", "суббота",
];

const MONTH_NAMES_GEN = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

type Props = {
  events: CalendarEvent[];
  month: number;
  year: number;
  range: number;
  onSelectEvent: (event: CalendarEvent) => void;
};

type DayGroup = {
  date: Date;
  dateKey: string;
  events: CalendarEvent[];
};

export function AgendaView({ events, month, year, range, onSelectEvent }: Props) {
  const now = new Date();
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const groups = useMemo(() => {
    const periodStart = new Date(year, month, 1);
    const periodEnd = new Date(year, month + range, 0);

    const dateEvents = new Map<string, CalendarEvent[]>();

    for (const ev of events) {
      const start = new Date(ev.startDate);
      const end = new Date(ev.endDate);

      // Start date
      if (start >= periodStart && start <= periodEnd) {
        const key = toKey(start);
        if (!dateEvents.has(key)) dateEvents.set(key, []);
        const arr = dateEvents.get(key)!;
        if (!arr.some((e) => e.id === ev.id)) arr.push(ev);
      }

      // End date
      if (end >= periodStart && end <= periodEnd) {
        const key = toKey(end);
        if (!dateEvents.has(key)) dateEvents.set(key, []);
        const arr = dateEvents.get(key)!;
        if (!arr.some((e) => e.id === ev.id)) arr.push(ev);
      }
    }

    const result: DayGroup[] = [];
    const sorted = Array.from(dateEvents.entries()).sort((a, b) => a[0].localeCompare(b[0]));

    for (const [key, evts] of sorted) {
      const [y, m, d] = key.split("-").map(Number);
      result.push({
        date: new Date(y, m - 1, d),
        dateKey: key,
        events: evts.sort((a, b) => a.assetCode.localeCompare(b.assetCode)),
      });
    }

    return result;
  }, [events, month, year, range]);

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          Нет аренд в выбранном периоде
        </CardContent>
      </Card>
    );
  }

  if (groups.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          Нет ключевых дат (начало/конец аренды) в выбранном периоде
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-1">
      {groups.map(({ date, dateKey, events: dayEvents }) => {
        const isToday = dateKey === todayKey;
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;

        return (
          <div key={dateKey}>
            {/* Day header */}
            <div
              className={`sticky top-0 z-10 px-3 py-1.5 text-xs font-semibold border-b ${
                isToday
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "bg-muted/60 text-muted-foreground"
              }`}
            >
              <span className={isWeekend ? "text-rose-500" : ""}>
                {date.getDate()} {MONTH_NAMES_GEN[date.getMonth()]} {date.getFullYear()},{" "}
                {DAY_NAMES_FULL[date.getDay()]}
              </span>
              {isToday && (
                <Badge variant="default" className="ml-2 text-[10px] px-1.5 py-0">
                  Сегодня
                </Badge>
              )}
            </div>

            {/* Events */}
            <div className="divide-y">
              {dayEvents.map((ev) => {
                const isStart = toKey(new Date(ev.startDate)) === dateKey;
                const isEnd = toKey(new Date(ev.endDate)) === dateKey;

                return (
                  <button
                    key={`${ev.id}-${dateKey}`}
                    onClick={() => onSelectEvent(ev)}
                    className="w-full text-left px-3 py-2.5 hover:bg-muted/40 transition-colors flex items-center gap-3 cursor-pointer"
                  >
                    {/* Event type indicator */}
                    <div className="shrink-0 text-[10px] text-muted-foreground w-12 text-center">
                      {isStart && isEnd ? (
                        <span className="text-amber-600 font-medium">1 день</span>
                      ) : isStart ? (
                        <span className="text-green-600 font-medium">Начало</span>
                      ) : (
                        <span className="text-red-500 font-medium">Конец</span>
                      )}
                    </div>

                    {/* Asset code */}
                    <span className="font-mono text-xs font-bold w-16 sm:w-24 shrink-0 truncate">
                      {ev.assetCode}
                    </span>

                    {/* Client */}
                    <span className="text-sm flex-1 min-w-0 truncate">
                      {ev.clientName}
                    </span>

                    {/* Status badge */}
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 shrink-0 hidden sm:inline-flex ${
                        DEAL_STATUS_COLORS[ev.dealStatus as DealStatus] || ""
                      }`}
                    >
                      {DEAL_STATUS_LABELS[ev.dealStatus as DealStatus]}
                    </Badge>

                    {/* Amount */}
                    {ev.totalPlannedAmount > 0 && (
                      <span className="text-xs text-muted-foreground shrink-0 hidden sm:block w-20 text-right">
                        {formatCurrency(ev.totalPlannedAmount)}
                      </span>
                    )}

                    {/* Period */}
                    <span className="text-[11px] text-muted-foreground shrink-0 hidden md:block">
                      {formatDate(ev.startDate)} — {formatDate(ev.endDate)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function toKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
