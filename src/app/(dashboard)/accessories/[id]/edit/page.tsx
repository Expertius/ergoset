import { notFound } from "next/navigation";
import { getAccessoryById } from "@/services/accessories";
import { AccessoryForm } from "@/components/accessories/accessory-form";
import { PageHeader } from "@/components/shared/page-header";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditAccessoryPage({ params }: Props) {
  const { id } = await params;
  const accessory = await getAccessoryById(id);

  if (!accessory) return notFound();

  return (
    <div className="max-w-2xl">
      <PageHeader title={`Редактирование: ${accessory.name}`} />
      <AccessoryForm accessory={accessory} />
    </div>
  );
}
