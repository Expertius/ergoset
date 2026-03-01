import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { buildDealScope } from "@/lib/rbac";
import { getCalendarEvents } from "@/services/dashboard";
import { getAssets } from "@/services/assets";
import { PageHeader } from "@/components/shared/page-header";
import { CalendarPageClient } from "@/components/calendar/calendar-page-client";
import type { DealStatus, DealType } from "@/generated/prisma/browser";

type Props = {
  searchParams: Promise<{
    month?: string;
    year?: string;
    view?: string;
    range?: string;
    status?: string;
    type?: string;
    asset?: string;
    search?: string;
  }>;
};

export default async function CalendarPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const dealScope = buildDealScope(session);
  const params = await searchParams;
  const now = new Date();
  const month =
    params.month !== undefined ? parseInt(params.month) : now.getMonth();
  const year =
    params.year !== undefined ? parseInt(params.year) : now.getFullYear();

  const range = [1, 3, 6].includes(parseInt(params.range || "1"))
    ? parseInt(params.range || "1")
    : 1;

  const from = new Date(year, month, 1);
  const to = new Date(year, month + range, 0);

  const statuses = params.status
    ? (params.status.split(",") as DealStatus[])
    : undefined;

  const [events, assets] = await Promise.all([
    getCalendarEvents(from, to, {
      statuses,
      dealType: params.type as DealType | undefined,
      assetId: params.asset,
      search: params.search,
      ...dealScope,
    }),
    getAssets(),
  ]);

  const view = (params.view as "month" | "timeline" | "table" | "availability" | "agenda") || "month";

  return (
    <div className="space-y-4">
      <PageHeader title="Календарь" description="Расписание аренд и событий" />
      <CalendarPageClient
        events={events}
        assets={assets}
        month={month}
        year={year}
        range={range}
        view={view}
        filters={{
          status: params.status,
          type: params.type,
          asset: params.asset,
          search: params.search,
        }}
      />
    </div>
  );
}
