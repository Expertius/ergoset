import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { canSeeRetailPrices } from "@/lib/rbac";
import { getAssetById } from "@/services/assets";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ASSET_STATUS_LABELS, ASSET_STATUS_COLORS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Pencil } from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AssetDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const asset = await getAssetById(id);
  if (!asset) return notFound();

  const isAdmin = session.role === "ADMIN";
  const showPrices = canSeeRetailPrices(session.role);

  const fields = [
    { label: "Код", value: asset.code },
    { label: "Бренд", value: asset.brand },
    { label: "Модель", value: asset.model },
    { label: "Обивка", value: asset.upholstery },
    { label: "Цвет", value: asset.color },
    { label: "Тип стола", value: asset.tableType },
    { label: "Локация", value: asset.location },
    { label: "Дата покупки", value: isAdmin && asset.purchaseDate ? formatDate(asset.purchaseDate) : null },
    { label: "Цена закупки", value: isAdmin && asset.purchasePrice ? formatCurrency(asset.purchasePrice) : null },
    { label: "Дилерская", value: isAdmin && asset.dealerPrice ? formatCurrency(asset.dealerPrice) : null },
    { label: "Розничная", value: showPrices && asset.retailPrice ? formatCurrency(asset.retailPrice) : null },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={asset.name}
        action={
          isAdmin ? (
            <Button asChild variant="outline">
              <Link href={`/assets/${asset.id}/edit`}>
                <Pencil className="h-4 w-4 mr-2" />
                Редактировать
              </Link>
            </Button>
          ) : null
        }
      />

      <div className="flex items-center gap-3">
        <StatusBadge
          label={ASSET_STATUS_LABELS[asset.status]}
          colorClass={ASSET_STATUS_COLORS[asset.status]}
        />
        <span className="text-sm text-muted-foreground font-mono">{asset.code}</span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Информация</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              {fields.map(
                (f) =>
                  f.value && (
                    <div key={f.label} className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">{f.label}</dt>
                      <dd className="text-sm font-medium">{f.value}</dd>
                    </div>
                  )
              )}
            </dl>
            {asset.notes && (
              <>
                <Separator className="my-4" />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Заметки</p>
                  <p className="text-sm">{asset.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>История аренды</CardTitle>
          </CardHeader>
          <CardContent>
            {asset.rentals.length === 0 ? (
              <p className="text-sm text-muted-foreground">Аренд пока нет</p>
            ) : (
              <div className="space-y-3">
                {asset.rentals.map((rental) => (
                  <div key={rental.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                    <div>
                      <p className="font-medium">{rental.deal.client.fullName}</p>
                      <p className="text-muted-foreground">
                        {formatDate(rental.startDate)} — {formatDate(rental.endDate)}
                      </p>
                    </div>
                    {showPrices && (
                      <span className="font-medium">
                        {formatCurrency(rental.rentAmount)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
