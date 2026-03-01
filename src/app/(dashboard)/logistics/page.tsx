import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { DeliveryKanban } from "@/components/logistics/delivery-kanban";
import { DeliveryTable } from "@/components/logistics/delivery-table";
import { DeliveryAnalytics } from "@/components/logistics/delivery-analytics";
import { getDeliveryTasks } from "@/services/logistics";
import {
  getDeliveryAnalytics as getAnalyticsData,
  getDeliveryCostsTrend,
  getOrCreateDefaultRate,
} from "@/services/logistics";

export default async function LogisticsPage() {
  const [tasks, analytics, trend, rate] = await Promise.all([
    getDeliveryTasks(),
    getAnalyticsData(),
    getDeliveryCostsTrend(6),
    getOrCreateDefaultRate(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Логистика"
        description="Управление доставками, трекинг расходов и аналитика"
      />

      <Tabs defaultValue="kanban" className="space-y-4">
        <TabsList>
          <TabsTrigger value="kanban">Канбан</TabsTrigger>
          <TabsTrigger value="table">Таблица</TabsTrigger>
          <TabsTrigger value="analytics">Аналитика</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban">
          <DeliveryKanban tasks={tasks} />
        </TabsContent>

        <TabsContent value="table">
          <DeliveryTable tasks={tasks} />
        </TabsContent>

        <TabsContent value="analytics">
          <DeliveryAnalytics
            analytics={analytics}
            trend={trend}
            rate={rate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
