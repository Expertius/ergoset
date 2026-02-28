import { notFound } from "next/navigation";
import { getClientById } from "@/services/clients";
import { ClientForm } from "@/components/clients/client-form";
import { PageHeader } from "@/components/shared/page-header";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditClientPage({ params }: Props) {
  const { id } = await params;
  const client = await getClientById(id);

  if (!client) return notFound();

  return (
    <div className="max-w-2xl">
      <PageHeader title={`Редактирование: ${client.fullName}`} />
      <ClientForm client={client} />
    </div>
  );
}
