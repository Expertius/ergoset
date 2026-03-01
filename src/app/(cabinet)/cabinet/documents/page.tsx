import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getClientByUserId, getClientDocuments } from "@/services/cabinet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Download } from "lucide-react";

const DOC_TYPE_LABELS: Record<string, string> = {
  rental_contract: "Договор аренды",
  transfer_act: "Акт приёма-передачи",
  return_act: "Акт возврата",
  buyout_doc: "Документ выкупа",
  equipment_appendix: "Приложение с оборудованием",
};

const DOC_STATUS_LABELS: Record<string, string> = {
  draft: "Черновик",
  generated: "Сформирован",
  sent: "Отправлен",
  signed: "Подписан",
  archived: "В архиве",
};

export default async function CabinetDocumentsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const client = await getClientByUserId(session.id);
  if (!client) redirect("/login");

  const documents = await getClientDocuments(client.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Документы</h1>
        <p className="text-muted-foreground">
          Договоры, акты и другие документы по вашим арендам
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Все документы ({documents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">Нет документов</p>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {DOC_TYPE_LABELS[doc.type] || doc.type}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(doc.createdAt)}
                      {doc.rental?.asset &&
                        ` · ${doc.rental.asset.code} ${doc.rental.asset.name}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {DOC_STATUS_LABELS[doc.status] || doc.status}
                    </Badge>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`/api/documents/${doc.id}/download`}>
                        <Download className="h-4 w-4 mr-1" />
                        Скачать
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
