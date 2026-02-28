import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function PaymentsPage() {
  return (
    <div>
      <PageHeader title="Платежи" description="Все поступления и расходы" />
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground">
          Платежи будут реализованы в фазе 4
        </CardContent>
      </Card>
    </div>
  );
}
