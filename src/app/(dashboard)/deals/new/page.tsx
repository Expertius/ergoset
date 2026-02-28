import { PageHeader } from "@/components/shared/page-header";
import { DealForm } from "@/components/deals/deal-form";
import { getClients } from "@/services/clients";
import { getAssets } from "@/services/assets";

export default async function NewDealPage() {
  const [clients, assets] = await Promise.all([
    getClients(),
    getAssets({ status: "available" as const }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Новая сделка" description="Создание аренды / продажи / брони" />
      <DealForm
        clients={clients.map((c) => ({ id: c.id, fullName: c.fullName }))}
        assets={assets.map((a) => ({ id: a.id, code: a.code, name: a.name }))}
      />
    </div>
  );
}
