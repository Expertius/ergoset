"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LEAD_STATUS_LABELS, LEAD_SOURCE_LABELS } from "@/lib/constants";
import type { LeadStatus, LeadSource } from "@/generated/prisma/browser";

export function LeadsFiltersBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/leads?${params.toString()}`);
    },
    [router, searchParams],
  );

  useEffect(() => {
    const t = setTimeout(() => updateParam("search", search), 400);
    return () => clearTimeout(t);
  }, [search, updateParam]);

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Input
        placeholder="Поиск по имени, телефону, email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="sm:max-w-xs"
      />
      <Select
        value={searchParams.get("status") || "all"}
        onValueChange={(v) => updateParam("status", v)}
      >
        <SelectTrigger className="sm:w-48">
          <SelectValue placeholder="Статус" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все статусы</SelectItem>
          {Object.entries(LEAD_STATUS_LABELS).map(([k, v]) => (
            <SelectItem key={k} value={k}>{v}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={searchParams.get("source") || "all"}
        onValueChange={(v) => updateParam("source", v)}
      >
        <SelectTrigger className="sm:w-44">
          <SelectValue placeholder="Источник" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все источники</SelectItem>
          {Object.entries(LEAD_SOURCE_LABELS).map(([k, v]) => (
            <SelectItem key={k} value={k}>{v}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
