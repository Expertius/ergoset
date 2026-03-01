import Link from "next/link";
import { Armchair } from "lucide-react";
import { PublicMobileNav } from "@/components/public/mobile-nav";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-50 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight">
            <Armchair className="h-7 w-7 text-blue-500" />
            <span>ERGOSET</span>
          </Link>
          <nav aria-label="Основная навигация" className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            <a href="#stations" className="hover:text-white transition-colors">Станции</a>
            <a href="#pricing" className="hover:text-white transition-colors">Тарифы</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">Как работает</a>
            <a href="#specs" className="hover:text-white transition-colors">Характеристики</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:block"
            >
              Панель управления
            </Link>
            <a
              href="#booking"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
            >
              Забронировать
            </a>
            <PublicMobileNav />
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-zinc-800/60 bg-zinc-950 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 font-bold text-lg mb-4">
                <Armchair className="h-6 w-6 text-blue-500" />
                ERGOSET
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Сервис подписки на эргономичные киберстанции e-station.
                Работайте или играйте с комфортом.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Навигация</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><a href="#stations" className="hover:text-white transition-colors">Доступные станции</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Тарифы</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">Как работает</a></li>
                <li><a href="#booking" className="hover:text-white transition-colors">Забронировать</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Контакты</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>ergoset.ru</li>
                <li>Москва, Россия</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Юридическое</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>Политика конфиденциальности</li>
                <li>Оферта</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-zinc-800/60 text-center text-xs text-zinc-500">
            &copy; {new Date().getFullYear()} ERGOSET. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
}
