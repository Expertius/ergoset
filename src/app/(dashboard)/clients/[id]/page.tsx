import { notFound } from "next/navigation";
import { getClientById } from "@/services/clients";
import { PageHeader } from "@/components/shared/page-header";
import { formatDate, formatPhone, formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Pencil } from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ClientDetailPage({ params }: Props) {
  const { id } = await params;
  const client = await getClientById(id);

  if (!client) return notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={client.fullName}
        action={
          <Button asChild variant="outline">
            <Link href={`/clients/${client.id}/edit`}>
              <Pencil className="h-4 w-4 mr-2" />
              Редактировать
            </Link>
          </Button>
        }
      />

      <div className="flex gap-2 flex-wrap">
        {client.tags.map((tag) => (
          <Badge key={tag} variant="outline">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Контакты</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              {client.phone && (
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">Телефон</dt>
                  <dd className="text-sm font-medium font-mono">
                    {formatPhone(client.phone)}
                  </dd>
                </div>
              )}
              {client.email && (
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">Email</dt>
                  <dd className="text-sm font-medium">{client.email}</dd>
                </div>
              )}
              {client.birthDate && (
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">Дата рождения</dt>
                  <dd className="text-sm font-medium">{formatDate(client.birthDate)}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Паспортные данные</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              {client.passportSeries && (
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">Серия / Номер</dt>
                  <dd className="text-sm font-medium font-mono">
                    {client.passportSeries} {client.passportNumber}
                  </dd>
                </div>
              )}
              {client.passportIssuedBy && (
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">Кем выдан</dt>
                  <dd className="text-sm font-medium text-right max-w-[250px]">
                    {client.passportIssuedBy}
                  </dd>
                </div>
              )}
              {client.passportIssueDate && (
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">Дата выдачи</dt>
                  <dd className="text-sm font-medium">{formatDate(client.passportIssueDate)}</dd>
                </div>
              )}
              {client.registrationAddress && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Адрес регистрации</p>
                    <p className="text-sm">{client.registrationAddress}</p>
                  </div>
                </>
              )}
              {client.actualAddress && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Фактический адрес</p>
                  <p className="text-sm">{client.actualAddress}</p>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        {client.notes && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Заметки</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{client.notes}</p>
            </CardContent>
          </Card>
        )}

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>История сделок</CardTitle>
          </CardHeader>
          <CardContent>
            {client.deals.length === 0 ? (
              <p className="text-sm text-muted-foreground">Сделок пока нет</p>
            ) : (
              <div className="space-y-3">
                {client.deals.map((deal) => (
                  <div key={deal.id} className="border-b pb-3 last:border-0">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">{deal.type}</span>
                      <Badge variant="outline">{deal.status}</Badge>
                    </div>
                    {deal.rentals.map((r) => (
                      <p key={r.id} className="text-sm text-muted-foreground mt-1">
                        {r.asset.name} — {formatDate(r.startDate)} — {formatDate(r.endDate)}
                        {r.rentAmount > 0 && ` — ${formatCurrency(r.rentAmount)}`}
                      </p>
                    ))}
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
