import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function ImportPage() {
  return (
    <div>
      <PageHeader title="Импорт" description="Загрузка данных из CSV" />
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground">
          Импорт CSV будет реализован в фазе 7
        </CardContent>
      </Card>
    </div>
  );
}
