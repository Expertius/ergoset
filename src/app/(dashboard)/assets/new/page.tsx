import { AssetForm } from "@/components/assets/asset-form";
import { PageHeader } from "@/components/shared/page-header";

export default function NewAssetPage() {
  return (
    <div className="max-w-2xl">
      <PageHeader title="Новая станция" />
      <AssetForm />
    </div>
  );
}
