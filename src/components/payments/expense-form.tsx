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
import { createExpenseAction } from "@/actions/payments";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/constants";
import { toast } from "sonner";

interface ExpenseFormProps {
  assets: { id: string; code: string; name: string }[];
}

export function ExpenseForm({ assets }: ExpenseFormProps) {
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    const result = await createExpenseAction(formData);
    if (result.success) {
      toast.success("Расход добавлен");
      router.push("/payments");
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
              <Label htmlFor="category">Категория *</Label>
              <Select name="category" defaultValue="other" required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EXPENSE_CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assetId">Станция (опционально)</Label>
              <Select name="assetId">
                <SelectTrigger>
                  <SelectValue placeholder="Не привязан" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Без привязки</SelectItem>
                  {assets.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.code} — {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Сумма (коп.) *</Label>
              <Input id="amount" name="amount" type="number" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Дата *</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Комментарий</Label>
            <Textarea id="comment" name="comment" rows={2} />
          </div>

          <div className="flex gap-3">
            <Button type="submit">Добавить расход</Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Отмена
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
