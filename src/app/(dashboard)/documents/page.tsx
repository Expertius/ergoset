import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getDocuments } from "@/services/documents";
import { PageHeader } from "@/components/shared/page-header";
import { SortableHeader } from "@/components/shared/sortable-header";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_STATUS_LABELS,
  DOCUMENT_STATUS_COLORS,
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
import Link from "next/link";
import { DocumentFiltersBar } from "@/components/documents/filters-bar";
import type { DocumentType, DocumentStatus } from "@/generated/prisma/browser";

type Props = {
  searchParams: Promise<{
    type?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
};

export default async function DocumentsPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const params = await searchParams;
  const documents = await getDocuments({
    scopeByManagerId: session.role === "MANAGER" ? session.id : undefined,
    type: params.type as DocumentType | undefined,
    status: params.status as DocumentStatus | undefined,
    sortBy: params.sortBy,
    sortOrder: (params.sortOrder as "asc" | "desc") || undefined,
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Документы"
        description={`Всего: ${documents.length}`}
      />

      <DocumentFiltersBar />

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Клиент</TableHead>
              <SortableHeader column="type" label="Тип" basePath="/documents" />
              <TableHead>Станция</TableHead>
              <SortableHeader column="status" label="Статус" basePath="/documents" />
              <SortableHeader column="createdAt" label="Дата" basePath="/documents" />
              <TableHead>Файл</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Документов нет
                </TableCell>
              </TableRow>
            )}
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>
                  <Link
                    href={`/deals/${doc.dealId}`}
                    className="font-medium hover:underline"
                  >
                    {doc.deal.client.fullName}
                  </Link>
                </TableCell>
                <TableCell className="text-sm">
                  {DOCUMENT_TYPE_LABELS[doc.type]}
                </TableCell>
                <TableCell className="text-sm font-mono">
                  {doc.rental?.asset.code || "—"}
                </TableCell>
                <TableCell>
                  <StatusBadge
                    label={DOCUMENT_STATUS_LABELS[doc.status]}
                    colorClass={DOCUMENT_STATUS_COLORS[doc.status]}
                  />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(doc.createdAt)}
                </TableCell>
                <TableCell className="text-sm">
                  {doc.filePath ? (
                    <a
                      href={`/api/documents/${doc.id}/download`}
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Скачать
                    </a>
                  ) : (
                    <span className="text-muted-foreground">Черновик</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
