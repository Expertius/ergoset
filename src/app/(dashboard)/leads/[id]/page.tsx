import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getLeadById } from "@/services/leads";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  LEAD_STATUS_LABELS,
  LEAD_STATUS_COLORS,
  LEAD_INTEREST_LABELS,
  LEAD_INTEREST_COLORS,
  LEAD_SOURCE_LABELS,
} from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LeadActions } from "@/components/leads/lead-actions";
import { LeadEditForm } from "@/components/leads/lead-edit-form";
import Link from "next/link";
import {
  User,
  Phone,
  Mail,
  Calendar,
  Monitor,
  Clock,
  FileText,
  ArrowRight,
} from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function LeadDetailPage({ params }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const lead = await getLeadById(id);

  if (!lead) return notFound();

  if (session.role === "MANAGER" && lead.assignedToId !== session.id) {
    notFound();
  }

  const contractData = lead.contractData as Record<string, string> | null;

  return (
    <div className="space-y-6">
      <PageHeader title={`Лид: ${lead.name}`} backHref="/leads" />

      <div className="flex items-center gap-3 flex-wrap">
        <StatusBadge
          label={LEAD_STATUS_LABELS[lead.status]}
          colorClass={LEAD_STATUS_COLORS[lead.status]}
        />
        <StatusBadge
          label={LEAD_INTEREST_LABELS[lead.interest]}
          colorClass={LEAD_INTEREST_COLORS[lead.interest]}
        />
        <span className="text-sm text-muted-foreground">
          Источник: {LEAD_SOURCE_LABELS[lead.source]}
        </span>
        <span className="text-sm text-muted-foreground">
          Создан: {formatDate(lead.createdAt)}
        </span>
      </div>

      {/* Converted lead notice */}
      {lead.status === "converted" && lead.convertedDeal && (
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="py-3 px-4 flex items-center gap-3">
            <ArrowRight className="h-5 w-5 text-green-500" />
            <div>
              <span className="text-sm font-medium">Конвертирован в сделку </span>
              <Link href={`/deals/${lead.convertedDeal.id}`} className="text-sm text-blue-600 hover:underline">
                #{lead.convertedDeal.id.slice(0, 8)}
              </Link>
              {lead.convertedClient && (
                <>
                  <span className="text-sm text-muted-foreground"> — клиент </span>
                  <Link href={`/clients/${lead.convertedClient.id}`} className="text-sm text-blue-600 hover:underline">
                    {lead.convertedClient.fullName}
                  </Link>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <LeadActions
        leadId={lead.id}
        status={lead.status}
        contractToken={lead.contractToken}
        hasContractData={!!contractData}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contact info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Контактная информация
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{lead.name}</span>
            </div>
            {lead.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{lead.phone}</span>
              </div>
            )}
            {lead.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{lead.email}</span>
              </div>
            )}
            {lead.contactedAt && (
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Связались: {formatDate(lead.contactedAt)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Request details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Детали запроса
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lead.desiredAsset && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Станция</span>
                <span className="text-sm font-medium">{lead.desiredAsset.code} — {lead.desiredAsset.name}</span>
              </div>
            )}
            {lead.desiredConfig && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Конфигурация</span>
                <span className="text-sm">{lead.desiredConfig}</span>
              </div>
            )}
            {lead.desiredStartDate && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Желаемая дата начала</span>
                <span className="text-sm">{formatDate(lead.desiredStartDate)}</span>
              </div>
            )}
            {lead.desiredMonths && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Срок</span>
                <span className="text-sm">{lead.desiredMonths} мес.</span>
              </div>
            )}
            {lead.notes && (
              <div>
                <span className="text-sm text-muted-foreground">Заметки клиента:</span>
                <p className="text-sm mt-1">{lead.notes}</p>
              </div>
            )}
            {lead.assignedTo && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Менеджер</span>
                <span className="text-sm font-medium">{lead.assignedTo.fullName}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contract data (if filled) */}
      {contractData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Данные для договора
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {contractData.fullName && (
                <div>
                  <span className="text-sm text-muted-foreground">ФИО</span>
                  <p className="text-sm font-medium">{contractData.fullName}</p>
                </div>
              )}
              {contractData.phone && (
                <div>
                  <span className="text-sm text-muted-foreground">Телефон</span>
                  <p className="text-sm">{contractData.phone}</p>
                </div>
              )}
              {contractData.email && (
                <div>
                  <span className="text-sm text-muted-foreground">Email</span>
                  <p className="text-sm">{contractData.email}</p>
                </div>
              )}
              {contractData.passportSeries && (
                <div>
                  <span className="text-sm text-muted-foreground">Паспорт</span>
                  <p className="text-sm">{contractData.passportSeries} {contractData.passportNumber}</p>
                </div>
              )}
              {contractData.passportIssuedBy && (
                <div>
                  <span className="text-sm text-muted-foreground">Кем выдан</span>
                  <p className="text-sm">{contractData.passportIssuedBy}</p>
                </div>
              )}
              {contractData.passportIssueDate && (
                <div>
                  <span className="text-sm text-muted-foreground">Дата выдачи</span>
                  <p className="text-sm">{contractData.passportIssueDate}</p>
                </div>
              )}
              {contractData.registrationAddress && (
                <div className="sm:col-span-2">
                  <span className="text-sm text-muted-foreground">Адрес регистрации</span>
                  <p className="text-sm">{contractData.registrationAddress}</p>
                </div>
              )}
              {contractData.actualAddress && (
                <div className="sm:col-span-2">
                  <span className="text-sm text-muted-foreground">Фактический адрес</span>
                  <p className="text-sm">{contractData.actualAddress}</p>
                </div>
              )}
              {contractData.deliveryAddress && (
                <div className="sm:col-span-2">
                  <span className="text-sm text-muted-foreground">Адрес доставки</span>
                  <p className="text-sm">{contractData.deliveryAddress}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Edit form */}
      <Card>
        <CardHeader>
          <CardTitle>Редактирование</CardTitle>
        </CardHeader>
        <CardContent>
          <LeadEditForm lead={{
            id: lead.id,
            name: lead.name,
            phone: lead.phone,
            email: lead.email,
            interest: lead.interest,
            source: lead.source,
            desiredConfig: lead.desiredConfig,
            desiredMonths: lead.desiredMonths,
            notes: lead.notes,
            managerNotes: lead.managerNotes,
          }} />
        </CardContent>
      </Card>
    </div>
  );
}
