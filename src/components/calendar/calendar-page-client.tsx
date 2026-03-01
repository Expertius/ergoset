"use client";

import { useState, useCallback } from "react";
import { CalendarToolbar } from "./calendar-toolbar";
import { MonthGridView } from "./views/month-grid-view";
import { TimelineView } from "./views/timeline-view";
import { CalendarTableView } from "./views/table-view";
import { AvailabilityView } from "./views/availability-view";
import { AgendaView } from "./views/agenda-view";
import { RentalCardSheet } from "./rental-card-sheet";
import type { CalendarEvent } from "@/services/dashboard";
import type { AssetStatus } from "@/generated/prisma/browser";

type CalendarViewType = "month" | "timeline" | "table" | "availability" | "agenda";

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
  view: CalendarViewType;
  filters: {
    status?: string;
    type?: string;
    asset?: string;
    search?: string;
  };
};

const ZOOM_MIN = 0;
const ZOOM_MAX = 100;
const ZOOM_STEP = 10;

export function CalendarPageClient({ events, assets, month, year, range, view, filters }: Props) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [zoom, setZoom] = useState(50);
  const [fitToScreen, setFitToScreen] = useState(true);

  const handleZoomChange = useCallback((value: number) => {
    setZoom(Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, value)));
    setFitToScreen(false);
  }, []);

  const handleZoomIn = useCallback(() => {
    handleZoomChange(zoom + ZOOM_STEP);
  }, [zoom, handleZoomChange]);

  const handleZoomOut = useCallback(() => {
    handleZoomChange(zoom - ZOOM_STEP);
  }, [zoom, handleZoomChange]);

  const handleFitToScreen = useCallback(() => {
    setFitToScreen(true);
  }, []);

  const showZoomControls = view === "timeline" || view === "month";

  return (
    <>
      <CalendarToolbar
        month={month}
        year={year}
        range={range}
        view={view}
        assets={assets}
        filters={filters}
        zoom={zoom}
        fitToScreen={fitToScreen}
        showZoomControls={showZoomControls}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitToScreen={handleFitToScreen}
        onZoomChange={handleZoomChange}
      />

      {view === "month" && (
        <MonthGridView
          events={events}
          month={month}
          year={year}
          range={range}
          zoom={zoom}
          fitToScreen={fitToScreen}
          onSelectEvent={setSelectedEvent}
        />
      )}

      {view === "timeline" && (
        <TimelineView
          events={events}
          assets={assets}
          month={month}
          year={year}
          range={range}
          zoom={zoom}
          fitToScreen={fitToScreen}
          onSelectEvent={setSelectedEvent}
        />
      )}

      {view === "table" && (
        <CalendarTableView
          events={events}
          onSelectEvent={setSelectedEvent}
        />
      )}

      {view === "availability" && (
        <AvailabilityView
          events={events}
          assets={assets}
          month={month}
          year={year}
          range={range}
          onSelectEvent={setSelectedEvent}
        />
      )}

      {view === "agenda" && (
        <AgendaView
          events={events}
          month={month}
          year={year}
          range={range}
          onSelectEvent={setSelectedEvent}
        />
      )}

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
