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
import { ACCESSORY_CATEGORY_LABELS } from "@/lib/constants";
import { useState, useEffect, useCallback } from "react";

export function AccessoryFiltersBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/accessories?${params.toString()}`);
    },
    [router, searchParams]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      updateParams("search", search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, updateParams]);

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Input
        placeholder="Поиск по SKU, названию..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />
      <Select
        defaultValue={searchParams.get("category") || "all"}
        onValueChange={(val) => updateParams("category", val)}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Все категории" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все категории</SelectItem>
          {Object.entries(ACCESSORY_CATEGORY_LABELS).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
