import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function ReportsPage() {
  return (
    <div>
      <PageHeader title="Отчёты" description="Экономика, окупаемость, простой" />
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground">
          Отчёты будут реализованы в фазе 8
        </CardContent>
      </Card>
    </div>
  );
}
