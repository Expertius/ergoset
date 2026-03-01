import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLogisticsDashboardData } from "@/services/dashboard-scoped";
import { Truck, Armchair, Package, Clock } from "lucide-react";
import Link from "next/link";

const DELIVERY_TYPE_LABELS: Record<string, string> = {
  delivery: "Доставка",
  pickup: "Вывоз",
  replacement: "Замена",
  maintenance_visit: "Обслуживание",
};

export async function LogisticsDashboard() {
  const data = await getLogisticsDashboardData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Дашборд логистики</h1>
        <p className="text-muted-foreground">Задачи доставки и состояние парка</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Задачи сегодня
            </CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.todayTasks}</div>
            <Link href="/logistics" className="text-xs text-primary hover:underline">
              Открыть логистику
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              На неделе
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.weekTasks}</div>
            <p className="text-xs text-muted-foreground">Всего задач</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Станции в аренде
            </CardTitle>
            <Armchair className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {data.rentedAssets}/{data.totalAssets}
            </div>
            <p className="text-xs text-muted-foreground">
              Доступно: {data.availableAssets} · На ТО: {data.maintenanceAssets}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Склад
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link href="/inventory" className="text-3xl font-bold hover:text-primary transition-colors">
              →
            </Link>
            <p className="text-xs text-muted-foreground">Открыть склад</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Задачи в процессе
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.inProgressTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">Нет задач в процессе</p>
          ) : (
            <div className="space-y-3">
              {data.inProgressTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between border-b pb-2 last:border-0"
                >
                  <div>
                    <Link
                      href="/logistics"
                      className="text-sm font-medium hover:underline"
                    >
                      {task.rental.deal.client.fullName}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {task.rental.asset.code} {task.rental.asset.name}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {DELIVERY_TYPE_LABELS[task.type] || task.type}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
