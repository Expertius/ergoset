"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/actions/auth";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Armchair,
  LayoutDashboard,
  FileText,
  CreditCard,
  FolderOpen,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const cabinetNav = [
  { title: "Обзор", href: "/cabinet", icon: LayoutDashboard },
  { title: "Аренды", href: "/cabinet/rentals", icon: FileText },
  { title: "Платежи", href: "/cabinet/payments", icon: CreditCard },
  { title: "Документы", href: "/cabinet/documents", icon: FolderOpen },
  { title: "Профиль", href: "/cabinet/profile", icon: User },
];

export function CabinetHeader({ fullName }: { fullName: string | null }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/cabinet" className="flex items-center gap-2 font-bold text-lg">
              <Armchair className="h-5 w-5" />
              <span className="hidden sm:inline">E-Station</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {cabinetNav.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/cabinet" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {fullName && (
              <span className="hidden sm:inline text-sm text-muted-foreground">
                {fullName}
              </span>
            )}
            <ThemeToggle />
            <form action={logoutAction}>
              <Button variant="ghost" size="icon" type="submit" title="Выйти">
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="md:hidden border-t pb-3 pt-2 space-y-1">
            {cabinetNav.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/cabinet" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
