"use client";

import { useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import Link from "next/link";

const NAV_LINKS = [
  { href: "#stations", label: "Станции" },
  { href: "#pricing", label: "Тарифы" },
  { href: "#how-it-works", label: "Как работает" },
  { href: "#specs", label: "Характеристики" },
  { href: "#faq", label: "FAQ" },
];

export function PublicMobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Закрыть меню" : "Открыть меню"}
        aria-expanded={open}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-all duration-200"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setOpen(false)}
          />
          <nav
            aria-label="Мобильная навигация"
            className="fixed top-16 left-0 right-0 bg-zinc-950/95 backdrop-blur-2xl border-b border-white/[0.06] z-50"
          >
            <div className="flex flex-col px-6 py-6 space-y-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-all duration-200"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 mt-3 border-t border-white/[0.06]">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-1.5 rounded-xl px-4 py-3 text-sm text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-all duration-200"
                >
                  Войти
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
