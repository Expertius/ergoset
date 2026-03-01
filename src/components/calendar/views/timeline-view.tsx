"use client";

import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { formatDate, formatCurrency } from "@/lib/utils";
import { DEAL_STATUS_LABELS, ASSET_STATUS_LABELS, ASSET_STATUS_COLORS } from "@/lib/constants";
import { StatusBadge } from "@/components/shared/status-badge";
import type { CalendarEvent } from "@/services/dashboard";
import type { DealStatus, AssetStatus } from "@/generated/prisma/browser";

const MONTH_NAMES_SHORT = [
  "Янв", "Фев", "Мар", "Апр", "Май", "Июн",
  "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек",
];

const BAR_COLORS: Record<string, string> = {
  lead: "bg-gray-300 dark:bg-gray-600",
  booked: "bg-yellow-400 dark:bg-yellow-600",
  delivery_scheduled: "bg-orange-400 dark:bg-orange-600",
  delivered: "bg-cyan-400 dark:bg-cyan-600",
  active: "bg-emerald-400 dark:bg-emerald-600",
  extended: "bg-blue-400 dark:bg-blue-600",
  return_scheduled: "bg-amber-400 dark:bg-amber-600",
  closed_return: "bg-slate-300 dark:bg-slate-600",
  closed_purchase: "bg-purple-400 dark:bg-purple-600",
  canceled: "bg-red-300 dark:bg-red-500",
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
  zoom: number;
  fitToScreen: boolean;
  onSelectEvent: (event: CalendarEvent) => void;
};

type DayInfo = {
  date: Date;
  day: number;
  isFirstOfMonth: boolean;
  monthLabel: string;
};

function zoomToColW(zoom: number): number {
  return Math.round(4 + zoom * 0.44);
}

