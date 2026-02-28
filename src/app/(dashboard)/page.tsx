import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { Armchair, Users, FileText, AlertTriangle } from "lucide-react";

async function getStats() {
  const [totalAssets, availableAssets, rentedAssets, totalClients] =
    await Promise.all([
      prisma.asset.count({ where: { isActive: true } }),
      prisma.asset.count({ where: { status: "available", isActive: true } }),
      prisma.asset.count({ where: { status: "rented", isActive: true } }),
      prisma.client.count(),
    ]);

  return { totalAssets, availableAssets, rentedAssets, totalClients };
}

export default async function DashboardPage() {
  const stats = await getStats();

  const cards = [
    {
      title: "Всего станций",
      value: stats.totalAssets,
      icon: Armchair,
      description: "Активных в системе",
    },
    {
      title: "Доступно",
      value: stats.availableAssets,
      icon: Armchair,
      description: "Готовы к аренде",
    },
    {
      title: "В аренде",
      value: stats.rentedAssets,
      icon: FileText,
      description: "Сейчас у клиентов",
    },
    {
      title: "Клиенты",
      value: stats.totalClients,
      icon: Users,
      description: "Зарегистрировано",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Дашборд</h1>
        <p className="text-muted-foreground">
          Обзор состояния бизнеса аренды рабочих станций
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Требует внимания
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Здесь будут отображаться предстоящие возвраты, простаивающие активы и
            другие уведомления. Реализация в фазе 5.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
