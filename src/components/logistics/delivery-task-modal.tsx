"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  DELIVERY_TASK_TYPE_LABELS,
  DELIVERY_TASK_STATUS_LABELS,
  DELIVERY_TASK_STATUS_COLORS,
} from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  updateDeliveryTaskAction,
  completeDeliveryTaskAction,
  calculateRouteAction,
  estimateDeliveryCostsAction,
  addDeliveryCommentAction,
} from "@/actions/logistics";
import {
  MapPin,
  Navigation,
  Clock,
  Wallet,
  MessageSquare,
  AlertCircle,
  Loader2,
  ArrowRight,
  Building2,
} from "lucide-react";
import { useState, useTransition } from "react";
import type { DeliveryTaskItem } from "./types";

export function DeliveryTaskModal({
  task,
  open,
  onClose,
}: {
  task: DeliveryTaskItem;
  open: boolean;
  onClose: () => void;
}) {
  const isCompleted = task.status === "completed";
  const isInProgress = task.status === "in_progress";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <div className="flex items-center gap-3">
            <DialogTitle className="text-lg">
              {DELIVERY_TASK_TYPE_LABELS[task.type as keyof typeof DELIVERY_TASK_TYPE_LABELS]} — {task.rental.deal.client.fullName}
            </DialogTitle>
            <StatusBadge
              label={DELIVERY_TASK_STATUS_LABELS[task.status as keyof typeof DELIVERY_TASK_STATUS_LABELS]}
              colorClass={DELIVERY_TASK_STATUS_COLORS[task.status as keyof typeof DELIVERY_TASK_STATUS_COLORS]}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {task.rental.asset.code} — {task.rental.asset.name}
            {task.plannedAt && ` • ${formatDate(task.plannedAt)}`}
            {task.assignee && ` • ${task.assignee}`}
          </p>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-100px)]">
          <div className="px-6 pb-6">
            <Tabs defaultValue={isInProgress ? "complete" : "route"} className="space-y-4">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="route">Маршрут</TabsTrigger>
                <TabsTrigger value="complete">
                  {isCompleted ? "Итоги" : "Хронометраж"}
                </TabsTrigger>
                <TabsTrigger value="comments">Комментарии</TabsTrigger>
                <TabsTrigger value="client">Клиент</TabsTrigger>
              </TabsList>

              <TabsContent value="route">
                <RouteTab task={task} disabled={isCompleted} />
              </TabsContent>

              <TabsContent value="complete">
                {isCompleted ? (
                  <CompletedSummary task={task} />
                ) : (
                  <CompleteForm task={task} onDone={onClose} />
                )}
              </TabsContent>

              <TabsContent value="comments">
                <CommentsTab task={task} />
              </TabsContent>

              <TabsContent value="client">
                <ClientInfoTab task={task} />
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function RouteTab({ task, disabled }: { task: DeliveryTaskItem; disabled: boolean }) {
  const [pointFrom, setPointFrom] = useState(task.pointFrom ?? "");
  const [pointTo, setPointTo] = useState(task.pointTo ?? "");
  const [distanceKm, setDistanceKm] = useState(task.distanceKm ?? 0);
  const [driveDurationMin, setDriveDurationMin] = useState(task.driveDurationMin ?? 0);
  const [floor, setFloor] = useState(task.floor ?? 1);
  const [hasElevator, setHasElevator] = useState(task.hasElevator ?? false);
  const [calcError, setCalcError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isSaving, startSaving] = useTransition();
  const [costEstimate, setCostEstimate] = useState<{
    fuelCost: number;
    salaryTotal: number;
    totalEstimate: number;
  } | null>(null);

  function handleCalculate() {
    setCalcError(null);
    startTransition(async () => {
      const result = await calculateRouteAction(pointFrom, pointTo);
      if (result.success && result.data) {
        setDistanceKm(result.data.distanceKm);
        setDriveDurationMin(result.data.durationMin);
        const estimate = await estimateDeliveryCostsAction({
          distanceKm: result.data.distanceKm,
          floor,
          hasElevator,
          includeAssembly: task.type === "delivery",
          includeDisassembly: task.type === "pickup",
        });
        if (estimate.success && estimate.data) {
          setCostEstimate(estimate.data);
        }
      } else {
        setCalcError(result.error ?? "Ошибка расчёта");
      }
    });
  }

  function handleSave() {
    startSaving(async () => {
      const fd = new FormData();
      fd.set("id", task.id);
      fd.set("pointFrom", pointFrom);
      fd.set("pointTo", pointTo);
      fd.set("distanceKm", String(distanceKm));
      fd.set("driveDurationMin", String(driveDurationMin));
      fd.set("floor", String(floor));
      fd.set("hasElevator", String(hasElevator));
      await updateDeliveryTaskAction(fd);
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Откуда (точка А)</Label>
          <Input
            value={pointFrom}
            onChange={(e) => setPointFrom(e.target.value)}
            placeholder="Адрес склада или клиента"
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label>Куда (точка Б)</Label>
          <Input
            value={pointTo}
            onChange={(e) => setPointTo(e.target.value)}
            placeholder="Адрес доставки"
            disabled={disabled}
          />
        </div>
      </div>

      {!disabled && (
        <Button
          onClick={handleCalculate}
          disabled={isPending || !pointFrom || !pointTo}
          variant="outline"
          className="w-full"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4 mr-2" />
          )}
          Рассчитать маршрут
        </Button>
      )}

      {calcError && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {calcError}
        </div>
      )}

      <Separator />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>Расстояние (км)</Label>
          <Input
            type="number"
            step="0.1"
            value={distanceKm}
            onChange={(e) => setDistanceKm(parseFloat(e.target.value) || 0)}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label>Время в пути (мин)</Label>
          <Input
            type="number"
            value={driveDurationMin}
            onChange={(e) => setDriveDurationMin(parseInt(e.target.value) || 0)}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label>Этаж</Label>
          <Input
            type="number"
            value={floor}
            onChange={(e) => setFloor(parseInt(e.target.value) || 1)}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label>Лифт</Label>
          <div className="flex items-center gap-2 h-9">
            <Switch
              checked={hasElevator}
              onCheckedChange={setHasElevator}
              disabled={disabled}
            />
            <span className="text-sm text-muted-foreground">
              {hasElevator ? "Есть" : "Нет"}
            </span>
          </div>
        </div>
      </div>

      {costEstimate && (
        <Card className="bg-muted/50">
          <CardContent className="pt-4 pb-3">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Топливо</p>
                <p className="text-sm font-semibold">{formatCurrency(costEstimate.fuelCost)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">ЗП логисту</p>
                <p className="text-sm font-semibold">{formatCurrency(costEstimate.salaryTotal)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Итого оценка</p>
                <p className="text-sm font-bold text-primary">{formatCurrency(costEstimate.totalEstimate)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!disabled && (
        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          Сохранить маршрут
        </Button>
      )}
    </div>
  );
}

function CompleteForm({ task, onDone }: { task: DeliveryTaskItem; onDone: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await completeDeliveryTaskAction(formData);
      if (result.success) {
        onDone();
      } else {
        setError(result.error ?? "Ошибка");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="id" value={task.id} />

      <h4 className="text-sm font-semibold flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Хронометраж (минуты)
      </h4>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Погрузка</Label>
          <Input
            name="timeLoading"
            type="number"
            min={0}
            defaultValue={task.timeLoading ?? 0}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">В дороге</Label>
          <Input
            name="timeDriving"
            type="number"
            min={0}
            defaultValue={task.timeDriving ?? task.driveDurationMin ?? 0}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Подъём на этаж</Label>
          <Input name="timeCarrying" type="number" min={0} defaultValue={task.timeCarrying ?? 0} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Сборка</Label>
          <Input name="timeAssembly" type="number" min={0} defaultValue={task.timeAssembly ?? 0} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Разборка</Label>
          <Input name="timeDisassembly" type="number" min={0} defaultValue={task.timeDisassembly ?? 0} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Разгрузка на складе</Label>
          <Input name="timeUnloading" type="number" min={0} defaultValue={task.timeUnloading ?? 0} />
        </div>
      </div>

      <Separator />

      <h4 className="text-sm font-semibold flex items-center gap-2">
        <Wallet className="h-4 w-4" />
        Расходы (в рублях, вводите в копейках)
      </h4>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Топливо</Label>
          <Input name="fuelCost" type="number" min={0} defaultValue={task.fuelCost ?? 0} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Платные дороги</Label>
          <Input name="tollCost" type="number" min={0} defaultValue={task.tollCost ?? 0} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Прочее</Label>
          <Input name="otherCost" type="number" min={0} defaultValue={task.otherCost ?? 0} />
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>Комментарий по доставке</Label>
        <Textarea
          name="logistComment"
          defaultValue={task.logistComment ?? ""}
          placeholder="Как прошла доставка, нюансы..."
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label>Заметки по клиенту (для следующих доставок)</Label>
        <Textarea
          name="clientNote"
          defaultValue={task.clientNote ?? task.rental.deal.client.deliveryNotes ?? ""}
          placeholder="Лифт не работает, парковка во дворе, звонить за 30 мин..."
          rows={2}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
        Завершить задачу
      </Button>
    </form>
  );
}

function CompletedSummary({ task }: { task: DeliveryTaskItem }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Маршрут
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{task.pointFrom || "—"}</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span>{task.pointTo || "—"}</span>
          </div>
          <div className="flex gap-4 text-sm">
            <span>{task.distanceKm ?? 0} км</span>
            <span>{task.driveDurationMin ?? 0} мин (план)</span>
            {task.floor && (
              <span>Этаж {task.floor} {task.hasElevator ? "(лифт)" : "(без лифта)"}</span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Хронометраж
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 text-sm">
            {[
              ["Погрузка", task.timeLoading],
              ["Дорога", task.timeDriving],
              ["Подъём", task.timeCarrying],
              ["Сборка", task.timeAssembly],
              ["Разборка", task.timeDisassembly],
              ["Разгрузка", task.timeUnloading],
            ].map(([label, val]) => (
              <div key={label as string}>
                <span className="text-muted-foreground text-xs">{label as string}</span>
                <p className="font-medium">{(val as number | null) ?? 0} мин</p>
              </div>
            ))}
          </div>
          <Separator className="my-2" />
          <div className="text-sm font-semibold">
            Итого: {task.totalTimeMin ?? 0} мин
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Расходы и ЗП
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground text-xs">Топливо</span>
              <p className="font-medium">{formatCurrency(task.fuelCost ?? 0)}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Платные дороги</span>
              <p className="font-medium">{formatCurrency(task.tollCost ?? 0)}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Прочее</span>
              <p className="font-medium">{formatCurrency(task.otherCost ?? 0)}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Итого расход</span>
              <p className="font-bold">{formatCurrency(task.totalCost ?? 0)}</p>
            </div>
          </div>
          <Separator className="my-2" />
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground text-xs">ЗП фикс</span>
              <p className="font-medium">{formatCurrency(task.salaryBase ?? 0)}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">ЗП за км</span>
              <p className="font-medium">{formatCurrency(task.salaryPerKm ?? 0)}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">ЗП итого</span>
              <p className="font-bold">{formatCurrency(task.salaryTotal ?? 0)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {task.logistComment && (
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground mb-1">Комментарий логиста</p>
            <p className="text-sm">{task.logistComment}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CommentsTab({ task }: { task: DeliveryTaskItem }) {
  const [isPending, startTransition] = useTransition();
  const [newComment, setNewComment] = useState("");

  function handleAdd() {
    if (!newComment.trim()) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("deliveryTaskId", task.id);
      fd.set("text", newComment);
      await addDeliveryCommentAction(fd);
      setNewComment("");
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Добавить комментарий..."
          rows={2}
          className="flex-1"
        />
        <Button
          onClick={handleAdd}
          disabled={isPending || !newComment.trim()}
          className="self-end"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
        </Button>
      </div>

      <div className="space-y-3">
        {task.comments.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Нет комментариев
          </p>
        )}
        {task.comments.map((c) => (
          <div key={c.id} className="border rounded-lg p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">
                {c.author?.fullName ?? "Система"}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDate(c.createdAt)}
              </span>
            </div>
            <p className="text-sm">{c.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClientInfoTab({ task }: { task: DeliveryTaskItem }) {
  const client = task.rental.deal.client;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            {client.fullName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {client.deliveryNotes && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Заметки по доставке
              </p>
              <div className="bg-muted/50 rounded-lg p-3 text-sm">
                {client.deliveryNotes}
              </div>
            </div>
          )}

          {!client.deliveryNotes && (
            <p className="text-sm text-muted-foreground">
              Нет заметок по доставке. Добавьте при завершении задачи.
            </p>
          )}

          {task.clientNote && task.clientNote !== client.deliveryNotes && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Заметка из текущей задачи
              </p>
              <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-3 text-sm">
                {task.clientNote}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Адреса из аренды</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {task.rental.addressDelivery && (
            <div>
              <span className="text-muted-foreground text-xs">Адрес доставки: </span>
              {task.rental.addressDelivery}
            </div>
          )}
          {task.rental.addressPickup && (
            <div>
              <span className="text-muted-foreground text-xs">Адрес забора: </span>
              {task.rental.addressPickup}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
