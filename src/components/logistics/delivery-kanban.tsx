"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  DELIVERY_TASK_TYPE_LABELS,
  DELIVERY_TASK_TYPE_COLORS,
  DELIVERY_TASK_STATUS_LABELS,
  DELIVERY_TASK_STATUS_COLORS,
} from "@/lib/constants";
import { formatDate, formatCurrency } from "@/lib/utils";
import { updateDeliveryTaskStatusAction } from "@/actions/logistics";
import {
  Play,
  CheckCircle2,
  XCircle,
  MapPin,
  Clock,
  Truck,
  User,
} from "lucide-react";
import { useState, useTransition } from "react";
import { DeliveryTaskModal } from "./delivery-task-modal";
import type { DeliveryTaskStatus } from "@/generated/prisma/browser";
import type { DeliveryTaskItem } from "./types";

const COLUMNS: { status: DeliveryTaskStatus; label: string; color: string }[] = [
  { status: "planned", label: "Запланировано", color: "border-t-yellow-400" },
  { status: "in_progress", label: "В работе", color: "border-t-blue-400" },
  { status: "completed", label: "Завершено", color: "border-t-green-400" },
  { status: "canceled", label: "Отменено", color: "border-t-gray-400" },
];

export function DeliveryKanban({ tasks }: { tasks: DeliveryTaskItem[] }) {
  const [selectedTask, setSelectedTask] = useState<DeliveryTaskItem | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(taskId: string, newStatus: string) {
    startTransition(async () => {
      await updateDeliveryTaskStatusAction(taskId, newStatus);
    });
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.status);
          return (
            <div key={col.status} className="space-y-3">
              <div className={`border-t-4 ${col.color} rounded-t-lg`}>
                <div className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-b-lg">
                  <h3 className="text-sm font-semibold">{col.label}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {colTasks.length}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 min-h-[100px]">
                {colTasks.map((task) => (
                  <Card
                    key={task.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedTask(task)}
                  >
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <StatusBadge
                          label={DELIVERY_TASK_TYPE_LABELS[task.type as keyof typeof DELIVERY_TASK_TYPE_LABELS]}
                          colorClass={DELIVERY_TASK_TYPE_COLORS[task.type as keyof typeof DELIVERY_TASK_TYPE_COLORS]}
                        />
                        {task.distanceKm && (
                          <span className="text-xs text-muted-foreground">
                            {task.distanceKm} км
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-medium truncate">
                          {task.rental.deal.client.fullName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {task.rental.asset.code} — {task.rental.asset.name}
                        </p>
                      </div>

                      {(task.pointTo || task.address) && (
                        <div className="flex items-start gap-1">
                          <MapPin className="h-3 w-3 mt-0.5 text-muted-foreground shrink-0" />
                          <p className="text-xs text-muted-foreground truncate">
                            {task.pointTo || task.address}
                          </p>
                        </div>
                      )}

                      {task.plannedAt && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {formatDate(task.plannedAt)}
                          </span>
                        </div>
                      )}

                      {task.assignee && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {task.assignee}
                          </span>
                        </div>
                      )}

                      {task.status === "completed" && task.totalCost != null && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            Расход: {formatCurrency(task.totalCost)}
                          </span>
                          {task.salaryTotal != null && (
                            <span className="text-muted-foreground">
                              ЗП: {formatCurrency(task.salaryTotal)}
                            </span>
                          )}
                        </div>
                      )}

                      {task.status === "planned" && (
                        <div className="flex gap-1 pt-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs flex-1"
                            disabled={isPending}
                            onClick={() => handleStatusChange(task.id, "in_progress")}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Начать
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            disabled={isPending}
                            onClick={() => handleStatusChange(task.id, "canceled")}
                          >
                            <XCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      )}

                      {task.status === "in_progress" && (
                        <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="default"
                            className="h-7 text-xs w-full"
                            disabled={isPending}
                            onClick={() => setSelectedTask(task)}
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Завершить
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {colTasks.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-8 border border-dashed rounded-lg">
                    Нет задач
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedTask && (
        <DeliveryTaskModal
          task={selectedTask}
          open={!!selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </>
  );
}
