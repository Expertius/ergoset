"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { createDealAction } from "@/actions/deals";
import { DEAL_TYPE_LABELS } from "@/lib/constants";
import { toast } from "sonner";

interface DealFormProps {
  clients: { id: string; fullName: string }[];
  assets: { id: string; code: string; name: string }[];
}

export function DealForm({ clients, assets }: DealFormProps) {
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    const result = await createDealAction(formData);
    if (result.success) {
      toast.success("Сделка создана");
      router.push(`/deals/${result.id}`);
    } else {
      toast.error(result.error || "Ошибка");
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="clientId">Клиент *</Label>
              <Select name="clientId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите клиента" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Тип сделки</Label>
              <Select name="type" defaultValue="rent">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DEAL_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="assetId">Станция *</Label>
              <Select name="assetId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите станцию" />
                </SelectTrigger>
                <SelectContent>
                  {assets.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.code} — {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="plannedMonths">Срок (мес.)</Label>
              <Input
                id="plannedMonths"
                name="plannedMonths"
                type="number"
                min={1}
                placeholder="3"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Дата начала *</Label>
              <Input id="startDate" name="startDate" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Дата окончания *</Label>
              <Input id="endDate" name="endDate" type="date" required />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="rentAmount">Аренда (коп.)</Label>
              <Input
                id="rentAmount"
                name="rentAmount"
                type="number"
                defaultValue="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryAmount">Доставка (коп.)</Label>
              <Input
                id="deliveryAmount"
                name="deliveryAmount"
                type="number"
                defaultValue="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assemblyAmount">Сборка (коп.)</Label>
              <Input
                id="assemblyAmount"
                name="assemblyAmount"
                type="number"
                defaultValue="0"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="depositAmount">Залог (коп.)</Label>
              <Input
                id="depositAmount"
                name="depositAmount"
                type="number"
                defaultValue="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discountAmount">Скидка (коп.)</Label>
              <Input
                id="discountAmount"
                name="discountAmount"
                type="number"
                defaultValue="0"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="addressDelivery">Адрес доставки</Label>
              <Input id="addressDelivery" name="addressDelivery" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Источник</Label>
              <Input id="source" name="source" placeholder="Сайт / Avito / Рекомендация" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Заметки</Label>
            <Textarea id="notes" name="notes" rows={3} />
          </div>

          <div className="flex gap-3">
            <Button type="submit">Создать сделку</Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Отмена
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
