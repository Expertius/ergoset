import { getInventoryOverview, getMovements } from "@/services/inventory";
import { PageHeader } from "@/components/shared/page-header";
import { ACCESSORY_CATEGORY_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InventoryAdjustButton } from "@/components/inventory/adjust-button";

const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  incoming: "Поступление",
  reserve: "Резерв",
  issue: "Выдача",
  return_item: "Возврат",
  writeoff: "Списание",
  repair: "Ремонт",
  lost: "Потеря",
};

export default async function InventoryPage() {
  const [items, movements] = await Promise.all([
    getInventoryOverview(),
    getMovements(),
  ]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Склад"
        description="Остатки и движения аксессуаров"
        action={<InventoryAdjustButton accessories={items.map((i) => i.accessory)} />}
      />

      <Tabs defaultValue="stock">
        <TabsList>
          <TabsTrigger value="stock">Остатки</TabsTrigger>
          <TabsTrigger value="movements">Движения</TabsTrigger>
        </TabsList>

        <TabsContent value="stock">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Аксессуар</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead>Локация</TableHead>
                  <TableHead className="text-center">На складе</TableHead>
                  <TableHead className="text-center">Зарезерв.</TableHead>
                  <TableHead className="text-center">Доступно</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Данных нет
                    </TableCell>
                  </TableRow>
                )}
                {items.map((item) => {
                  const available = item.qtyOnHand - item.qtyReserved;
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.accessory.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {ACCESSORY_CATEGORY_LABELS[item.accessory.category]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.location}
                      </TableCell>
                      <TableCell className="text-center font-medium">{item.qtyOnHand}</TableCell>
                      <TableCell className="text-center">{item.qtyReserved}</TableCell>
                      <TableCell className="text-center">
                        <span className={available <= 0 ? "text-destructive font-bold" : "font-bold text-green-600"}>
                          {available}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="movements">
          <Card>
            <CardHeader>
              <CardTitle>Последние движения</CardTitle>
            </CardHeader>
            <CardContent>
              {movements.length === 0 ? (
                <p className="text-sm text-muted-foreground">Движений нет</p>
              ) : (
                <div className="space-y-2">
                  {movements.map((m) => (
                    <div key={m.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {MOVEMENT_TYPE_LABELS[m.type] || m.type}
                        </Badge>
                        <span className="font-medium">{m.accessory.name}</span>
                        {m.comment && (
                          <span className="text-muted-foreground">— {m.comment}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold">{m.qty} шт.</span>
                        <span className="text-muted-foreground text-xs">{formatDate(m.date)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
