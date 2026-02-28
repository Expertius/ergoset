import { notFound } from "next/navigation";
import { getAccessoryById } from "@/services/accessories";
import { PageHeader } from "@/components/shared/page-header";
import { ACCESSORY_CATEGORY_LABELS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Pencil } from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AccessoryDetailPage({ params }: Props) {
  const { id } = await params;
  const accessory = await getAccessoryById(id);

  if (!accessory) return notFound();

  const inv = accessory.inventoryItems[0];
  const onHand = inv?.qtyOnHand ?? 0;
  const reserved = inv?.qtyReserved ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={accessory.name}
        action={
          <Button asChild variant="outline">
            <Link href={`/accessories/${accessory.id}/edit`}>
              <Pencil className="h-4 w-4 mr-2" />
              Редактировать
            </Link>
          </Button>
        }
      />

      <div className="flex items-center gap-3">
        <Badge variant="outline">
          {ACCESSORY_CATEGORY_LABELS[accessory.category]}
        </Badge>
        <span className="text-sm text-muted-foreground font-mono">
          {accessory.sku}
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Информация</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">На складе</dt>
                <dd className="text-sm font-bold">{onHand}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Зарезервировано</dt>
                <dd className="text-sm font-medium">{reserved}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Доступно</dt>
                <dd className={`text-sm font-bold ${onHand - reserved <= 0 ? "text-destructive" : "text-green-600"}`}>
                  {onHand - reserved}
                </dd>
              </div>
              {accessory.retailPrice && (
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">Розничная</dt>
                  <dd className="text-sm font-medium">
                    {formatCurrency(accessory.retailPrice)}
                  </dd>
                </div>
              )}
              {accessory.dealerPrice && (
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">Дилерская</dt>
                  <dd className="text-sm font-medium">
                    {formatCurrency(accessory.dealerPrice)}
                  </dd>
                </div>
              )}
              {accessory.purchasePrice && (
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">Закупочная</dt>
                  <dd className="text-sm font-medium">
                    {formatCurrency(accessory.purchasePrice)}
                  </dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Движения склада</CardTitle>
          </CardHeader>
          <CardContent>
            {accessory.movements.length === 0 ? (
              <p className="text-sm text-muted-foreground">Движений нет</p>
            ) : (
              <div className="space-y-2">
                {accessory.movements.map((m) => (
                  <div key={m.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                    <div>
                      <span className="font-mono">{m.type}</span>
                      {m.comment && (
                        <span className="text-muted-foreground ml-2">{m.comment}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold">{m.qty}</span>
                      <span className="text-muted-foreground text-xs">
                        {formatDate(m.date)}
                      </span>
                    </div>
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
