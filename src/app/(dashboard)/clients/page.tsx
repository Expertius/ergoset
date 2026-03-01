import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getClients } from "@/services/clients";
import { PageHeader } from "@/components/shared/page-header";
import { SortableHeader } from "@/components/shared/sortable-header";
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
  searchParams: Promise<{
    search?: string;
    tag?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
};

export default async function ClientsPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const params = await searchParams;
  const clients = await getClients({
    search: params.search,
    tag: params.tag,
    scopeByManagerId: session.role === "MANAGER" ? session.id : undefined,
    sortBy: params.sortBy,
    sortOrder: (params.sortOrder as "asc" | "desc") || undefined,
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

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader column="fullName" label="ФИО" basePath="/clients" />
              <TableHead>Телефон</TableHead>
              <SortableHeader column="email" label="Email" basePath="/clients" />
              <TableHead>Теги</TableHead>
              <TableHead>Заметки</TableHead>
              <SortableHeader column="createdAt" label="Создан" basePath="/clients" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
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
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {new Intl.DateTimeFormat("ru-RU").format(new Date(client.createdAt))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
