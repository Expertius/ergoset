import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Настройки" description="Конфигурация системы" />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Telegram уведомления</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Bot Token</Label>
              <Input
                type="password"
                placeholder="Задаётся через TELEGRAM_BOT_TOKEN в .env"
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label>Chat ID</Label>
              <Input
                type="text"
                placeholder="Задаётся через TELEGRAM_CHAT_ID в .env"
                disabled
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Для настройки уведомлений в Telegram задайте переменные окружения
              TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Шаблоны документов</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Разместите DOCX-шаблоны в папку <code>templates/</code> проекта.
              Поддерживаемые шаблоны:
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              <li><code>rental-contract.docx</code> — Договор аренды</li>
              <li><code>transfer-act.docx</code> — Акт приёма-передачи</li>
              <li><code>return-act.docx</code> — Акт возврата</li>
              <li><code>buyout-doc.docx</code> — Договор выкупа</li>
              <li><code>equipment-appendix.docx</code> — Приложение</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Пороги уведомлений</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Текущие пороги (настраиваются в коде):
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>Возврат: 7 / 3 / 1 день</li>
              <li>Простой: 14 дней</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
