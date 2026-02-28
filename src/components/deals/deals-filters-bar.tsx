"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEAL_STATUS_LABELS, DEAL_TYPE_LABELS } from "@/lib/constants";

export function DealsFiltersBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/deals?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Input
        placeholder="Поиск по клиенту..."
        className="max-w-xs"
        defaultValue={searchParams.get("search") || ""}
        onChange={(e) => update("search", e.target.value)}
      />
      <Select
        defaultValue={searchParams.get("status") || "all"}
        onValueChange={(v) => update("status", v)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Статус" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все статусы</SelectItem>
          {Object.entries(DEAL_STATUS_LABELS).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        defaultValue={searchParams.get("type") || "all"}
        onValueChange={(v) => update("type", v)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Тип" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все типы</SelectItem>
          {Object.entries(DEAL_TYPE_LABELS).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
