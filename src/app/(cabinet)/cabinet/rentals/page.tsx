import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getClientByUserId, getClientRentals } from "@/services/cabinet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DEAL_STATUS_LABELS } from "@/lib/constants";
import Link from "next/link";

export default async function CabinetRentalsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const client = await getClientByUserId(session.id);
  if (!client) redirect("/login");

  const rentals = await getClientRentals(client.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Мои аренды</h1>
        <p className="text-muted-foreground">
          Все ваши аренды рабочих станций
        </p>
      </div>

      {rentals.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            У вас пока нет аренд
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {rentals.map((rental) => {
            const isActive = !rental.actualEndDate;
            const daysLeft = isActive
              ? Math.ceil((rental.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              : null;

            return (
              <Link key={rental.id} href={`/cabinet/rentals/${rental.id}`}>
                <Card className="hover:bg-accent/30 transition-colors cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {rental.asset.name}
                        {rental.asset.brand && ` — ${rental.asset.brand}`}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {isActive ? (
                          <Badge variant={daysLeft !== null && daysLeft <= 7 ? "destructive" : "default"}>
                            {daysLeft !== null && daysLeft <= 0 ? "Срок истёк" : `${daysLeft} дн.`}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Завершена</Badge>
                        )}
                        <Badge variant="outline">
                          {DEAL_STATUS_LABELS[rental.deal.status as keyof typeof DEAL_STATUS_LABELS] || rental.deal.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                      <span>Код: {rental.asset.code}</span>
                      <span>Начало: {formatDate(rental.startDate)}</span>
                      <span>Окончание: {formatDate(rental.endDate)}</span>
                      <span>Сумма: {formatCurrency(rental.totalPlannedAmount)}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
