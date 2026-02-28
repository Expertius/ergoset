import { notFound } from "next/navigation";
import { getAssetById } from "@/services/assets";
import { AssetForm } from "@/components/assets/asset-form";
import { PageHeader } from "@/components/shared/page-header";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditAssetPage({ params }: Props) {
  const { id } = await params;
  const asset = await getAssetById(id);

  if (!asset) return notFound();

  return (
    <div className="max-w-2xl">
      <PageHeader title={`Редактирование: ${asset.name}`} />
      <AssetForm asset={asset} />
    </div>
  );
}
