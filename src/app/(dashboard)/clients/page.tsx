import { getClients } from "@/services/clients";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { formatPhone } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { ClientFiltersBar } from "@/components/clients/filters-bar";

type Props = {
  searchParams: Promise<{ search?: string; tag?: string }>;
};

export default async function ClientsPage({ searchParams }: Props) {
  const params = await searchParams;
  const clients = await getClients({
    search: params.search,
    tag: params.tag,
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Клиенты"
        description={`Всего: ${clients.length}`}
        createHref="/clients/new"
        createLabel="Добавить клиента"
      />

      <ClientFiltersBar />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ФИО</TableHead>
              <TableHead>Телефон</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Теги</TableHead>
              <TableHead>Заметки</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Клиенты не найдены
                </TableCell>
              </TableRow>
            )}
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>
                  <Link
                    href={`/clients/${client.id}`}
                    className="font-medium hover:underline"
                  >
                    {client.fullName}
                  </Link>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {client.phone ? formatPhone(client.phone) : "—"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {client.email || "—"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {client.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                  {client.notes || "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
