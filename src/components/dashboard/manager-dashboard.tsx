import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getManagerDashboardData } from "@/services/dashboard-scoped";
import { formatDate } from "@/lib/utils";
import { DEAL_STATUS_LABELS, DEAL_STATUS_COLORS } from "@/lib/constants";
import { StatusBadge } from "@/components/shared/status-badge";
import Link from "next/link";
import { FileText, UserPlus, CalendarDays, AlertTriangle } from "lucide-react";

export async function ManagerDashboard({ userId }: { userId: string }) {
  const data = await getManagerDashboardData(userId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Мой дашборд</h1>
        <p className="text-muted-foreground">Ваши сделки и задачи</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Всего сделок
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.myDealsCount}</div>
            <Link href="/deals" className="text-xs text-primary hover:underline">
              Посмотреть все
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Активные сделки
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.myActiveDeals}</div>
            <p className="text-xs text-muted-foreground">Сейчас в работе</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Новые лиды
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.myNewLeads}</div>
            <Link href="/leads" className="text-xs text-primary hover:underline">
              Обработать
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Предстоящие возвраты (7 дней)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.myUpcomingReturns.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Нет предстоящих возвратов
            </p>
          ) : (
            <div className="space-y-3">
              {data.myUpcomingReturns.map((r) => {
                const daysLeft = Math.ceil(
                  (r.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                );
                return (
                  <div
                    key={r.id}
                    className="flex items-center justify-between border-b pb-2 last:border-0"
                  >
                    <div>
                      <Link
                        href={`/deals/${r.dealId}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {r.deal.client.fullName}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {r.asset.code} — до {formatDate(r.endDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge
                        label={DEAL_STATUS_LABELS[r.deal.status]}
                        colorClass={DEAL_STATUS_COLORS[r.deal.status]}
                      />
                      <span
                        className={`text-xs font-medium ${
                          daysLeft <= 1
                            ? "text-red-600"
                            : daysLeft <= 3
                              ? "text-orange-600"
                              : "text-yellow-600"
                        }`}
                      >
                        {daysLeft <= 0 ? "Сегодня!" : `${daysLeft} дн.`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
