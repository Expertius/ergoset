import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function CalendarPage() {
  return (
    <div>
      <PageHeader title="Календарь" description="Расписание аренд, возвратов и доставок" />
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground">
          Календарь будет реализован в фазе 5
        </CardContent>
      </Card>
    </div>
  );
}
