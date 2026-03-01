"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";
import { useCallback } from "react";

type Props = {
  column: string;
  label: string;
  className?: string;
  basePath: string;
};

export function SortableHeader({ column, label, className, basePath }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sortBy");
  const currentOrder = searchParams.get("sortOrder") || "asc";
  const isActive = currentSort === column;

  const handleClick = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (isActive) {
      params.set("sortOrder", currentOrder === "asc" ? "desc" : "asc");
    } else {
      params.set("sortBy", column);
      params.set("sortOrder", "asc");
    }
    router.push(`${basePath}?${params.toString()}`);
  }, [router, searchParams, column, isActive, currentOrder, basePath]);

  const Icon = isActive
    ? currentOrder === "asc"
      ? ArrowUp
      : ArrowDown
    : ArrowUpDown;

  return (
    <TableHead className={className}>
      <button
        onClick={handleClick}
        className="flex items-center text-xs font-medium hover:text-foreground transition-colors cursor-pointer"
      >
        {label}
        <Icon className={`h-3 w-3 ml-1 ${isActive ? "" : "opacity-40"}`} />
      </button>
    </TableHead>
  );
}
