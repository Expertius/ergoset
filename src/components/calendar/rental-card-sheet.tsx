"use client";

import Link from "next/link";
import {
  User,
  Package,
  CalendarDays,
  Banknote,
  MapPin,
  Truck,
  ExternalLink,
  Phone,
  Mail,
  Clock,
  MessageSquare,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { StatusBadge } from "@/components/shared/status-badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, formatPhone } from "@/lib/utils";
import {
  DEAL_STATUS_LABELS,
  DEAL_STATUS_COLORS,
  DEAL_TYPE_LABELS,
  DEAL_TYPE_COLORS,
  DELIVERY_TASK_TYPE_LABELS,
  DELIVERY_TASK_STATUS_LABELS,
} from "@/lib/constants";
import type { CalendarEvent } from "@/services/dashboard";
import type {
  DealStatus,
  DealType,
  DeliveryTaskType,
  DeliveryTaskStatus,
} from "@/generated/prisma/browser";

const TASK_STATUS_COLORS: Record<string, string> = {
  planned: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  canceled: "bg-red-100 text-red-800",
};

type Props = {
  event: CalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function RentalCardSheet({ event, open, onOpenChange }: Props) {
  if (!event) return null;

  const hasFinancials =
    event.rentAmount > 0 ||
    event.deliveryAmount > 0 ||
    event.assemblyAmount > 0 ||
    event.depositAmount > 0;

  const hasAddress = event.addressDelivery || event.addressPickup;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-md w-full">
        <SheetHeader className="pb-0">
          <SheetTitle>Карточка аренды</SheetTitle>
          <SheetDescription className="sr-only">
            Информация об аренде
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-6 space-y-5">
          {/* Status badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge
              label={DEAL_TYPE_LABELS[event.dealType as DealType]}
              colorClass={DEAL_TYPE_COLORS[event.dealType as DealType]}
            />
            <StatusBadge
              label={DEAL_STATUS_LABELS[event.dealStatus as DealStatus]}
              colorClass={DEAL_STATUS_COLORS[event.dealStatus as DealStatus]}
            />
          </div>

          <Separator />

          {/* Client */}
          <section className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              Клиент
            </h3>
            <div className="pl-6 space-y-1.5">
              <p className="font-medium">{event.clientName}</p>
              {event.clientPhone && (
                <a
                  href={`tel:${event.clientPhone}`}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {formatPhone(event.clientPhone)}
                </a>
              )}
              {event.clientEmail && (
                <a
                  href={`mailto:${event.clientEmail}`}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {event.clientEmail}
                </a>
              )}
            </div>
          </section>

          <Separator />

          {/* Asset */}
          <section className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
              <Package className="h-4 w-4" />
              Станция
            </h3>
            <div className="pl-6 space-y-1">
              <p className="font-mono font-semibold text-base">
                {event.assetCode}
              </p>
              <p className="text-sm text-muted-foreground">{event.assetName}</p>
            </div>
          </section>

          <Separator />

          {/* Period */}
          <section className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              Период
            </h3>
            <div className="pl-6 space-y-1">
              <p className="text-sm font-medium">
                {formatDate(event.startDate)} — {formatDate(event.endDate)}
              </p>
              {event.plannedMonths && (
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {event.plannedMonths}{" "}
                  {event.plannedMonths === 1
                    ? "месяц"
                    : event.plannedMonths < 5
                      ? "месяца"
                      : "месяцев"}
                </p>
              )}
            </div>
          </section>

          {/* Financials */}
          {hasFinancials && (
            <>
              <Separator />
              <section className="space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                  <Banknote className="h-4 w-4" />
                  Стоимость
                </h3>
                <div className="pl-6 space-y-1.5 text-sm">
                  {event.rentAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Аренда</span>
                      <span>{formatCurrency(event.rentAmount)}</span>
                    </div>
                  )}
                  {event.deliveryAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Доставка</span>
                      <span>{formatCurrency(event.deliveryAmount)}</span>
                    </div>
                  )}
                  {event.assemblyAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Сборка</span>
                      <span>{formatCurrency(event.assemblyAmount)}</span>
                    </div>
                  )}
                  {event.depositAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Залог</span>
                      <span>{formatCurrency(event.depositAmount)}</span>
                    </div>
                  )}
                  {event.discountAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Скидка</span>
                      <span className="text-red-600">
                        −{formatCurrency(event.discountAmount)}
                      </span>
                    </div>
                  )}
                  <Separator className="my-1" />
                  <div className="flex justify-between font-semibold">
                    <span>Итого</span>
                    <span>{formatCurrency(event.totalPlannedAmount)}</span>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* Address */}
          {hasAddress && (
            <>
              <Separator />
              <section className="space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  Адрес
                </h3>
                <div className="pl-6 space-y-2 text-sm">
                  {event.addressDelivery && (
                    <div>
                      <span className="text-muted-foreground text-xs uppercase tracking-wide">
                        Доставка
                      </span>
                      <p className="font-medium">{event.addressDelivery}</p>
                    </div>
                  )}
                  {event.addressPickup &&
                    event.addressPickup !== event.addressDelivery && (
                      <div>
                        <span className="text-muted-foreground text-xs uppercase tracking-wide">
                          Забор
                        </span>
                        <p className="font-medium">{event.addressPickup}</p>
                      </div>
                    )}
                  {event.deliveryInstructions && (
                    <div className="bg-muted/50 rounded-md p-2.5 text-xs">
                      <span className="font-medium">Как попасть: </span>
                      {event.deliveryInstructions}
                    </div>
                  )}
                </div>
              </section>
            </>
          )}

          {/* Delivery Tasks */}
          {event.deliveryTasks.length > 0 && (
            <>
              <Separator />
              <section className="space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                  <Truck className="h-4 w-4" />
                  Логистика
                </h3>
                <div className="pl-6 space-y-2">
                  {event.deliveryTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <div className="min-w-0">
                        <span className="font-medium">
                          {DELIVERY_TASK_TYPE_LABELS[task.type as DeliveryTaskType]}
                        </span>
                        {task.plannedAt && (
                          <span className="text-muted-foreground ml-2">
                            {formatDate(task.plannedAt)}
                          </span>
                        )}
                        {task.assignee && (
                          <p className="text-xs text-muted-foreground truncate">
                            {task.assignee}
                          </p>
                        )}
                      </div>
                      <StatusBadge
                        label={DELIVERY_TASK_STATUS_LABELS[task.status as DeliveryTaskStatus]}
                        colorClass={TASK_STATUS_COLORS[task.status]}
                      />
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* Comment */}
          {event.comment && (
            <>
              <Separator />
              <section className="space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  Комментарий
                </h3>
                <p className="pl-6 text-sm text-muted-foreground whitespace-pre-wrap">
                  {event.comment}
                </p>
              </section>
            </>
          )}

          <Separator />

          {/* Link to full deal */}
          <Button className="w-full" asChild>
            <Link href={`/deals/${event.dealId}`}>
              Открыть сделку
              <ExternalLink className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
