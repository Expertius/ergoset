import { PageHeader } from "@/components/shared/page-header";
import { ImportWizard } from "@/components/import/import-wizard";

export default function ImportPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Импорт данных"
        description="Загрузка станций, аксессуаров, клиентов и платежей из CSV"
      />
      <ImportWizard />
    </div>
  );
}
