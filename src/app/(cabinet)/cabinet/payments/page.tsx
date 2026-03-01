import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getClientByUserId, getClientPayments } from "@/services/cabinet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  PAYMENT_KIND_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/constants";

export default async function CabinetPaymentsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const client = await getClientByUserId(session.id);
  if (!client) redirect("/login");

  const payments = await getClientPayments(client.id);

  const totalPaid = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalPlanned = payments
    .filter((p) => p.status === "planned" || p.status === "partially_paid")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Платежи</h1>
        <p className="text-muted-foreground">
          История и предстоящие платежи
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Оплачено
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              К оплате
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPlanned)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Все платежи</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">Нет платежей</p>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {PAYMENT_KIND_LABELS[payment.kind as keyof typeof PAYMENT_KIND_LABELS] || payment.kind}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(payment.date)}
                      {payment.rental?.asset &&
                        ` · ${payment.rental.asset.code} ${payment.rental.asset.name}`}
                      {` · ${PAYMENT_METHOD_LABELS[payment.method as keyof typeof PAYMENT_METHOD_LABELS] || payment.method}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{formatCurrency(payment.amount)}</span>
                    <Badge
                      className={PAYMENT_STATUS_COLORS[payment.status as keyof typeof PAYMENT_STATUS_COLORS] || ""}
                      variant="outline"
                    >
                      {PAYMENT_STATUS_LABELS[payment.status as keyof typeof PAYMENT_STATUS_LABELS] || payment.status}
                    </Badge>
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
