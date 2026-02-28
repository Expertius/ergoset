import { getCalendarEvents } from "@/services/dashboard";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { DEAL_STATUS_LABELS, DEAL_STATUS_COLORS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function CalendarPage() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 2, 0);

  const events = await getCalendarEvents(from, to);

  const daysInRange: Date[] = [];
  const cursor = new Date(from);
  while (cursor <= to) {
    daysInRange.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  const eventsByDay = new Map<string, typeof events>();
  for (const ev of events) {
    const start = new Date(Math.max(ev.startDate.getTime(), from.getTime()));
    const end = new Date(Math.min(ev.endDate.getTime(), to.getTime()));
    const d = new Date(start);
    while (d <= end) {
      const key = d.toISOString().split("T")[0];
      if (!eventsByDay.has(key)) eventsByDay.set(key, []);
      eventsByDay.get(key)!.push(ev);
      d.setDate(d.getDate() + 1);
    }
  }

  const weeks: Date[][] = [];
  let week: Date[] = [];
  const firstDayOfWeek = (from.getDay() + 6) % 7;
  for (let i = 0; i < firstDayOfWeek; i++) {
    const placeholder = new Date(from);
    placeholder.setDate(placeholder.getDate() - (firstDayOfWeek - i));
    week.push(placeholder);
  }
  for (const day of daysInRange) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) {
      const last = week[week.length - 1];
      const next = new Date(last);
      next.setDate(next.getDate() + 1);
      week.push(next);
    }
    weeks.push(week);
  }

  const today = new Date().toISOString().split("T")[0];
  const dayNames = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Календарь"
        description={`${from.toLocaleDateString("ru-RU", { month: "long", year: "numeric" })} — ${to.toLocaleDateString("ru-RU", { month: "long", year: "numeric" })}`}
      />

      <Card>
        <CardContent className="pt-4 overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-7 mb-2">
              {dayNames.map((d) => (
                <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">
                  {d}
                </div>
              ))}
            </div>

            {weeks.map((w, wi) => (
              <div key={wi} className="grid grid-cols-7 border-t">
                {w.map((day) => {
                  const key = day.toISOString().split("T")[0];
                  const dayEvents = eventsByDay.get(key) || [];
                  const isToday = key === today;
                  const inRange = day >= from && day <= to;

                  return (
                    <div
                      key={key}
                      className={`min-h-[80px] border-r last:border-r-0 p-1 ${
                        !inRange ? "bg-muted/30" : ""
                      } ${isToday ? "bg-blue-50" : ""}`}
                    >
                      <div className={`text-xs mb-1 ${isToday ? "font-bold text-blue-600" : "text-muted-foreground"}`}>
                        {day.getDate()}
                      </div>
                      <div className="space-y-0.5">
                        {dayEvents.slice(0, 3).map((ev) => (
                          <Link
                            key={`${ev.id}-${key}`}
                            href={`/deals/${ev.dealId}`}
                            className="block text-[10px] leading-tight px-1 py-0.5 rounded truncate bg-blue-100 text-blue-800 hover:bg-blue-200"
                          >
                            {ev.assetCode}: {ev.clientName}
                          </Link>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-[10px] text-muted-foreground px-1">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Все события периода</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">Нет событий в выбранном периоде</p>
          ) : (
            <div className="space-y-3">
              {events.map((ev) => (
                <div key={ev.id} className="flex items-center justify-between border-b pb-2 last:border-0 text-sm">
                  <div>
                    <Link href={`/deals/${ev.dealId}`} className="font-medium hover:underline">
                      {ev.clientName}
                    </Link>
                    <p className="text-muted-foreground text-xs">
                      {ev.assetCode} — {ev.assetName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(ev.startDate)} — {formatDate(ev.endDate)}
                    </span>
                    <StatusBadge
                      label={DEAL_STATUS_LABELS[ev.dealStatus]}
                      colorClass={DEAL_STATUS_COLORS[ev.dealStatus]}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
