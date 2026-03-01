"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

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
        className="p-2 text-zinc-400 hover:text-white transition-colors"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <nav
          aria-label="Мобильная навигация"
          className="absolute top-16 left-0 right-0 bg-zinc-950 border-b border-zinc-800/60 z-50"
        >
          <div className="flex flex-col px-4 py-4 space-y-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm text-zinc-400 hover:text-white transition-colors py-1"
              >
                {link.label}
              </a>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
