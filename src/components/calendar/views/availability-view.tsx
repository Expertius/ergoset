"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ASSET_STATUS_LABELS, ASSET_STATUS_COLORS, DEAL_STATUS_LABELS } from "@/lib/constants";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";
import type { CalendarEvent } from "@/services/dashboard";
import type { AssetStatus, DealStatus } from "@/generated/prisma/browser";

const BAR_COLORS: Record<string, string> = {
  lead: "bg-gray-300",
  booked: "bg-yellow-400",
  delivery_scheduled: "bg-orange-400",
  delivered: "bg-cyan-400",
  active: "bg-emerald-400",
  extended: "bg-blue-400",
  return_scheduled: "bg-amber-400",
  closed_return: "bg-slate-300",
  closed_purchase: "bg-purple-400",
  canceled: "bg-red-300",
};

type Asset = {
  id: string;
  code: string;
  name: string;
  status: AssetStatus;
};

type Props = {
  events: CalendarEvent[];
  assets: Asset[];
  month: number;
  year: number;
  range: number;
  onSelectEvent: (event: CalendarEvent) => void;
};

type AssetCard = {
  asset: Asset;
  currentEvent: CalendarEvent | null;
  nextEvent: CalendarEvent | null;
  allEvents: CalendarEvent[];
  freeFrom: Date | null;
};

export function AvailabilityView({ events, assets, month, year, range, onSelectEvent }: Props) {
  const periodStart = new Date(year, month, 1);
  const periodEnd = new Date(year, month + range, 0);
  const now = new Date();
  const totalDays = Math.round((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const cards = useMemo(() => {
    const result: AssetCard[] = [];

    const filtered = assets.filter((a) => a.status !== "archived" && a.status !== "sold");

    for (const asset of filtered) {
      const assetEvents = events
        .filter((e) => e.assetCode === asset.code)
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

      let currentEvent: CalendarEvent | null = null;
      let nextEvent: CalendarEvent | null = null;
      let freeFrom: Date | null = null;

      for (const ev of assetEvents) {
        const start = new Date(ev.startDate);
        const end = new Date(ev.endDate);
        if (start <= now && end >= now) {
          currentEvent = ev;
          freeFrom = new Date(end.getTime() + 86400000);
        }
      }

      if (!currentEvent) {
        const futureEvents = assetEvents.filter((e) => new Date(e.startDate) > now);
        nextEvent = futureEvents[0] || null;
      }

      result.push({ asset, currentEvent, nextEvent, allEvents: assetEvents, freeFrom });
    }

    result.sort((a, b) => {
      const aOccupied = a.currentEvent ? 0 : 1;
      const bOccupied = b.currentEvent ? 0 : 1;
      if (aOccupied !== bOccupied) return aOccupied - bOccupied;
      if (a.currentEvent && b.currentEvent) {
        const aEnd = new Date(a.currentEvent.endDate).getTime();
        const bEnd = new Date(b.currentEvent.endDate).getTime();
        if (aEnd !== bEnd) return aEnd - bEnd;
      }
      return a.asset.code.localeCompare(b.asset.code);
    });

    return result;
  }, [events, assets, now.toDateString()]);

  const daysUntil = (target: Date) => {
    const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {cards.map(({ asset, currentEvent, nextEvent, allEvents, freeFrom }) => {
        const isOccupied = !!currentEvent;

        return (
          <Card
            key={asset.id}
            className={`transition-colors hover:shadow-md ${
              isOccupied ? "border-l-4 border-l-blue-400" : "border-l-4 border-l-green-400"
            } ${currentEvent ? "cursor-pointer" : ""}`}
            onClick={() => currentEvent && onSelectEvent(currentEvent)}
          >
            <CardContent className="p-4 space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-sm font-bold">{asset.code}</span>
                  <p className="text-xs text-muted-foreground truncate">{asset.name}</p>
                </div>
                <StatusBadge
                  label={isOccupied ? "В аренде" : ASSET_STATUS_LABELS[asset.status]}
                  colorClass={isOccupied ? "bg-blue-100 text-blue-800" : ASSET_STATUS_COLORS[asset.status]}
                />
              </div>

              {/* Info */}
              {currentEvent && (
                <div className="space-y-1 text-xs">
                  <p>
                    <span className="text-muted-foreground">Клиент:</span>{" "}
                    <span className="font-medium">{currentEvent.clientName}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">До:</span>{" "}
                    {formatDate(currentEvent.endDate)}
                  </p>
                  {freeFrom && (
                    <p>
                      <span className="text-muted-foreground">Осталось:</span>{" "}
                      <span className="font-semibold">{daysUntil(new Date(currentEvent.endDate))} дн.</span>
                    </p>
                  )}
                  <StatusBadge
                    label={DEAL_STATUS_LABELS[currentEvent.dealStatus as DealStatus]}
                    colorClass="text-[10px] px-1.5 py-0 bg-muted"
                  />
                </div>
              )}

              {!currentEvent && nextEvent && (
                <div className="space-y-1 text-xs">
                  <p className="text-green-600 font-medium">Свободна</p>
                  <p>
                    <span className="text-muted-foreground">След. аренда:</span>{" "}
                    {formatDate(nextEvent.startDate)}
                    <span className="text-muted-foreground"> ({nextEvent.clientName})</span>
                  </p>
                </div>
              )}

              {!currentEvent && !nextEvent && (
                <p className="text-xs text-green-600 font-medium">Свободна на весь период</p>
              )}

              {/* Mini timeline */}
              <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                {allEvents.map((ev) => {
                  const evStart = new Date(ev.startDate);
                  const evEnd = new Date(ev.endDate);
                  const clampedStart = new Date(Math.max(evStart.getTime(), periodStart.getTime()));
                  const clampedEnd = new Date(Math.min(evEnd.getTime(), periodEnd.getTime()));
                  const startOffset = Math.max(0, (clampedStart.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
                  const duration = Math.max(1, (clampedEnd.getTime() - clampedStart.getTime()) / (1000 * 60 * 60 * 24) + 1);
                  const leftPct = (startOffset / totalDays) * 100;
                  const widthPct = (duration / totalDays) * 100;

                  return (
                    <div
                      key={ev.id}
                      className={`absolute top-0 bottom-0 rounded-full ${BAR_COLORS[ev.dealStatus] || "bg-gray-400"}`}
                      style={{ left: `${leftPct}%`, width: `${Math.min(widthPct, 100 - leftPct)}%` }}
                      title={`${ev.clientName}: ${formatDate(ev.startDate)} — ${formatDate(ev.endDate)}`}
                    />
                  );
                })}
                {/* Today marker */}
                {now >= periodStart && now <= periodEnd && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-primary z-10"
                    style={{ left: `${((now.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24) / totalDays) * 100}%` }}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {cards.length === 0 && (
        <div className="col-span-full text-center text-sm text-muted-foreground py-12">
          Нет станций для отображения
        </div>
      )}
    </div>
  );
}
