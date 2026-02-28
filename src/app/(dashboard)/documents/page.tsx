import { getDocuments } from "@/services/documents";
import { PageHeader } from "@/components/shared/page-header";
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

export default async function DocumentsPage() {
  const documents = await getDocuments();

  return (
    <div className="space-y-4">
      <PageHeader
        title="Документы"
        description={`Всего: ${documents.length}`}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Клиент</TableHead>
              <TableHead>Тип</TableHead>
              <TableHead>Станция</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Дата</TableHead>
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
                    <span className="text-green-600">Сгенерирован</span>
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
