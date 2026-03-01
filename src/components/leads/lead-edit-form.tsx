"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { updateLeadAction } from "@/actions/leads";
import { LEAD_INTEREST_LABELS, LEAD_SOURCE_LABELS } from "@/lib/constants";
import { Save, Loader2 } from "lucide-react";

type Lead = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  interest: string;
  source: string;
  desiredConfig: string | null;
  desiredMonths: number | null;
  notes: string | null;
  managerNotes: string | null;
};

export function LeadEditForm({ lead }: { lead: Lead }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await updateLeadAction(lead.id, fd);
    if (res.success) {
      toast.success("Лид обновлён");
      router.refresh();
    } else {
      toast.error(res.error || "Ошибка");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Имя</Label>
          <Input id="name" name="name" defaultValue={lead.name} required />
        </div>
        <div>
          <Label htmlFor="phone">Телефон</Label>
          <Input id="phone" name="phone" defaultValue={lead.phone || ""} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={lead.email || ""} />
        </div>
        <div>
          <Label>Интерес</Label>
          <Select name="interest" defaultValue={lead.interest}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(LEAD_INTEREST_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Источник</Label>
          <Select name="source" defaultValue={lead.source}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(LEAD_SOURCE_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="desiredMonths">Срок (мес.)</Label>
          <Input id="desiredMonths" name="desiredMonths" type="number" defaultValue={lead.desiredMonths || ""} />
        </div>
      </div>
      <div>
        <Label htmlFor="desiredConfig">Конфигурация</Label>
        <Input id="desiredConfig" name="desiredConfig" defaultValue={lead.desiredConfig || ""} />
      </div>
      <div>
        <Label htmlFor="notes">Заметки клиента</Label>
        <Textarea id="notes" name="notes" defaultValue={lead.notes || ""} rows={2} />
      </div>
      <div>
        <Label htmlFor="managerNotes">Заметки менеджера</Label>
        <Textarea id="managerNotes" name="managerNotes" defaultValue={lead.managerNotes || ""} rows={3} />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
        Сохранить
      </Button>
    </form>
  );
}
