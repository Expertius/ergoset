"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Monitor } from "lucide-react";
import { useEffect, useState } from "react";

const icons = { light: Sun, dark: Moon, system: Monitor } as const;
const cycle = ["light", "dark", "system"] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Monitor className="h-4 w-4" />
      </Button>
    );
  }

  const current = (theme as (typeof cycle)[number]) ?? "system";
  const Icon = icons[current] ?? Monitor;
  const next = cycle[(cycle.indexOf(current) + 1) % cycle.length];

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(next)}
      title={`Тема: ${current}`}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}
