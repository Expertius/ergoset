"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getFilteredNavGroups } from "./nav-items";
import { useSidebar } from "./sidebar-context";
import { useUser } from "./user-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Armchair, PanelLeftClose, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, sidebarWidth, toggle } = useSidebar();
  const { role } = useUser();

  const filteredGroups = getFilteredNavGroups(role);

  return (
    <aside
      className="hidden md:flex md:flex-col md:fixed md:inset-y-0 border-r bg-sidebar transition-[width] duration-200 ease-in-out z-30"
      style={{ width: sidebarWidth }}
    >
      <div className="flex h-14 items-center border-b px-3">
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-2 font-bold text-lg overflow-hidden",
            collapsed && "justify-center"
          )}
        >
          <Armchair className="h-6 w-6 shrink-0" />
          {!collapsed && <span className="whitespace-nowrap">E-Station</span>}
        </Link>
      </div>

      <ScrollArea className="flex-1 overflow-hidden py-2">
        <TooltipProvider delayDuration={0}>
          <nav aria-label="Основная навигация" className={cn("space-y-4", collapsed ? "px-1" : "px-2")}>
            {filteredGroups.map((group) => (
              <div key={group.label}>
                {!collapsed && (
                  <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {group.label}
                  </p>
                )}
                {collapsed && (
                  <div className="mx-auto my-1 h-px w-8 bg-border" />
                )}
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/" && pathname.startsWith(item.href));

                    const link = (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center rounded-md text-sm font-medium transition-colors",
                          collapsed
                            ? "justify-center px-2 py-2"
                            : "gap-3 px-3 py-2",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && item.title}
                      </Link>
                    );

                    if (collapsed) {
                      return (
                        <Tooltip key={item.href}>
                          <TooltipTrigger asChild>{link}</TooltipTrigger>
                          <TooltipContent side="right" sideOffset={8}>
                            {item.title}
                          </TooltipContent>
                        </Tooltip>
                      );
                    }

                    return link;
                  })}
                </div>
              </div>
            ))}
          </nav>
        </TooltipProvider>
      </ScrollArea>

      <div className="border-t p-2">
        <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggle}
              aria-expanded={!collapsed}
              aria-label={collapsed ? "Развернуть меню" : "Свернуть меню"}
              className={cn(
                "w-full",
                collapsed ? "justify-center px-2" : "justify-start gap-2"
              )}
            >
              {collapsed ? (
                <PanelLeft className="h-4 w-4" />
              ) : (
                <>
                  <PanelLeftClose className="h-4 w-4" />
                  <span className="text-xs text-muted-foreground">
                    Свернуть
                  </span>
                </>
              )}
            </Button>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent side="right" sideOffset={8}>
              Развернуть меню
            </TooltipContent>
          )}
        </Tooltip>
        </TooltipProvider>
      </div>
    </aside>
  );
}
