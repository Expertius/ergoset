import { PageHeader } from "@/components/shared/page-header";
import { DealForm } from "@/components/deals/deal-form";
import { getClients } from "@/services/clients";
import { getAssets } from "@/services/assets";
import { getInventoryOverview } from "@/services/inventory";

export default async function NewDealPage() {
  const [clients, assets, inventoryItems] = await Promise.all([
    getClients(),
    getAssets({ status: "available" as const }),
    getInventoryOverview(),
  ]);

  const accessories = inventoryItems.map((item) => ({
    id: item.accessoryId,
    sku: item.accessory.sku,
    name: item.accessory.name,
    available: item.qtyOnHand - item.qtyReserved,
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Новая сделка" description="Создание аренды / продажи / брони" />
      <DealForm
        clients={clients.map((c) => ({ id: c.id, fullName: c.fullName }))}
        assets={assets.map((a) => ({ id: a.id, code: a.code, name: a.name }))}
        accessories={accessories}
      />
    </div>
  );
}
