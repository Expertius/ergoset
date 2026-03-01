"use client";

import { useState, useTransition } from "react";
import { Database, Trash2, Loader2, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { seedDemoData, clearDemoData } from "@/actions/demo";

type Props = {
  initialLoaded: boolean;
  initialCount: number;
};

export function DemoDataCard({ initialLoaded, initialCount }: Props) {
  const [loaded, setLoaded] = useState(initialLoaded);
  const [count, setCount] = useState(initialCount);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSeed() {
    setMessage(null);
    startTransition(async () => {
      const result = await seedDemoData();
      setMessage(result.message);
      if (result.success) {
        setLoaded(true);
        setCount(11);
      }
    });
  }

  function handleClear() {
    setMessage(null);
    startTransition(async () => {
      const result = await clearDemoData();
      setMessage(result.message);
      if (result.success) {
        setLoaded(false);
        setCount(0);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Демо данные
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${loaded ? "bg-green-500" : "bg-gray-300"}`}
          />
          <span className="text-sm">
            {loaded ? (
              <>
                Загружено <span className="font-medium">{count} сделок</span>
              </>
            ) : (
              "Демо данные не загружены"
            )}
          </span>
        </div>

        <p className="text-xs text-muted-foreground">
          Демо данные включают 11 сделок с разными статусами, клиентов,
          задачи логистики и платежи. Используйте для ознакомления с
          функционалом системы.
        </p>

        <div className="flex gap-2">
          {!loaded ? (
            <Button onClick={handleSeed} disabled={isPending} size="sm">
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Database className="h-4 w-4 mr-2" />
              )}
              Загрузить демо данные
            </Button>
          ) : (
            <Button
              onClick={handleClear}
              disabled={isPending}
              variant="destructive"
              size="sm"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Очистить демо данные
            </Button>
          )}
        </div>

        {message && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-md">
            <CheckCircle className="h-4 w-4 shrink-0" />
            {message}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
