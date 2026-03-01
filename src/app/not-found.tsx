import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <FileQuestion className="h-16 w-16 text-muted-foreground" />
      <h1 className="text-2xl font-bold">Страница не найдена</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Запрашиваемая страница не существует или была перемещена.
      </p>
      <Button asChild>
        <Link href="/">На главную</Link>
      </Button>
    </div>
  );
}
