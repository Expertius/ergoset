import { notFound } from "next/navigation";
import { getDealById } from "@/services/deals";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  DEAL_TYPE_LABELS,
  DEAL_STATUS_LABELS,
  DEAL_STATUS_COLORS,
  DEAL_TYPE_COLORS,
  PAYMENT_KIND_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
} from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DealActions } from "@/components/deals/deal-actions";
import { GenerateDocButton } from "@/components/documents/generate-doc-button";
import Link from "next/link";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function DealDetailPage({ params }: Props) {
  const { id } = await params;
  const deal = await getDealById(id);

  if (!deal) return notFound();

  const rental = deal.rentals[0];

  return (
    <div className="space-y-6">
      <PageHeader title={`Сделка: ${deal.client.fullName}`} />

      <div className="flex items-center gap-3 flex-wrap">
        <StatusBadge
          label={DEAL_TYPE_LABELS[deal.type]}
          colorClass={DEAL_TYPE_COLORS[deal.type]}
        />
        <StatusBadge
          label={DEAL_STATUS_LABELS[deal.status]}
          colorClass={DEAL_STATUS_COLORS[deal.status]}
        />
        {deal.source && (
          <span className="text-sm text-muted-foreground">
            Источник: {deal.source}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <DealActions
          dealId={deal.id}
          dealStatus={deal.status}
          rentalId={rental?.id}
        />
        <GenerateDocButton dealId={deal.id} rentalId={rental?.id} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Client */}
        <Card>
          <CardHeader>
            <CardTitle>Клиент</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">ФИО</dt>
                <dd>
                  <Link href={`/clients/${deal.client.id}`} className="font-medium hover:underline">
                    {deal.client.fullName}
                  </Link>
                </dd>
              </div>
              {deal.client.phone && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Телефон</dt>
                  <dd className="font-mono">{deal.client.phone}</dd>
                </div>
              )}
              {deal.client.email && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Email</dt>
                  <dd>{deal.client.email}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        {/* Rental info */}
        {rental && (
          <Card>
            <CardHeader>
              <CardTitle>Аренда</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Станция</dt>
                  <dd>
                    <Link href={`/assets/${rental.asset.id}`} className="font-mono font-medium hover:underline">
                      {rental.asset.code}
                    </Link>
                    {" — "}
                    {rental.asset.name}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Период</dt>
                  <dd>{formatDate(rental.startDate)} — {formatDate(rental.endDate)}</dd>
                </div>
                {rental.plannedMonths && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Срок</dt>
                    <dd>{rental.plannedMonths} мес.</dd>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Аренда</dt>
                  <dd>{formatCurrency(rental.rentAmount)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Доставка</dt>
                  <dd>{formatCurrency(rental.deliveryAmount)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Сборка</dt>
                  <dd>{formatCurrency(rental.assemblyAmount)}</dd>
                </div>
                {rental.depositAmount > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Залог</dt>
                    <dd>{formatCurrency(rental.depositAmount)}</dd>
                  </div>
                )}
                {rental.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Скидка</dt>
                    <dd className="text-red-600">−{formatCurrency(rental.discountAmount)}</dd>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-medium">
                  <dt>Итого</dt>
                  <dd>{formatCurrency(rental.totalPlannedAmount)}</dd>
                </div>
              </dl>
              {rental.addressDelivery && (
                <>
                  <Separator className="my-3" />
                  <p className="text-sm text-muted-foreground">
                    Адрес доставки: {rental.addressDelivery}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Rental periods */}
      {rental && rental.periods.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Периоды аренды</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rental.periods.map((p) => (
                <div key={p.id} className="flex items-center justify-between border-b pb-2 last:border-0 text-sm">
                  <div>
                    <span className="font-medium">Период {p.periodNumber}</span>
                    <span className="text-muted-foreground ml-2">
                      ({p.type === "first" ? "первый" : p.type === "extension" ? "продление" : p.type})
                    </span>
                    <p className="text-muted-foreground">
                      {formatDate(p.startDate)} — {formatDate(p.endDate)}
                    </p>
                    {p.comment && (
                      <p className="text-muted-foreground text-xs">{p.comment}</p>
                    )}
                  </div>
                  <span className="font-medium">{formatCurrency(p.amountTotal)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accessories */}
      {rental && rental.accessories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Аксессуары</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {rental.accessories.map((a) => (
                <div key={a.id} className="flex items-center justify-between border-b pb-2 last:border-0 text-sm">
                  <div>
                    <span className="font-medium">{a.accessory.name}</span>
                    <span className="text-muted-foreground ml-2">x{a.qty}</span>
                    {a.isIncluded && (
                      <span className="text-xs text-green-600 ml-2">Включено</span>
                    )}
                  </div>
                  <span className="font-medium">
                    {a.price > 0 ? formatCurrency(a.price) : "—"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delivery Tasks */}
      {rental && rental.deliveryTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Логистика</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {rental.deliveryTasks.map((t) => (
                <div key={t.id} className="flex items-center justify-between border-b pb-2 last:border-0 text-sm">
                  <div>
                    <span className="font-medium">
                      {t.type === "delivery" ? "Доставка" : t.type === "pickup" ? "Забор" : t.type === "replacement" ? "Замена" : "Обслуживание"}
                    </span>
                    {t.plannedAt && (
                      <p className="text-muted-foreground text-xs">{formatDate(t.plannedAt)}</p>
                    )}
                    {t.assignee && (
                      <p className="text-muted-foreground text-xs">Исполнитель: {t.assignee}</p>
                    )}
                  </div>
                  <StatusBadge
                    label={t.status === "planned" ? "Запланировано" : t.status === "in_progress" ? "В процессе" : t.status === "completed" ? "Выполнено" : "Отменено"}
                    colorClass={
                      t.status === "completed" ? "bg-green-100 text-green-800" :
                      t.status === "in_progress" ? "bg-blue-100 text-blue-800" :
                      t.status === "canceled" ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    }
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Платежи</CardTitle>
        </CardHeader>
        <CardContent>
          {deal.payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Платежей пока нет</p>
          ) : (
            <div className="space-y-3">
              {deal.payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between border-b pb-2 last:border-0 text-sm">
                  <div>
                    <span className="font-medium">{PAYMENT_KIND_LABELS[p.kind]}</span>
                    <p className="text-muted-foreground">{formatDate(p.date)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      label={PAYMENT_STATUS_LABELS[p.status]}
                      colorClass={PAYMENT_STATUS_COLORS[p.status]}
                    />
                    <span className="font-medium">{formatCurrency(p.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Документы</CardTitle>
        </CardHeader>
        <CardContent>
          {deal.documents.length === 0 ? (
            <p className="text-sm text-muted-foreground">Документов пока нет</p>
          ) : (
            <div className="space-y-2">
              {deal.documents.map((d) => (
                <div key={d.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                  <span>{d.type}</span>
                  <span className="text-muted-foreground">{formatDate(d.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comment */}
      {deal.comment && (
        <Card>
          <CardHeader>
            <CardTitle>Комментарий</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{deal.comment}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
