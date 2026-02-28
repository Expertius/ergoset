import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

interface PageHeaderProps {
  title: string;
  description?: string;
  createHref?: string;
  createLabel?: string;
  action?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  createHref,
  createLabel = "Создать",
  action,
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {createHref && (
        <Button asChild>
          <Link href={createHref}>
            <Plus className="h-4 w-4 mr-2" />
            {createLabel}
          </Link>
        </Button>
      )}
      {action}
    </div>
  );
}
