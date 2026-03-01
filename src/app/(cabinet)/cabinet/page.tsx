import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getClientByUserId, getClientDashboardData } from "@/services/cabinet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DEAL_STATUS_LABELS } from "@/lib/constants";
import { Armchair, CreditCard, CalendarDays, Truck } from "lucide-react";
import Link from "next/link";

const DELIVERY_TYPE_LABELS: Record<string, string> = {
  delivery: "Доставка",
  pickup: "Вывоз",
  replacement: "Замена",
  maintenance_visit: "Обслуживание",
};

const DELIVERY_STATUS_LABELS: Record<string, string> = {
  planned: "Запланирована",
  in_progress: "В процессе",
  completed: "Завершена",
  canceled: "Отменена",
};

export default async function CabinetDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const client = await getClientByUserId(session.id);
  if (!client) redirect("/login");

  const { activeRentals, upcomingPayments, recentDocuments } =
    await getClientDashboardData(client.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Добро пожаловать, {session.fullName || "Клиент"}
        </h1>
        <p className="text-muted-foreground">
          Обзор ваших аренд и предстоящих событий
        </p>
      </div>

      {/* Active rentals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Armchair className="h-5 w-5" />
            Активные аренды ({activeRentals.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeRentals.length === 0 ? (
            <p className="text-sm text-muted-foreground">Нет активных аренд</p>
          ) : (
            <div className="space-y-4">
              {activeRentals.map((rental) => {
                const daysLeft = Math.ceil(
                  (rental.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                );
                const nextTask = rental.deliveryTasks[0];
                return (
                  <Link
                    key={rental.id}
                    href={`/cabinet/rentals/${rental.id}`}
                    className="block rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {rental.asset.name}
                          {rental.asset.brand && ` — ${rental.asset.brand}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {rental.asset.code} · {formatDate(rental.startDate)} — {formatDate(rental.endDate)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={daysLeft <= 7 ? "destructive" : "secondary"}>
                          {daysLeft <= 0 ? "Срок истёк" : `${daysLeft} дн.`}
                        </Badge>
                        <Badge variant="outline">
                          {DEAL_STATUS_LABELS[rental.deal.status as keyof typeof DEAL_STATUS_LABELS] || rental.deal.status}
                        </Badge>
                      </div>
                    </div>
                    {nextTask && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <Truck className="h-4 w-4" />
                        <span>
                          {DELIVERY_TYPE_LABELS[nextTask.type] || nextTask.type}:{" "}
                          {DELIVERY_STATUS_LABELS[nextTask.status] || nextTask.status}
                          {nextTask.plannedAt && ` · ${formatDate(nextTask.plannedAt)}`}
                        </span>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Предстоящие платежи
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingPayments.length === 0 ? (
              <p className="text-sm text-muted-foreground">Нет предстоящих платежей</p>
            ) : (
              <div className="space-y-3">
                {upcomingPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between border-b pb-2 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {payment.rental?.asset?.name || "Платёж"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(payment.date)}
                      </p>
                    </div>
                    <span className="font-medium">{formatCurrency(payment.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Последние документы
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentDocuments.length === 0 ? (
              <p className="text-sm text-muted-foreground">Нет документов</p>
            ) : (
              <div className="space-y-3">
                {recentDocuments.map((doc) => (
                  <Link
                    key={doc.id}
                    href="/cabinet/documents"
                    className="flex items-center justify-between border-b pb-2 last:border-0 hover:bg-accent/30 rounded px-1 -mx-1 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {doc.rental?.asset?.name || "Документ"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(doc.createdAt)}
                      </p>
                    </div>
                    <Badge variant="outline">{doc.status}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
