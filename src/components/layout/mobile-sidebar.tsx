"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getFilteredNavGroups } from "./nav-items";
import { useUser } from "./user-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Armchair } from "lucide-react";

export function MobileSidebar() {
  const pathname = usePathname();
  const { role } = useUser();

  const filteredGroups = getFilteredNavGroups(role);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
          <Armchair className="h-6 w-6" />
          <span>E-Station</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 overflow-hidden py-2">
        <nav aria-label="Мобильная навигация" className="space-y-4 px-2">
          {filteredGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {item.title}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}
