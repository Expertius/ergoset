import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { buildDealScope } from "@/lib/rbac";
import { getDeals } from "@/services/deals";
import { PageHeader } from "@/components/shared/page-header";
import { SortableHeader } from "@/components/shared/sortable-header";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  DEAL_TYPE_LABELS,
  DEAL_STATUS_LABELS,
  DEAL_STATUS_COLORS,
  DEAL_TYPE_COLORS,
} from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import type { DealStatus, DealType } from "@/generated/prisma/browser";
import { DealsFiltersBar } from "@/components/deals/deals-filters-bar";

type Props = {
  searchParams: Promise<{
    search?: string;
    status?: string;
    type?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
};

export default async function DealsPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const scope = buildDealScope(session);
  const params = await searchParams;
  const deals = await getDeals({
    search: params.search,
    status: params.status as DealStatus | undefined,
    type: params.type as DealType | undefined,
    sortBy: params.sortBy,
    sortOrder: (params.sortOrder as "asc" | "desc") || undefined,
    ...scope,
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Сделки"
        description={`Всего: ${deals.length}`}
        createHref="/deals/new"
        createLabel="Новая сделка"
      />

      <DealsFiltersBar />

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Клиент</TableHead>
              <SortableHeader column="type" label="Тип" basePath="/deals" />
              <SortableHeader column="status" label="Статус" basePath="/deals" />
              <TableHead>Станция</TableHead>
              <TableHead>Период</TableHead>
              <TableHead className="text-right">Сумма</TableHead>
              <SortableHeader column="createdAt" label="Дата" basePath="/deals" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {deals.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Сделки не найдены
                </TableCell>
              </TableRow>
            )}
            {deals.map((deal) => {
              const rental = deal.rentals[0];
              return (
                <TableRow key={deal.id}>
                  <TableCell>
                    <Link
                      href={`/deals/${deal.id}`}
                      className="font-medium hover:underline"
                    >
                      {deal.client.fullName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      label={DEAL_TYPE_LABELS[deal.type]}
                      colorClass={DEAL_TYPE_COLORS[deal.type]}
                    />
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      label={DEAL_STATUS_LABELS[deal.status]}
                      colorClass={DEAL_STATUS_COLORS[deal.status]}
                    />
                  </TableCell>
                  <TableCell className="text-sm">
                    {rental ? (
                      <span className="font-mono">{rental.asset.code}</span>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {rental
                      ? `${formatDate(rental.startDate)} — ${formatDate(rental.endDate)}`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {rental ? formatCurrency(rental.totalPlannedAmount) : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(deal.createdAt)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
