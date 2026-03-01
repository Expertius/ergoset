import { getCalendarEvents } from "@/services/dashboard";
import { PageHeader } from "@/components/shared/page-header";
import { CalendarView } from "@/components/calendar/calendar-view";

type Props = {
  searchParams: Promise<{ month?: string; year?: string }>;
};

export default async function CalendarPage({ searchParams }: Props) {
  const params = await searchParams;
  const now = new Date();
  const month = params.month !== undefined ? parseInt(params.month) : now.getMonth();
  const year = params.year !== undefined ? parseInt(params.year) : now.getFullYear();

  const from = new Date(year, month, 1);
  const to = new Date(year, month + 1, 0);

  const events = await getCalendarEvents(from, to);

  return (
    <div className="space-y-4">
      <PageHeader title="Календарь" description="Расписание аренд и событий" />
      <CalendarView events={events} month={month} year={year} />
    </div>
  );
}
