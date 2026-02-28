import { PageHeader } from "@/components/shared/page-header";
import { PaymentForm } from "@/components/payments/payment-form";
import { prisma } from "@/lib/db";

export default async function NewPaymentPage() {
  const deals = await prisma.deal.findMany({
    where: {
      status: { notIn: ["canceled"] },
    },
    include: { client: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Новый платёж" />
      <PaymentForm
        deals={deals.map((d) => ({
          id: d.id,
          clientName: d.client.fullName,
          type: d.type,
        }))}
      />
    </div>
  );
}
