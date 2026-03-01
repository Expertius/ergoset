"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8">
      <AlertTriangle className="h-10 w-10 text-destructive" />
      <h2 className="text-lg font-semibold">Ошибка загрузки</h2>
      <p className="text-muted-foreground text-center max-w-md">
        Не удалось загрузить данные. Попробуйте обновить страницу или обратитесь к администратору.
      </p>
      <Button onClick={reset} variant="outline">
        Попробовать снова
      </Button>
    </div>
  );
}
