"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  DELIVERY_TASK_TYPE_LABELS,
  DELIVERY_TASK_TYPE_COLORS,
  DELIVERY_TASK_STATUS_LABELS,
  DELIVERY_TASK_STATUS_COLORS,
} from "@/lib/constants";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { DeliveryTaskModal } from "./delivery-task-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DeliveryTaskItem } from "./types";

export function DeliveryTable({ tasks }: { tasks: DeliveryTaskItem[] }) {
  const [selectedTask, setSelectedTask] = useState<DeliveryTaskItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  const filtered = tasks.filter((t) => {
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (filterType !== "all" && t.type !== filterType) return false;
    return true;
  });

  return (
    <>
      <div className="flex gap-3 mb-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="planned">Запланировано</SelectItem>
            <SelectItem value="in_progress">В процессе</SelectItem>
            <SelectItem value="completed">Завершено</SelectItem>
            <SelectItem value="canceled">Отменено</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Тип" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все типы</SelectItem>
            <SelectItem value="delivery">Доставка</SelectItem>
            <SelectItem value="pickup">Забор</SelectItem>
            <SelectItem value="replacement">Замена</SelectItem>
            <SelectItem value="maintenance_visit">Обслуживание</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto text-sm text-muted-foreground self-center">
          {filtered.length} из {tasks.length}
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Дата</TableHead>
              <TableHead>Тип</TableHead>
              <TableHead>Клиент</TableHead>
              <TableHead>Станция</TableHead>
              <TableHead>Адрес</TableHead>
              <TableHead className="text-right">Км</TableHead>
              <TableHead className="text-right">Время (мин)</TableHead>
              <TableHead className="text-right">Расход</TableHead>
              <TableHead className="text-right">ЗП</TableHead>
              <TableHead>Статус</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                  Нет задач по выбранным фильтрам
                </TableCell>
              </TableRow>
            )}
            {filtered.map((task) => (
              <TableRow
                key={task.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => setSelectedTask(task)}
              >
                <TableCell className="text-sm">
                  {task.plannedAt ? formatDate(task.plannedAt) : "—"}
                </TableCell>
                <TableCell>
                  <StatusBadge
                    label={DELIVERY_TASK_TYPE_LABELS[task.type as keyof typeof DELIVERY_TASK_TYPE_LABELS]}
                    colorClass={DELIVERY_TASK_TYPE_COLORS[task.type as keyof typeof DELIVERY_TASK_TYPE_COLORS]}
                  />
                </TableCell>
                <TableCell className="text-sm font-medium">
                  {task.rental.deal.client.fullName}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {task.rental.asset.code}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                  {task.pointTo || task.address || "—"}
                </TableCell>
                <TableCell className="text-right text-sm">
                  {task.distanceKm ?? "—"}
                </TableCell>
                <TableCell className="text-right text-sm">
                  {task.totalTimeMin ?? "—"}
                </TableCell>
                <TableCell className="text-right text-sm">
                  {task.totalCost != null ? formatCurrency(task.totalCost) : "—"}
                </TableCell>
                <TableCell className="text-right text-sm">
                  {task.salaryTotal != null ? formatCurrency(task.salaryTotal) : "—"}
                </TableCell>
                <TableCell>
                  <StatusBadge
                    label={DELIVERY_TASK_STATUS_LABELS[task.status as keyof typeof DELIVERY_TASK_STATUS_LABELS]}
                    colorClass={DELIVERY_TASK_STATUS_COLORS[task.status as keyof typeof DELIVERY_TASK_STATUS_COLORS]}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
