"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createClientAction, updateClientAction } from "@/actions/clients";
import { toast } from "sonner";
import type { Client } from "@/generated/prisma/browser";

interface ClientFormProps {
  client?: Client;
}

export function ClientForm({ client }: ClientFormProps) {
  const router = useRouter();
  const isEdit = !!client;

  async function handleSubmit(formData: FormData) {
    if (isEdit) {
      formData.set("id", client.id);
    }
    const action = isEdit ? updateClientAction : createClientAction;
    const result = await action(formData);

    if (result.success) {
      toast.success(isEdit ? "Клиент обновлён" : "Клиент создан");
      router.push("/clients");
    } else {
      toast.error(result.error || "Ошибка");
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">ФИО *</Label>
            <Input
              id="fullName"
              name="fullName"
              defaultValue={client?.fullName}
              placeholder="Иванов Иван Иванович"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={client?.phone || ""}
                placeholder="79001234567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={client?.email || ""}
                placeholder="client@email.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate">Дата рождения</Label>
            <Input
              id="birthDate"
              name="birthDate"
              type="date"
              defaultValue={
                client?.birthDate
                  ? new Date(client.birthDate).toISOString().split("T")[0]
                  : ""
              }
            />
          </div>

          <Separator />
          <h3 className="font-medium">Паспортные данные</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="passportSeries">Серия</Label>
              <Input
                id="passportSeries"
                name="passportSeries"
                defaultValue={client?.passportSeries || ""}
                placeholder="4525"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passportNumber">Номер</Label>
              <Input
                id="passportNumber"
                name="passportNumber"
                defaultValue={client?.passportNumber || ""}
                placeholder="219411"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="passportIssuedBy">Кем выдан</Label>
            <Input
              id="passportIssuedBy"
              name="passportIssuedBy"
              defaultValue={client?.passportIssuedBy || ""}
              placeholder="ГУ МВД РОССИИ ПО Г. МОСКВЕ"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="passportIssueDate">Дата выдачи</Label>
            <Input
              id="passportIssueDate"
              name="passportIssueDate"
              type="date"
              defaultValue={
                client?.passportIssueDate
                  ? new Date(client.passportIssueDate).toISOString().split("T")[0]
                  : ""
              }
            />
          </div>

          <Separator />
          <h3 className="font-medium">Адреса</h3>

          <div className="space-y-2">
            <Label htmlFor="registrationAddress">Адрес регистрации</Label>
            <Input
              id="registrationAddress"
              name="registrationAddress"
              defaultValue={client?.registrationAddress || ""}
              placeholder="г. Москва, ул. ..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="actualAddress">Фактический адрес</Label>
            <Input
              id="actualAddress"
              name="actualAddress"
              defaultValue={client?.actualAddress || ""}
              placeholder="г. Москва, ул. ..."
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="tags">Теги (через запятую)</Label>
            <Input
              id="tags"
              name="tags"
              defaultValue={client?.tags.join(", ") || ""}
              placeholder="аренда, it, лояльный"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Заметки</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={client?.notes || ""}
              rows={4}
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit">{isEdit ? "Сохранить" : "Создать"}</Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Отмена
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