export function TimelineView({ events, assets, month, year, range, zoom, fitToScreen, onSelectEvent }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const now = new Date();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { days, totalDays, eventsByAsset, periodStart, monthBoundaries } = useMemo(() => {
    const pStart = new Date(year, month, 1);
    const pEnd = new Date(year, month + range, 0);
    const ds: DayInfo[] = [];
    const boundaries: number[] = [];

    const cursor = new Date(pStart);
    let idx = 0;
    while (cursor <= pEnd) {
      const isFirst = cursor.getDate() === 1;
      if (isFirst && idx > 0) boundaries.push(idx);
      ds.push({
        date: new Date(cursor),
        day: cursor.getDate(),
        isFirstOfMonth: isFirst,
        monthLabel: MONTH_NAMES_SHORT[cursor.getMonth()],
      });
      cursor.setDate(cursor.getDate() + 1);
      idx++;
    }

    const map = new Map<string, CalendarEvent[]>();
    for (const ev of events) {
      const key = ev.assetCode;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    }

    return { days: ds, totalDays: ds.length, eventsByAsset: map, periodStart: pStart, monthBoundaries: boundaries };
  }, [events, month, year, range]);

  const SIDEBAR_W = useMemo(() => {
    const colW = fitToScreen && containerWidth > 0
      ? Math.max(3, (containerWidth - 140) / totalDays)
      : zoomToColW(zoom);
    if (colW < 10) return 80;
    if (colW < 20) return 110;
    return 140;
  }, [fitToScreen, containerWidth, totalDays, zoom]);

  const COL_W = useMemo(() => {
    if (fitToScreen && containerWidth > 0) {
      return Math.max(3, (containerWidth - SIDEBAR_W) / totalDays);
    }
    return zoomToColW(zoom);
  }, [fitToScreen, containerWidth, totalDays, zoom, SIDEBAR_W]);

  const showDayNumbers = COL_W >= 14;
  const showDayGrid = COL_W >= 6;
  const ROW_H = COL_W >= 16 ? 40 : COL_W >= 10 ? 32 : 26;
  const BAR_H = COL_W >= 16 ? 30 : COL_W >= 10 ? 24 : 20;
  const showBarLabel = COL_W >= 10;

  const sortedAssets = useMemo(() => {
    const getLatestEndDate = (code: string): number => {
      const evts = eventsByAsset.get(code);
      if (!evts || evts.length === 0) return Infinity;
      return Math.max(...evts.map((e) => new Date(e.endDate).getTime()));
    };

    return [...assets]
      .filter((a) => a.status !== "archived" && a.status !== "sold")
      .sort((a, b) => {
        const aHas = eventsByAsset.has(a.code) ? 0 : 1;
        const bHas = eventsByAsset.has(b.code) ? 0 : 1;
        if (aHas !== bHas) return aHas - bHas;
        const aEnd = getLatestEndDate(a.code);
        const bEnd = getLatestEndDate(b.code);
        if (aEnd !== bEnd) return aEnd - bEnd;
        return a.code.localeCompare(b.code);
      });
  }, [assets, eventsByAsset]);

  const todayIdx = useMemo(() => {
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diff = Math.round((todayStart.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff < totalDays ? diff : -1;
  }, [now, periodStart, totalDays]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!containerRef.current) return;
    if (Math.abs(e.deltaX) < Math.abs(e.deltaY) && !fitToScreen) {
      e.preventDefault();
      containerRef.current.scrollLeft += e.deltaY;
    }
  }, [fitToScreen]);

  const contentWidth = SIDEBAR_W + totalDays * COL_W;
  const needsScroll = !fitToScreen && containerWidth > 0 && contentWidth > containerWidth;

  return (
    <Card>
      <CardContent className="pt-4 p-0 sm:p-4 sm:pt-4">
        {/* Desktop timeline */}
        <div
          ref={containerRef}
          className={`hidden sm:block ${needsScroll ? "overflow-x-auto" : "overflow-hidden"}`}
          onWheel={handleWheel}
        >
          <div>
            <TooltipProvider>
              <div style={{ width: fitToScreen ? "100%" : contentWidth }}>
                {/* Month sub-headers */}
                {range > 1 && (
                  <div className="flex border-b">
                    <div className="shrink-0" style={{ width: SIDEBAR_W }} />
                    {(() => {
                      const segments: { label: string; span: number }[] = [];
                      let curLabel = days[0].monthLabel;
                      let curSpan = 0;
                      for (const d of days) {
                        if (d.monthLabel !== curLabel) {
                          segments.push({ label: curLabel, span: curSpan });
                          curLabel = d.monthLabel;
                          curSpan = 0;
                        }
                        curSpan++;
                      }
                      segments.push({ label: curLabel, span: curSpan });
                      return segments.map((seg, i) => (
                        <div
                          key={i}
                          className="text-center text-xs font-semibold py-1 border-r bg-muted/30 truncate"
                          style={{ width: seg.span * COL_W, minWidth: 0 }}
                        >
                          {seg.span * COL_W > 20 ? seg.label : ""}
                        </div>
                      ));
                    })()}
                  </div>
                )}

                {/* Day headers */}
                <div className="flex border-b sticky top-0 bg-background z-10">
                  <div
                    className="shrink-0 px-2 py-1.5 text-xs font-medium text-muted-foreground border-r truncate"
                    style={{ width: SIDEBAR_W }}
                  >
                    Станция
                  </div>
                  {showDayGrid ? (
                    days.map((d, i) => {
                      const isToday = i === todayIdx;
                      const dow = (d.date.getDay() + 6) % 7;
                      const isWeekend = dow >= 5;
                      const isMonthBoundary = monthBoundaries.includes(i);
                      return (
                        <div
                          key={i}
                          className={`text-center py-1.5 border-r ${
                            isToday
                              ? "bg-primary/10 font-bold text-primary"
                              : isWeekend
                                ? "text-rose-400 bg-muted/20"
                                : "text-muted-foreground"
                          } ${isMonthBoundary ? "border-l-2 border-l-border" : ""}`}
                          style={{ width: COL_W, minWidth: COL_W, fontSize: COL_W < 20 ? 9 : 11 }}
                        >
                          {showDayNumbers ? d.day : ""}
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex-1 relative" style={{ height: 24 }}>
                      {monthBoundaries.map((bIdx) => (
                        <div
                          key={bIdx}
                          className="absolute top-0 bottom-0 border-l-2 border-l-border"
                          style={{ left: bIdx * COL_W }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Asset rows */}
                {sortedAssets.map((asset) => {
                  const assetEvents = eventsByAsset.get(asset.code) || [];
                  return (
                    <div key={asset.id} className="flex border-b hover:bg-muted/30 transition-colors group">
                      <div
                        className="shrink-0 px-2 py-1 border-r flex flex-col justify-center"
                        style={{ width: SIDEBAR_W }}
                      >
                        <span className="font-mono text-xs font-semibold truncate">
                          {asset.code.replace("EWS-M-", "")}
                        </span>
                        {SIDEBAR_W >= 100 && (
                          <StatusBadge
                            label={ASSET_STATUS_LABELS[asset.status]}
                            colorClass={`${ASSET_STATUS_COLORS[asset.status]} text-[10px] px-1.5 py-0`}
                          />
                        )}
                      </div>
                      <div className="relative flex-1" style={{ height: ROW_H }}>
                        {/* Day grid lines */}
                        {showDayGrid ? (
                          <div className="absolute inset-0 flex">
                            {days.map((d, i) => {
                              const isToday = i === todayIdx;
                              const dow = (d.date.getDay() + 6) % 7;
                              const isWeekend = dow >= 5;
                              const isMonthBoundary = monthBoundaries.includes(i);
                              return (
                                <div
                                  key={i}
                                  className={`border-r ${
                                    isToday
                                      ? "bg-primary/5"
                                      : isWeekend
                                        ? "bg-muted/15"
                                        : ""
                                  } ${isMonthBoundary ? "border-l-2 border-l-border" : ""}`}
                                  style={{ width: COL_W, minWidth: COL_W }}
                                />
                              );
                            })}
                          </div>
                        ) : (
                          <div className="absolute inset-0">
                            {todayIdx >= 0 && (
                              <div
                                className="absolute top-0 bottom-0 bg-primary/5"
                                style={{ left: todayIdx * COL_W, width: COL_W }}
                              />
                            )}
                            {monthBoundaries.map((bIdx) => (
                              <div
                                key={bIdx}
                                className="absolute top-0 bottom-0 border-l-2 border-l-border"
                                style={{ left: bIdx * COL_W }}
                              />
                            ))}
                          </div>
                        )}
                        {/* Event bars */}
                        {assetEvents.map((ev) => {
                          const start = new Date(ev.startDate);
                          const end = new Date(ev.endDate);
                          const periodEndDate = new Date(year, month + range, 0);

                          const clampedStart = new Date(Math.max(start.getTime(), periodStart.getTime()));
                          const clampedEnd = new Date(Math.min(end.getTime(), periodEndDate.getTime()));

                          const startOffset = Math.round((clampedStart.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
                          const endOffset = Math.round((clampedEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));

                          const left = startOffset * COL_W;
                          const width = (endOffset - startOffset + 1) * COL_W - 2;

                          const startsBeforePeriod = start < periodStart;
                          const endsAfterPeriod = end > periodEndDate;
                          const barTop = (ROW_H - BAR_H) / 2;

                          return (
                            <Tooltip key={ev.id}>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => onSelectEvent(ev)}
                                  className={`absolute cursor-pointer transition-opacity hover:opacity-80 ${
                                    BAR_COLORS[ev.dealStatus] || "bg-gray-400"
                                  } ${startsBeforePeriod ? "rounded-l-none" : "rounded-l-md"} ${
                                    endsAfterPeriod ? "rounded-r-none" : "rounded-r-md"
                                  }`}
                                  style={{
                                    top: barTop,
                                    left,
                                    width: Math.max(width, Math.max(COL_W - 2, 3)),
                                    height: BAR_H,
                                  }}
                                >
                                  {showBarLabel && width > 30 && (
                                    <span
                                      className="text-white font-medium px-1 truncate block drop-shadow-sm"
                                      style={{ fontSize: BAR_H >= 28 ? 10 : 9, lineHeight: `${BAR_H}px` }}
                                    >
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
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {sortedAssets.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    Нет станций для отображения
                  </div>
                )}
              </div>
            </TooltipProvider>
          </div>
        </div>

        {/* Mobile timeline — stacked cards */}
        <div className="sm:hidden space-y-2 p-3">
          {sortedAssets.map((asset) => {
            const assetEvents = eventsByAsset.get(asset.code) || [];
            return (
              <div key={asset.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-mono text-sm font-semibold">
                      {asset.code.replace("EWS-M-", "")}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">{asset.name}</span>
                  </div>
                  <StatusBadge
                    label={ASSET_STATUS_LABELS[asset.status]}
                    colorClass={ASSET_STATUS_COLORS[asset.status]}
                  />
                </div>
                {assetEvents.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Свободна</p>
                ) : (
                  <div className="space-y-1">
                    {assetEvents.map((ev) => (
                      <button
                        key={ev.id}
                        onClick={() => onSelectEvent(ev)}
                        className={`w-full text-left p-2 rounded text-xs transition-colors ${
                          BAR_COLORS[ev.dealStatus] || "bg-gray-400"
                        } text-white`}
                      >
                        <div className="font-medium">{ev.clientName}</div>
                        <div className="opacity-80">
                          {formatDate(ev.startDate)} — {formatDate(ev.endDate)}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
