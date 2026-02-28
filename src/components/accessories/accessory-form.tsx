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
import { createAccessoryAction, updateAccessoryAction } from "@/actions/accessories";
import { ACCESSORY_CATEGORY_LABELS } from "@/lib/constants";
import { toast } from "sonner";
import type { Accessory } from "@/generated/prisma/browser";

interface AccessoryFormProps {
  accessory?: Accessory;
}

export function AccessoryForm({ accessory }: AccessoryFormProps) {
  const router = useRouter();
  const isEdit = !!accessory;

  async function handleSubmit(formData: FormData) {
    if (isEdit) {
      formData.set("id", accessory.id);
    }
    const action = isEdit ? updateAccessoryAction : createAccessoryAction;
    const result = await action(formData);

    if (result.success) {
      toast.success(isEdit ? "Аксессуар обновлён" : "Аксессуар создан");
      router.push("/accessories");
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
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                name="sku"
                defaultValue={accessory?.sku}
                placeholder="EWS-KRON-25"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Название *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={accessory?.name}
                placeholder="Кронштейн EWS-Kron-25"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Категория</Label>
            <Select name="category" defaultValue={accessory?.category || "other"}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ACCESSORY_CATEGORY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Закупочная (коп.)</Label>
              <Input
                id="purchasePrice"
                name="purchasePrice"
                type="number"
                defaultValue={accessory?.purchasePrice || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dealerPrice">Дилерская (коп.)</Label>
              <Input
                id="dealerPrice"
                name="dealerPrice"
                type="number"
                defaultValue={accessory?.dealerPrice || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="retailPrice">Розничная (коп.)</Label>
              <Input
                id="retailPrice"
                name="retailPrice"
                type="number"
                defaultValue={accessory?.retailPrice || ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={accessory?.description || ""}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Заметки</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={accessory?.notes || ""}
              rows={2}
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
