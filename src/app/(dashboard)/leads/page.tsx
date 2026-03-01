import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { buildLeadScope } from "@/lib/rbac";
import { getLeads, getLeadStats } from "@/services/leads";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import type { LeadStatus, LeadSource } from "@/generated/prisma/browser";
import { LeadsFiltersBar } from "@/components/leads/leads-filters-bar";
import { UserPlus, Phone, Mail, Sparkles } from "lucide-react";

type Props = {
  searchParams: Promise<{
    search?: string;
    status?: string;
    source?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
};

export default async function LeadsPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const leadScope = buildLeadScope(session);
  const params = await searchParams;
  const [leads, stats] = await Promise.all([
    getLeads({
      search: params.search,
      ...leadScope,
      status: params.status as LeadStatus | undefined,
      source: params.source as LeadSource | undefined,
      sortBy: params.sortBy || "createdAt",
      sortDir: (params.sortOrder as "asc" | "desc") || "desc",
    }),
    getLeadStats(leadScope),
  ]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Лиды"
        description={`Всего: ${stats.total}`}
      />

      <div className="grid gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Новые</span>
            </div>
            <div className="text-2xl font-bold mt-1">{stats.new}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-cyan-500" />
              <span className="text-sm text-muted-foreground">Связались</span>
            </div>
            <div className="text-2xl font-bold mt-1">{stats.contacted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-muted-foreground">Квалифицир.</span>
            </div>
            <div className="text-2xl font-bold mt-1">{stats.qualified}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Конвертир.</span>
            </div>
            <div className="text-2xl font-bold mt-1">{stats.converted}</div>
          </CardContent>
        </Card>
      </div>

      <LeadsFiltersBar />

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Имя</TableHead>
              <TableHead>Контакт</TableHead>
              <TableHead>Интерес</TableHead>
              <TableHead>Станция</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Источник</TableHead>
              <TableHead>Менеджер</TableHead>
              <TableHead>Дата</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  Лиды не найдены
                </TableCell>
              </TableRow>
            )}
            {leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell>
                  <Link
                    href={`/leads/${lead.id}`}
                    className="font-medium hover:underline"
                  >
                    {lead.name}
                  </Link>
                </TableCell>
                <TableCell className="text-sm">
                  <div className="space-y-0.5">
                    {lead.phone && <div className="text-muted-foreground">{lead.phone}</div>}
                    {lead.email && <div className="text-muted-foreground">{lead.email}</div>}
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge
                    label={LEAD_INTEREST_LABELS[lead.interest]}
                    colorClass={LEAD_INTEREST_COLORS[lead.interest]}
                  />
                </TableCell>
                <TableCell className="text-sm">
                  {lead.desiredAsset ? (
                    <span className="font-mono">{lead.desiredAsset.code}</span>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  <StatusBadge
                    label={LEAD_STATUS_LABELS[lead.status]}
                    colorClass={LEAD_STATUS_COLORS[lead.status]}
                  />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {LEAD_SOURCE_LABELS[lead.source]}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {lead.assignedTo?.fullName || "—"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(lead.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
