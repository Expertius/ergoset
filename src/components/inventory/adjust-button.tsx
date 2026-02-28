"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { adjustInventoryAction } from "@/actions/inventory";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import type { Accessory } from "@/generated/prisma/browser";

const MOVEMENT_TYPES = [
  { value: "incoming", label: "Поступление" },
  { value: "return_item", label: "Возврат" },
  { value: "writeoff", label: "Списание" },
  { value: "repair", label: "Ремонт" },
  { value: "lost", label: "Потеря" },
];

interface Props {
  accessories: Accessory[];
}

export function InventoryAdjustButton({ accessories }: Props) {
  const [open, setOpen] = useState(false);

  async function handleSubmit(formData: FormData) {
    const result = await adjustInventoryAction(formData);
    if (result.success) {
      toast.success("Корректировка выполнена");
      setOpen(false);
    } else {
      toast.error(result.error || "Ошибка");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Корректировка
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Корректировка склада</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Аксессуар</Label>
            <Select name="accessoryId" required>
              <SelectTrigger>
                <SelectValue placeholder="Выберите аксессуар" />
              </SelectTrigger>
              <SelectContent>
                {accessories.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Тип операции</Label>
            <Select name="type" required>
              <SelectTrigger>
                <SelectValue placeholder="Тип" />
              </SelectTrigger>
              <SelectContent>
                {MOVEMENT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="qty">Количество</Label>
            <Input id="qty" name="qty" type="number" min="1" required />
          </div>

          <input type="hidden" name="location" value="warehouse" />

          <div className="space-y-2">
            <Label htmlFor="comment">Комментарий</Label>
            <Textarea id="comment" name="comment" rows={2} />
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="submit">Выполнить</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
