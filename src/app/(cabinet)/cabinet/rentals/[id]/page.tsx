import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getClientByUserId, getClientRentalById } from "@/services/cabinet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DEAL_STATUS_LABELS } from "@/lib/constants";
import Link from "next/link";
import { ArrowLeft, Truck, FileText, Package } from "lucide-react";

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

const DELIVERY_STATUS_COLORS: Record<string, string> = {
  planned: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  canceled: "bg-gray-100 text-gray-800",
};

const DOC_TYPE_LABELS: Record<string, string> = {
  rental_contract: "Договор аренды",
  transfer_act: "Акт приёма-передачи",
  return_act: "Акт возврата",
  buyout_doc: "Документ выкупа",
  equipment_appendix: "Приложение с оборудованием",
};

export default async function CabinetRentalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const client = await getClientByUserId(session.id);
  if (!client) redirect("/login");

  const rental = await getClientRentalById(client.id, id);
  if (!rental) notFound();

  const isActive = !rental.actualEndDate;
  const daysLeft = isActive
    ? Math.ceil((rental.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/cabinet/rentals"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {rental.asset.name}
            {rental.asset.brand && ` — ${rental.asset.brand}`}
          </h1>
          <p className="text-muted-foreground">
            {rental.asset.code}
            {rental.asset.type && ` · ${rental.asset.type}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isActive && daysLeft !== null && (
            <Badge variant={daysLeft <= 7 ? "destructive" : "default"}>
              {daysLeft <= 0 ? "Срок истёк" : `Осталось ${daysLeft} дн.`}
            </Badge>
          )}
          <Badge variant="outline">
            {DEAL_STATUS_LABELS[rental.deal.status as keyof typeof DEAL_STATUS_LABELS] || rental.deal.status}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Rental info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Информация об аренде</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Начало</span>
              <span>{formatDate(rental.startDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Окончание</span>
              <span>{formatDate(rental.endDate)}</span>
            </div>
            {rental.actualEndDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Факт. окончание</span>
                <span>{formatDate(rental.actualEndDate)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Аренда</span>
              <span>{formatCurrency(rental.rentAmount)}</span>
            </div>
            {rental.deliveryAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Доставка</span>
                <span>{formatCurrency(rental.deliveryAmount)}</span>
              </div>
            )}
            {rental.depositAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Депозит</span>
                <span>{formatCurrency(rental.depositAmount)}</span>
              </div>
            )}
            {rental.discountAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Скидка</span>
                <span className="text-green-600">-{formatCurrency(rental.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2 font-medium">
              <span>Итого</span>
              <span>{formatCurrency(rental.totalPlannedAmount)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Periods */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Периоды аренды</CardTitle>
          </CardHeader>
          <CardContent>
            {rental.periods.length === 0 ? (
              <p className="text-sm text-muted-foreground">Нет периодов</p>
            ) : (
              <div className="space-y-3">
                {rental.periods.map((period) => (
                  <div key={period.id} className="border-b pb-2 last:border-0 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Период {period.periodNumber}</span>
                      <span>{formatCurrency(period.amountTotal)}</span>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {formatDate(period.startDate)} — {formatDate(period.endDate)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Accessories */}
      {rental.accessories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-4 w-4" />
              Аксессуары
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {rental.accessories.map((line) => (
                <div key={line.id} className="flex items-center justify-between text-sm">
                  <span>
                    {line.accessory.name} × {line.qty}
                  </span>
                  {line.isIncluded ? (
                    <Badge variant="secondary">Включено</Badge>
                  ) : (
                    <span>{formatCurrency(line.price * line.qty)}</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delivery tasks */}
      {rental.deliveryTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Truck className="h-4 w-4" />
              Доставки
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rental.deliveryTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="text-sm font-medium">
                      {DELIVERY_TYPE_LABELS[task.type] || task.type}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {task.plannedAt ? formatDate(task.plannedAt) : "Дата не назначена"}
                      {task.address && ` · ${task.address}`}
                    </p>
                  </div>
                  <Badge className={DELIVERY_STATUS_COLORS[task.status] || ""} variant="outline">
                    {DELIVERY_STATUS_LABELS[task.status] || task.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents */}
      {rental.documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Документы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {rental.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{DOC_TYPE_LABELS[doc.type] || doc.type}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(doc.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{doc.status}</Badge>
                    <a
                      href={`/api/documents/${doc.id}/download`}
                      className="text-xs text-primary hover:underline"
                    >
                      Скачать
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
