import { getAssetReport, getClientReport, getUtilizationReport } from "@/services/reports";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ASSET_STATUS_LABELS, ASSET_STATUS_COLORS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

export default async function ReportsPage() {
  const [assetReport, clientReport, utilizationReport] = await Promise.all([
    getAssetReport(),
    getClientReport(),
    getUtilizationReport(),
  ]);

  const totalDowntimeLoss = assetReport.reduce((s, a) => s + a.downtimeLoss, 0);
  const totalRevenue = assetReport.reduce((s, a) => s + a.totalRevenue, 0);
  const totalProfit = assetReport.reduce((s, a) => s + a.profit, 0);
  const avgUtilization =
    utilizationReport.length > 0
      ? Math.round(
          utilizationReport.reduce((s, r) => s + r.utilization, 0) /
            utilizationReport.length
        )
      : 0;

  return (
    <div className="space-y-4">
      <PageHeader title="Отчёты" description="Аналитика по активам, клиентам и утилизации" />

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Общий доход
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalRevenue)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Общая прибыль
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(totalProfit)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Потери от простоя
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalDowntimeLoss)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ср. утилизация
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{avgUtilization}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="assets">
        <TabsList>
          <TabsTrigger value="assets">По станциям</TabsTrigger>
          <TabsTrigger value="clients">По клиентам</TabsTrigger>
          <TabsTrigger value="utilization">Утилизация</TabsTrigger>
        </TabsList>

        <TabsContent value="assets">
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Код</TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Доход</TableHead>
                  <TableHead className="text-right">Расходы</TableHead>
                  <TableHead className="text-right">Прибыль</TableHead>
                  <TableHead className="text-right">Дни аренды</TableHead>
                  <TableHead className="text-right">Простой (дни)</TableHead>
                  <TableHead className="text-right">Потери</TableHead>
                  <TableHead className="text-right">Окупаемость</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assetReport.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <Link href={`/assets/${a.id}`} className="font-mono text-sm hover:underline">
                        {a.code}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">{a.name}</TableCell>
                    <TableCell>
                      <StatusBadge
                        label={ASSET_STATUS_LABELS[a.status]}
                        colorClass={ASSET_STATUS_COLORS[a.status]}
                      />
                    </TableCell>
                    <TableCell className="text-right text-sm text-green-600">
                      {formatCurrency(a.totalRevenue)}
                    </TableCell>
                    <TableCell className="text-right text-sm text-red-600">
                      {formatCurrency(a.totalExpenses)}
                    </TableCell>
                    <TableCell className={`text-right text-sm font-medium ${a.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatCurrency(a.profit)}
                    </TableCell>
                    <TableCell className="text-right text-sm">{a.totalRentedDays}</TableCell>
                    <TableCell className="text-right text-sm">
                      {a.totalDowntimeDays > 0 ? (
                        <span className="text-orange-600">{a.totalDowntimeDays}</span>
                      ) : (
                        "0"
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm text-red-600">
                      {a.downtimeLoss > 0 ? formatCurrency(a.downtimeLoss) : "—"}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      <span className={a.paybackPercent >= 100 ? "text-green-600 font-medium" : ""}>
                        {a.paybackPercent}%
                      </span>
                      {a.paybackDaysLeft > 0 && (
                        <span className="text-xs text-muted-foreground ml-1">
                          ({a.paybackDaysLeft}д.)
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="clients">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Клиент</TableHead>
                  <TableHead>Телефон</TableHead>
                  <TableHead className="text-right">Сделок</TableHead>
                  <TableHead className="text-right">Активных</TableHead>
                  <TableHead className="text-right">Аренд</TableHead>
                  <TableHead className="text-right">Оплачено</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientReport.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Link href={`/clients/${c.id}`} className="font-medium hover:underline">
                        {c.fullName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono">
                      {c.phone || "—"}
                    </TableCell>
                    <TableCell className="text-right text-sm">{c.totalDeals}</TableCell>
                    <TableCell className="text-right text-sm">
                      {c.activeDeals > 0 ? (
                        <span className="text-green-600 font-medium">{c.activeDeals}</span>
                      ) : (
                        "0"
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm">{c.totalRentals}</TableCell>
                    <TableCell className="text-right text-sm font-medium">
                      {formatCurrency(c.totalPaid)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="utilization">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {utilizationReport.map((r) => (
                  <div key={r.month} className="flex items-center gap-4">
                    <span className="w-24 text-sm font-medium">{r.month}</span>
                    <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all flex items-center pl-2"
                        style={{ width: `${Math.max(r.utilization, 5)}%` }}
                      >
                        <span className="text-xs font-medium text-white">
                          {r.utilization}%
                        </span>
                      </div>
                    </div>
                    <span className="w-28 text-right text-sm text-green-600 font-medium">
                      {formatCurrency(r.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
