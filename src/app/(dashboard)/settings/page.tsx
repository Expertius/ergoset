import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Настройки" description="Параметры системы" />
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground">
          Настройки будут реализованы позже
        </CardContent>
      </Card>
    </div>
  );
}
