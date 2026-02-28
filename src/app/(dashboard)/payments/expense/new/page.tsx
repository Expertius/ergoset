import { PageHeader } from "@/components/shared/page-header";
import { ExpenseForm } from "@/components/payments/expense-form";
import { getAssets } from "@/services/assets";

export default async function NewExpensePage() {
  const assets = await getAssets();

  return (
    <div className="space-y-6">
      <PageHeader title="Новый расход" />
      <ExpenseForm
        assets={assets.map((a) => ({ id: a.id, code: a.code, name: a.name }))}
      />
    </div>
  );
}
