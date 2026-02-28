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
import { createAssetAction, updateAssetAction } from "@/actions/assets";
import { ASSET_STATUS_LABELS } from "@/lib/constants";
import { toast } from "sonner";
import type { Asset } from "@/generated/prisma/browser";

interface AssetFormProps {
  asset?: Asset;
}

export function AssetForm({ asset }: AssetFormProps) {
  const router = useRouter();
  const isEdit = !!asset;

  async function handleSubmit(formData: FormData) {
    if (isEdit) {
      formData.set("id", asset.id);
    }
    const action = isEdit ? updateAssetAction : createAssetAction;
    const result = await action(formData);

    if (result.success) {
      toast.success(isEdit ? "Станция обновлена" : "Станция создана");
      router.push("/assets");
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
              <Label htmlFor="code">Код *</Label>
              <Input
                id="code"
                name="code"
                defaultValue={asset?.code}
                placeholder="EWS-M-011"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Название *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={asset?.name}
                placeholder="EasyWorkStation Замша Голубая"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="brand">Бренд</Label>
              <Input
                id="brand"
                name="brand"
                defaultValue={asset?.brand || ""}
                placeholder="EasyWorkStation"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Модель</Label>
              <Input
                id="model"
                name="model"
                defaultValue={asset?.model || ""}
                placeholder="EWS-M"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Тип</Label>
              <Input
                id="type"
                name="type"
                defaultValue={asset?.type || ""}
                placeholder="Станция / Кресло"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="upholstery">Обивка</Label>
              <Input
                id="upholstery"
                name="upholstery"
                defaultValue={asset?.upholstery || ""}
                placeholder="Замша"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Цвет</Label>
              <Input
                id="color"
                name="color"
                defaultValue={asset?.color || ""}
                placeholder="Серый графит"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tableType">Тип стола</Label>
              <Input
                id="tableType"
                name="tableType"
                defaultValue={asset?.tableType || ""}
                placeholder="Стандартный / Кастом"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Цена закупки (коп.)</Label>
              <Input
                id="purchasePrice"
                name="purchasePrice"
                type="number"
                defaultValue={asset?.purchasePrice || ""}
                placeholder="16500000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dealerPrice">Дилерская (коп.)</Label>
              <Input
                id="dealerPrice"
                name="dealerPrice"
                type="number"
                defaultValue={asset?.dealerPrice || ""}
                placeholder="18000000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="retailPrice">Розничная (коп.)</Label>
              <Input
                id="retailPrice"
                name="retailPrice"
                type="number"
                defaultValue={asset?.retailPrice || ""}
                placeholder="19000000"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Дата покупки</Label>
              <Input
                id="purchaseDate"
                name="purchaseDate"
                type="date"
                defaultValue={
                  asset?.purchaseDate
                    ? new Date(asset.purchaseDate).toISOString().split("T")[0]
                    : ""
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Статус</Label>
              <Select name="status" defaultValue={asset?.status || "available"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ASSET_STATUS_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Локация</Label>
            <Input
              id="location"
              name="location"
              defaultValue={asset?.location || ""}
              placeholder="Склад / Шоурум / У клиента"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Заметки</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={asset?.notes || ""}
              rows={3}
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
