import { getPayments, getExpenses, getFinanceSummary } from "@/services/payments";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  PAYMENT_KIND_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  PAYMENT_METHOD_LABELS,
  EXPENSE_CATEGORY_LABELS,
} from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
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
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

export default async function PaymentsPage() {
  const [payments, expenses, summary] = await Promise.all([
    getPayments(),
    getExpenses(),
    getFinanceSummary(),
  ]);

  const summaryCards = [
    { title: "Доход", value: summary.totalIncome, icon: TrendingUp, color: "text-green-600" },
    { title: "Расходы", value: summary.totalExpenses, icon: TrendingDown, color: "text-red-600" },
    { title: "Прибыль", value: summary.profit, icon: Wallet, color: summary.profit >= 0 ? "text-green-600" : "text-red-600" },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Финансы"
        description="Платежи, расходы, доходность"
        createHref="/payments/new"
        createLabel="Новый платёж"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {summaryCards.map((c) => (
          <Card key={c.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {c.title}
              </CardTitle>
              <c.icon className={`h-4 w-4 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${c.color}`}>
                {formatCurrency(c.value)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="payments">
        <TabsList>
          <TabsTrigger value="payments">Платежи ({payments.length})</TabsTrigger>
          <TabsTrigger value="expenses">Расходы ({expenses.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="payments">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Клиент</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>Способ</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead className="text-right">Сумма</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Платежей нет
                    </TableCell>
                  </TableRow>
                )}
                {payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Link href={`/deals/${p.dealId}`} className="font-medium hover:underline">
                        {p.deal.client.fullName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">{PAYMENT_KIND_LABELS[p.kind]}</TableCell>
                    <TableCell className="text-sm">{PAYMENT_METHOD_LABELS[p.method]}</TableCell>
                    <TableCell>
                      <StatusBadge
                        label={PAYMENT_STATUS_LABELS[p.status]}
                        colorClass={PAYMENT_STATUS_COLORS[p.status]}
                      />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(p.date)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(p.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="expenses">
          <div className="flex justify-end mb-3">
            <Link
              href="/payments/expense/new"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              + Расход
            </Link>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Категория</TableHead>
                  <TableHead>Станция</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Комментарий</TableHead>
                  <TableHead className="text-right">Сумма</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Расходов нет
                    </TableCell>
                  </TableRow>
                )}
                {expenses.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="text-sm">{EXPENSE_CATEGORY_LABELS[e.category]}</TableCell>
                    <TableCell className="text-sm font-mono">
                      {e.asset ? e.asset.code : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(e.date)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {e.comment || "—"}
                    </TableCell>
                    <TableCell className="text-right font-medium text-red-600">
                      {formatCurrency(e.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
