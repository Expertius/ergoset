import { getAccessories } from "@/services/accessories";
import { PageHeader } from "@/components/shared/page-header";
import { SortableHeader } from "@/components/shared/sortable-header";
import { ACCESSORY_CATEGORY_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { AccessoryCategory } from "@/generated/prisma/browser";
import { AccessoryFiltersBar } from "@/components/accessories/filters-bar";

type Props = {
  searchParams: Promise<{
    search?: string;
    category?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
};

export default async function AccessoriesPage({ searchParams }: Props) {
  const params = await searchParams;
  const accessories = await getAccessories({
    search: params.search,
    category: params.category as AccessoryCategory | undefined,
    sortBy: params.sortBy,
    sortOrder: (params.sortOrder as "asc" | "desc") || undefined,
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Аксессуары"
        description={`Всего: ${accessories.length}`}
        createHref="/accessories/new"
        createLabel="Добавить аксессуар"
      />

      <AccessoryFiltersBar />

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader column="sku" label="SKU" basePath="/accessories" className="w-32" />
              <SortableHeader column="name" label="Название" basePath="/accessories" />
              <SortableHeader column="category" label="Категория" basePath="/accessories" />
              <TableHead className="text-center">На складе</TableHead>
              <TableHead className="text-center">Зарезерв.</TableHead>
              <TableHead className="text-center">Доступно</TableHead>
              <SortableHeader column="retailPrice" label="Розница" basePath="/accessories" className="text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {accessories.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Аксессуары не найдены
                </TableCell>
              </TableRow>
            )}
            {accessories.map((acc) => {
              const inv = acc.inventoryItems[0];
              const onHand = inv?.qtyOnHand ?? 0;
              const reserved = inv?.qtyReserved ?? 0;
              const available = onHand - reserved;

              return (
                <TableRow key={acc.id}>
                  <TableCell className="font-mono text-sm">{acc.sku}</TableCell>
                  <TableCell>
                    <Link
                      href={`/accessories/${acc.id}`}
                      className="font-medium hover:underline"
                    >
                      {acc.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {ACCESSORY_CATEGORY_LABELS[acc.category]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{onHand}</TableCell>
                  <TableCell className="text-center">{reserved}</TableCell>
                  <TableCell className="text-center">
                    <span className={available <= 0 ? "text-destructive font-bold" : ""}>
                      {available}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {acc.retailPrice ? formatCurrency(acc.retailPrice) : "—"}
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
