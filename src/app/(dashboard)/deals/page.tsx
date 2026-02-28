import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function DealsPage() {
  return (
    <div>
      <PageHeader title="Сделки" description="Аренды, продажи, возвраты" />
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground">
          Сделки и аренды будут реализованы в фазе 3
        </CardContent>
      </Card>
    </div>
  );
}
