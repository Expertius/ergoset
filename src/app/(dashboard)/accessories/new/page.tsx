import { AccessoryForm } from "@/components/accessories/accessory-form";
import { PageHeader } from "@/components/shared/page-header";

export default function NewAccessoryPage() {
  return (
    <div className="max-w-2xl">
      <PageHeader title="Новый аксессуар" />
      <AccessoryForm />
    </div>
  );
}
