import { ClientForm } from "@/components/clients/client-form";
import { PageHeader } from "@/components/shared/page-header";

export default function NewClientPage() {
  return (
    <div className="max-w-2xl">
      <PageHeader title="Новый клиент" />
      <ClientForm />
    </div>
  );
}
