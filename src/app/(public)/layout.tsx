import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { PublicMobileNav } from "@/components/public/mobile-nav";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-zinc-950/70 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center">
            <Image src="/images/logo.svg" alt="ERGOSET" width={150} height={42} className="h-9 w-auto" priority />
          </Link>

          <nav aria-label="Main" className="hidden md:flex items-center gap-1">
            {[
              { href: "#stations", label: "Станции" },
              { href: "#pricing", label: "Тарифы" },
              { href: "#how-it-works", label: "Как работает" },
              { href: "#specs", label: "Характеристики" },
              { href: "#faq", label: "FAQ" },
            ].map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-lg px-3.5 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-all duration-200"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-all duration-200"
            >
              Войти
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
            <a
              href="#booking"
              className="rounded-xl bg-[#ACFF27] px-5 py-2.5 text-sm font-bold text-black hover:bg-[#c4ff5c] transition-all duration-200 shadow-lg shadow-[#ACFF27]/10"
            >
              Забронировать
            </a>
            <PublicMobileNav />
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="relative border-t border-white/[0.06] bg-zinc-950">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <div className="mb-5">
                <Image src="/images/logo-footer.svg" alt="ERGOSET" width={140} height={40} className="h-8 w-auto" />
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">
                Сервис подписки на эргономичные киберстанции e-station.
                Работайте и играйте с комфортом будущего.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">Навигация</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#stations" className="text-zinc-500 hover:text-white transition-colors">Доступные станции</a></li>
                <li><a href="#pricing" className="text-zinc-500 hover:text-white transition-colors">Тарифы</a></li>
                <li><a href="#how-it-works" className="text-zinc-500 hover:text-white transition-colors">Как работает</a></li>
                <li><a href="#booking" className="text-zinc-500 hover:text-white transition-colors">Забронировать</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">Контакты</h4>
              <ul className="space-y-2.5 text-sm text-zinc-500">
                <li>ergoset.ru</li>
                <li>Москва, Россия</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">Юридическое</h4>
              <ul className="space-y-2.5 text-sm">
                <li><span className="text-zinc-500 hover:text-white transition-colors cursor-pointer">Политика конфиденциальности</span></li>
                <li><span className="text-zinc-500 hover:text-white transition-colors cursor-pointer">Оферта</span></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-zinc-600">
              &copy; {new Date().getFullYear()} ERGOSET. Все права защищены.
            </p>
            <p className="text-xs text-zinc-700">
              Подписка на рабочие места будущего
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
