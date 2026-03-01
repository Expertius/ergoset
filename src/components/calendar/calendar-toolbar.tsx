"use client";

import { useCallback, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  GanttChart,
  TableIcon,
  LayoutGrid,
  List,
  Filter,
  X,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DEAL_STATUS_LABELS,
  DEAL_TYPE_LABELS,
} from "@/lib/constants";

const MONTH_NAMES = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

const MONTH_NAMES_SHORT = [
  "Янв", "Фев", "Мар", "Апр", "Май", "Июн",
  "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек",
];

type CalendarView = "month" | "timeline" | "table" | "availability" | "agenda";

type Asset = { id: string; code: string; name: string };

type Props = {
  month: number;
  year: number;
  range: number;
  view: CalendarView;
  assets: Asset[];
  filters: {
    status?: string;
    type?: string;
    asset?: string;
    search?: string;
  };
  zoom: number;
  fitToScreen: boolean;
  showZoomControls: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToScreen: () => void;
  onZoomChange: (value: number) => void;
};

export function CalendarToolbar({ month, year, range, view, assets, filters, zoom, fitToScreen, showZoomControls, onZoomIn, onZoomOut, onFitToScreen }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(filters.search || "");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const now = new Date();
  const isCurrentMonth = now.getMonth() === month && now.getFullYear() === year;

  const buildUrl = useCallback(
    (overrides: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(overrides)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      return `/calendar?${params.toString()}`;
    },
    [searchParams]
  );

  const updateParam = useCallback(
    (key: string, value: string | undefined) => {
      router.push(buildUrl({ [key]: value }));
    },
    [router, buildUrl]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      const current = searchParams.get("search") || "";
      if (search !== current) {
        updateParam("search", search || undefined);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search, searchParams, updateParam]);

  const selectedStatuses = filters.status ? filters.status.split(",") : [];

  const toggleStatus = useCallback(
    (status: string) => {
      const current = new Set(selectedStatuses);
      if (current.has(status)) {
        current.delete(status);
      } else {
        current.add(status);
      }
      const val = Array.from(current).join(",");
      updateParam("status", val || undefined);
    },
    [selectedStatuses, updateParam]
  );

  const activeFilterCount =
    selectedStatuses.length +
    (filters.type ? 1 : 0) +
    (filters.asset ? 1 : 0) +
    (filters.search ? 1 : 0);

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    params.set("month", String(month));
    params.set("year", String(year));
    params.set("view", view);
    if (range !== 1) params.set("range", String(range));
    router.push(`/calendar?${params.toString()}`);
    setSearch("");
  };

  const removeFilter = (key: string, value?: string) => {
    if (key === "status" && value) {
      toggleStatus(value);
    } else if (key === "search") {
      setSearch("");
      updateParam("search", undefined);
    } else if (key === "range") {
      updateParam("range", undefined);
    } else {
      updateParam(key, undefined);
    }
  };

  // Navigation: prev/next shifts by `range` months
  const prevM = month - range;
  const prevMonth = ((prevM % 12) + 12) % 12;
  const prevYear = year + Math.floor(prevM / 12);
  const nextM = month + range;
  const nextMonth = nextM % 12;
  const nextYear = year + Math.floor(nextM / 12);

  // Title for multi-month
  const endMonth = (month + range - 1) % 12;
  const endYear = year + Math.floor((month + range - 1) / 12);
  const title = range === 1
    ? `${MONTH_NAMES[month]} ${year}`
    : endYear === year
      ? `${MONTH_NAMES_SHORT[month]} — ${MONTH_NAMES_SHORT[endMonth]} ${year}`
      : `${MONTH_NAMES_SHORT[month]} ${year} — ${MONTH_NAMES_SHORT[endMonth]} ${endYear}`;

  const assetName = filters.asset
    ? assets.find((a) => a.id === filters.asset)?.code
    : undefined;

  const filtersContent = (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Поиск по клиенту</label>
        <Input
          placeholder="Имя клиента..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Статус сделки</label>
        <div className="space-y-2">
          {Object.entries(DEAL_STATUS_LABELS).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={selectedStatuses.includes(key)}
                onCheckedChange={() => toggleStatus(key)}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Тип сделки</label>
        <Select
          value={filters.type || "all"}
          onValueChange={(v) => updateParam("type", v === "all" ? undefined : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Все типы" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все типы</SelectItem>
            {Object.entries(DEAL_TYPE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Станция</label>
        <Select
          value={filters.asset || "all"}
          onValueChange={(v) => updateParam("asset", v === "all" ? undefined : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Все станции" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все станции</SelectItem>
            {assets.map((a) => (
              <SelectItem key={a.id} value={a.id}>{a.code} — {a.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {activeFilterCount > 0 && (
        <Button variant="ghost" size="sm" onClick={clearAllFilters} className="w-full">
          <X className="h-4 w-4 mr-1" />
          Сбросить фильтры
        </Button>
      )}
    </div>
  );

  const viewBtn = (v: CalendarView, icon: React.ReactNode, label: string) => (
    <Button
      variant={view === v ? "secondary" : "ghost"}
      size="sm"
      className="h-7 px-1.5 sm:px-2.5 text-xs"
      asChild
    >
      <Link href={buildUrl({ view: v })}>
        {icon}
        <span className="hidden lg:inline ml-1">{label}</span>
      </Link>
    </Button>
  );

  return (
    <div className="space-y-2">
      {/* Row 1: Navigation + Range + View Switcher */}
      <div className="flex items-center justify-between gap-1 sm:gap-2">
        {/* Navigation */}
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" asChild>
            <Link href={buildUrl({ month: String(prevMonth), year: String(prevYear) })}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-1.5">
            <h2 className="text-xs sm:text-base font-semibold whitespace-nowrap">{title}</h2>
            {!isCurrentMonth && (
              <Button variant="outline" size="sm" className="h-6 text-[10px] sm:text-xs sm:h-7 hidden sm:inline-flex" asChild>
                <Link href={buildUrl({ month: String(now.getMonth()), year: String(now.getFullYear()) })}>
                  Сегодня
                </Link>
              </Button>
            )}
          </div>
          <Button variant="outline" size="icon" className="h-8 w-8" asChild>
            <Link href={buildUrl({ month: String(nextMonth), year: String(nextYear) })}>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>

          {/* Range switcher */}
          <div className="flex items-center bg-muted rounded-md p-0.5 ml-1 sm:ml-2">
            {[1, 3, 6].map((r) => (
              <Button
                key={r}
                variant={range === r ? "secondary" : "ghost"}
                size="sm"
                className="h-6 px-2 text-[11px] sm:text-xs"
                asChild
              >
                <Link href={buildUrl({ range: r === 1 ? undefined : String(r) })}>
                  {r}м
                </Link>
              </Button>
            ))}
          </div>

          {/* Zoom controls */}
          {showZoomControls && (
            <div className="hidden sm:flex items-center bg-muted rounded-md p-0.5 ml-1 sm:ml-2 gap-0.5">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={onZoomOut}
                disabled={!fitToScreen && zoom <= 0}
                title="Уменьшить"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={fitToScreen ? "secondary" : "ghost"}
                size="sm"
                className="h-6 px-1.5 text-[11px]"
                onClick={onFitToScreen}
                title="Вместить всё"
              >
                <Maximize2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={onZoomIn}
                disabled={!fitToScreen && zoom >= 100}
                title="Увеличить"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>

        {/* View switcher + mobile filter */}
        <div className="flex items-center gap-1">
          <div className="flex items-center bg-muted rounded-lg p-0.5">
            {viewBtn("month", <CalendarDays className="h-3.5 w-3.5" />, "Месяц")}
            {viewBtn("timeline", <GanttChart className="h-3.5 w-3.5" />, "Таймлайн")}
            {viewBtn("table", <TableIcon className="h-3.5 w-3.5" />, "Таблица")}
            {viewBtn("availability", <LayoutGrid className="h-3.5 w-3.5" />, "Станции")}
            {viewBtn("agenda", <List className="h-3.5 w-3.5" />, "Агенда")}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 sm:hidden relative"
            onClick={() => setMobileFiltersOpen(true)}
          >
            <Filter className="h-3.5 w-3.5" />
            {activeFilterCount > 0 && (
              <Badge className="absolute -top-1.5 -right-1.5 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Row 2: Desktop filters */}
      <div className="hidden sm:flex flex-wrap items-center gap-2">
        <Input
          placeholder="Поиск по клиенту..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-[200px] h-8 text-sm"
        />
        <Select
          value={filters.type || "all"}
          onValueChange={(v) => updateParam("type", v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-[160px] h-8 text-sm">
            <SelectValue placeholder="Тип сделки" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все типы</SelectItem>
            {Object.entries(DEAL_TYPE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.asset || "all"}
          onValueChange={(v) => updateParam("asset", v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-[200px] h-8 text-sm">
            <SelectValue placeholder="Все станции" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все станции</SelectItem>
            {assets.map((a) => (
              <SelectItem key={a.id} value={a.id}>{a.code} — {a.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-muted-foreground"
          onClick={() => setMobileFiltersOpen(true)}
        >
          <Filter className="h-3 w-3 mr-1" />
          Статус
        </Button>
      </div>

      {/* Row 3: Active filters bar — always visible when filters are active */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mb-1">
          <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">Фильтры:</span>

          {filters.search && (
            <Badge variant="secondary" className="cursor-pointer text-xs shrink-0 gap-1" onClick={() => removeFilter("search")}>
              Поиск: {filters.search}
              <X className="h-3 w-3" />
            </Badge>
          )}

          {filters.type && (
            <Badge variant="secondary" className="cursor-pointer text-xs shrink-0 gap-1" onClick={() => removeFilter("type")}>
              {DEAL_TYPE_LABELS[filters.type as keyof typeof DEAL_TYPE_LABELS] || filters.type}
              <X className="h-3 w-3" />
            </Badge>
          )}

          {assetName && (
            <Badge variant="secondary" className="cursor-pointer text-xs shrink-0 gap-1" onClick={() => removeFilter("asset")}>
              {assetName}
              <X className="h-3 w-3" />
            </Badge>
          )}

          {selectedStatuses.map((s) => (
            <Badge key={s} variant="secondary" className="cursor-pointer text-xs shrink-0 gap-1" onClick={() => removeFilter("status", s)}>
              {DEAL_STATUS_LABELS[s as keyof typeof DEAL_STATUS_LABELS] || s}
              <X className="h-3 w-3" />
            </Badge>
          ))}

          {range > 1 && (
            <Badge variant="outline" className="cursor-pointer text-xs shrink-0 gap-1" onClick={() => removeFilter("range")}>
              {range} мес.
              <X className="h-3 w-3" />
            </Badge>
          )}

          <Button
            variant="destructive"
            size="sm"
            className="h-6 px-2 text-xs shrink-0 ml-auto"
            onClick={clearAllFilters}
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Сбросить все
          </Button>
        </div>
      )}

      {/* Filter sheet */}
      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetContent side="right" className="w-[300px] sm:w-[340px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Фильтры</SheetTitle>
            <SheetDescription className="sr-only">Фильтрация событий календаря</SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6">
            {filtersContent}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
