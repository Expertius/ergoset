import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { canSeeRetailPrices } from "@/lib/rbac";
import { getAssets } from "@/services/assets";
import { PageHeader } from "@/components/shared/page-header";
import { SortableHeader } from "@/components/shared/sortable-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ASSET_STATUS_LABELS, ASSET_STATUS_COLORS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import type { AssetStatus } from "@/generated/prisma/browser";
import { AssetFiltersBar } from "@/components/assets/filters-bar";

type Props = {
  searchParams: Promise<{
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
};

export default async function AssetsPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const isAdmin = session.role === "ADMIN";
  const showRetailPrices = canSeeRetailPrices(session.role);

  const params = await searchParams;
  const assets = await getAssets({
    search: params.search,
    status: params.status as AssetStatus | undefined,
    sortBy: params.sortBy,
    sortOrder: (params.sortOrder as "asc" | "desc") || undefined,
  });

  const colCount = 4 + (showRetailPrices ? 1 : 0) + (isAdmin ? 1 : 0);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Станции"
        description={`Всего: ${assets.length}`}
        createHref={isAdmin ? "/assets/new" : undefined}
        createLabel={isAdmin ? "Добавить станцию" : undefined}
      />

      <AssetFiltersBar />

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader column="code" label="Код" basePath="/assets" className="w-32" />
              <SortableHeader column="name" label="Название" basePath="/assets" />
              <TableHead>Цвет</TableHead>
              <SortableHeader column="status" label="Статус" basePath="/assets" />
              {showRetailPrices && (
                <SortableHeader column="retailPrice" label="Розница" basePath="/assets" className="text-right" />
              )}
              {isAdmin && (
                <SortableHeader column="purchasePrice" label="Закупка" basePath="/assets" className="text-right" />
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.length === 0 && (
              <TableRow>
                <TableCell colSpan={colCount} className="text-center text-muted-foreground py-8">
                  Станции не найдены
                </TableCell>
              </TableRow>
            )}
            {assets.map((asset) => (
              <TableRow key={asset.id}>
                <TableCell>
                  <Link
                    href={`/assets/${asset.id}`}
                    className="font-mono text-sm font-medium hover:underline"
                  >
                    {asset.code}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/assets/${asset.id}`}
                    className="font-medium hover:underline"
                  >
                    {asset.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {asset.color || "—"}
                </TableCell>
                <TableCell>
                  <StatusBadge
                    label={ASSET_STATUS_LABELS[asset.status]}
                    colorClass={ASSET_STATUS_COLORS[asset.status]}
                  />
                </TableCell>
                {showRetailPrices && (
                  <TableCell className="text-right">
                    {asset.retailPrice ? formatCurrency(asset.retailPrice) : "—"}
                  </TableCell>
                )}
                {isAdmin && (
                  <TableCell className="text-right">
                    {asset.purchasePrice ? formatCurrency(asset.purchasePrice) : "—"}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
