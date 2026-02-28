import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function DocumentsPage() {
  return (
    <div>
      <PageHeader title="Документы" description="Договоры, акты, шаблоны" />
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground">
          Генерация документов будет реализована в фазе 6
        </CardContent>
      </Card>
    </div>
  );
}
