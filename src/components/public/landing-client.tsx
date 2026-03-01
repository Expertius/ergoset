"use client";

import { useState } from "react";
import {
  ArrowDown,
  Sparkles,
  Zap,
  Heart,
  ClipboardList,
  FileSignature,
  Truck,
  Smile,
  Monitor,
  Eye,
  RotateCcw,
  ChevronDown,
  Check,
  Leaf,
  Shield,
  Star,
  Quote,
  XCircle as XCircleIcon,
  ArrowRight,
} from "lucide-react";
import { StationsSection } from "./stations-section";
import { BookingForm } from "./booking-form";

const BENEFITS = [
  {
    icon: Heart,
    title: "Идеальная анатомия",
    desc: "Анатомически правильная форма и умеренная жёсткость позволяют расслаблять мышцы спины. Забудьте о болях в спине и шее.",
    gradient: "from-rose-500/20 to-orange-500/20",
    iconColor: "text-rose-400",
    iconBg: "bg-rose-500/10",
  },
  {
    icon: Zap,
    title: "Выше продуктивность",
    desc: "Полулёжа концентрация вырастает — эффект кокона позволяет работать большими слотами без усталости.",
    gradient: "from-amber-500/20 to-yellow-500/20",
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/10",
  },
  {
    icon: Sparkles,
    title: "Новые ощущения",
    desc: "Получите опыт, который не имеет аналогов. Станция вызывает привыкание к хорошему — это тест-драйв будущего.",
    gradient: "from-violet-500/20 to-blue-500/20",
    iconColor: "text-violet-400",
    iconBg: "bg-violet-500/10",
  },
];

const STEPS = [
  {
    icon: ClipboardList,
    num: "01",
    title: "Определяемся с конфигурацией",
    desc: "Сообщаете количество мониторов и оборудования — подбираем самый удобный комплект кронштейнов.",
  },
  {
    icon: FileSignature,
    num: "02",
    title: "Договор и оплата",
    desc: "Делаем бронь, подписываем договор онлайн и ставим в календарь доставку.",
  },
  {
    icon: Truck,
    num: "03",
    title: "Доставка и сборка",
    desc: "В согласованный день привозим станцию, устанавливаем и настраиваем у вас на адресе.",
  },
  {
    icon: Smile,
    num: "04",
    title: "Наслаждаетесь",
    desc: "Тестируете в полной мере на длительной дистанции. Счастливые и здоровые работаете или играете.",
  },
];

const FEATURES = [
  {
    icon: RotateCcw,
    title: "Меняйте положение",
    desc: "От обычного сидя до полностью горизонтального — когда вам это нужно.",
    stat: "180°",
    statLabel: "диапазон",
  },
  {
    icon: Eye,
    title: "Экран там где нужно",
    desc: "Всегда на одном расстоянии от глаз, что обеспечивает комфорт при любом положении.",
    stat: "≡",
    statLabel: "идеальная дистанция",
  },
  {
    icon: Monitor,
    title: "До 3 мониторов",
    desc: "Плюс дополнительный кронштейн для ноутбука, планшета или вертикального монитора.",
    stat: "3+1",
    statLabel: "экранов",
  },
];

const PRICING_RENT = [
  {
    period: "2 месяца",
    price: "12 000",
    daily: "399",
    total: "24 000",
    note: "Минимальный срок аренды",
    highlight: false,
    badge: null,
  },
  {
    period: "3 месяца",
    price: "10 470",
    daily: "349",
    total: "31 410",
    note: "Экономия 15%",
    highlight: false,
    badge: "Популярно",
  },
  {
    period: "3–6 мес.",
    price: "8 790",
    daily: "293",
    total: "Помесячно",
    note: "Продление в этом периоде",
    highlight: false,
    badge: null,
  },
  {
    period: "7+ мес.",
    price: "5 999",
    daily: "199",
    total: "Помесячно",
    note: "Максимальная выгода",
    highlight: true,
    badge: "Лучшая цена",
  },
];

const SPECS = [
  { label: "Вес", value: "70–100 кг (зависит от комплектации)" },
  { label: "Грузоподъёмность", value: "до 160 кг" },
  { label: "Ограничение по весу", value: "120 кг" },
  { label: "Энергопотребление", value: "58 Вт" },
  { label: "Напряжение", value: "220В / 29В (внутр.)" },
  { label: "Мониторы", value: "от 1 до 3 + доп. кронштейн" },
  { label: "Макс. угол наклона", value: "24°" },
  { label: "Габариты (верт.)", value: "1370 × 1250 × 906 мм" },
  { label: "Габариты (гориз.)", value: "1830 × 1400 × 906 мм" },
  { label: "Производство", value: "Россия (Реестр инноваций Москвы)" },
];

const FAQ = [
  {
    q: "Какой минимальный срок аренды?",
    a: "Минимальный срок — 2 месяца. Это позволяет вам полноценно протестировать станцию и привыкнуть к работе в эргономичном положении.",
  },
  {
    q: "Что входит в стоимость аренды?",
    a: "Станция с выбранной конфигурацией кронштейнов. Доставка и сборка оплачиваются дополнительно разово. Мониторы и компьютеры не входят.",
  },
  {
    q: "Можно ли выкупить станцию после аренды?",
    a: "Да! Мы предлагаем программу аренды с выкупом. Часть арендных платежей может быть зачтена при покупке.",
  },
  {
    q: "Как проходит доставка и сборка?",
    a: "Собственная бережная доставка на электромобиле. Привозим, собираем, настраиваем, показываем как пользоваться — всё за один визит.",
  },
  {
    q: "Подберёте кронштейны под мои мониторы?",
    a: "Да, подберём идеальный комплект. При специфичных запросах можем привезти несколько вариантов и на месте выбрать самый удобный — бесплатно.",
  },
  {
    q: "Что если станция мне не подошла?",
    a: "Минимальный срок аренды — 2 месяца. По истечении вы можете вернуть станцию. Мы заберём и разберём всё сами.",
  },
];

const TESTIMONIALS = [
  {
    name: "Алексей",
    role: "Разработчик",
    text: "Работаю по 10 часов в день — спина больше не болит. За 2 месяца полностью привык и не хочу возвращаться на обычное кресло.",
    stars: 5,
    initials: "АЛ",
  },
  {
    name: "Мария",
    role: "Дизайнер",
    text: "Сначала боялась, что будет непривычно. Через неделю поняла — это совершенно другой уровень комфорта. 3 монитора идеально встали.",
    stars: 5,
    initials: "МА",
  },
  {
    name: "Дмитрий",
    role: "Геймер",
    text: "Взял на 2 месяца попробовать, сейчас на 8-м. Играть полулёжа — это нечто. Доставили и собрали за час, всё чётко.",
    stars: 5,
    initials: "ДМ",
  },
];

export function LandingClient() {
  const [selectedStation, setSelectedStation] = useState<{ id: string; name: string } | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/8 rounded-full blur-[128px] animate-float" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-600/8 rounded-full blur-[128px] animate-float-delayed" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-600/5 rounded-full blur-[128px] animate-float-slow" />
          <div className="absolute inset-0 grid-pattern" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40 text-center w-full">
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/[0.06] px-5 py-2 text-sm text-blue-400 mb-8 backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              <span>Тест-драйв будущего рабочего места</span>
            </div>
          </div>

          <h1 className="animate-slide-up delay-100 text-5xl sm:text-6xl lg:text-8xl font-extrabold tracking-tight leading-[1.05]">
            Подписка на
            <br />
            <span className="text-gradient-blue">киберстанции</span>
            <br />
            <span className="text-zinc-500">e-station</span>
          </h1>

          <p className="animate-slide-up delay-200 mt-8 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Эргономичные рабочие станции с полным циклом обслуживания.
            Работайте или играйте с максимальным комфортом{" "}
            <span className="text-white font-semibold">от 199 ₽/день</span>
          </p>

          <div className="animate-slide-up delay-300 mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#booking"
              className="group relative rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-blue-600/20 hover:shadow-blue-600/30 hover:brightness-110 transition-all duration-300 flex items-center gap-2"
            >
              Забронировать станцию
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#how-it-works"
              className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm px-8 py-4 text-base font-medium text-zinc-300 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 flex items-center gap-2"
            >
              Как это работает
              <ArrowDown className="h-4 w-4" />
            </a>
          </div>

          {/* Stats row */}
          <div className="animate-slide-up delay-400 mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {[
              { value: "199₽", label: "в день" },
              { value: "24/7", label: "поддержка" },
              { value: "1 час", label: "сборка" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">{s.value}</div>
                <div className="text-xs sm:text-sm text-zinc-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BENEFITS ═══ */}
      <section className="relative py-24 sm:py-32">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400 mb-3">Преимущества</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">Почему киберстанция</h2>
            <p className="mt-5 text-zinc-400 max-w-xl mx-auto text-lg">
              Это не просто кресло — это полноценная рабочая станция, которая меняет подход к работе
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="group relative rounded-3xl glass-card p-8 hover:scale-[1.02] transition-all duration-300"
              >
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${b.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative">
                  <div className={`rounded-2xl ${b.iconBg} p-4 w-fit mb-6`}>
                    <b.icon className={`h-7 w-7 ${b.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{b.title}</h3>
                  <p className="text-zinc-400 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[128px]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <p className="text-sm font-semibold uppercase tracking-widest text-violet-400 mb-3">Процесс</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">Как работает подписка</h2>
            <p className="mt-5 text-zinc-400 max-w-xl mx-auto text-lg">
              Как каршеринг, только на эргономичное рабочее место. 4 простых шага.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <div key={s.num} className="relative group">
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[calc(100%+1rem)] w-[calc(100%-2rem)] h-px">
                    <div className="w-full h-px bg-gradient-to-r from-zinc-700 to-transparent" />
                  </div>
                )}
                <div className="relative rounded-2xl glass-card p-6 hover:scale-[1.02] transition-all duration-300">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-white text-sm font-bold shrink-0">
                      {s.num}
                    </div>
                    <div className="rounded-xl bg-white/[0.04] p-2.5">
                      <s.icon className="h-5 w-5 text-zinc-400 group-hover:text-blue-400 transition-colors" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SOCIAL PROOF ═══ */}
      <section className="relative py-24 sm:py-32">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400 mb-3">Отзывы</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">Что говорят клиенты</h2>
            <p className="mt-5 text-zinc-400 max-w-xl mx-auto text-lg">
              Реальные отзывы людей, которые уже попробовали работать на киберстанции
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="group relative rounded-3xl glass-card p-8 hover:scale-[1.01] transition-all duration-300"
              >
                <Quote className="h-10 w-10 text-blue-500/10 mb-5" />
                <p className="text-zinc-300 leading-relaxed mb-6 text-[15px]">{t.text}</p>
                <div className="flex items-center gap-3 pt-5 border-t border-white/[0.06]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-white text-xs font-bold">
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-zinc-500">{t.role}</div>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[128px]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400 mb-3">Возможности</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">Продумано до деталей</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="group text-center rounded-3xl glass-card p-10 hover:scale-[1.02] transition-all duration-300">
                <div className="text-4xl font-black text-gradient-blue mb-2">{f.stat}</div>
                <div className="text-xs uppercase tracking-wider text-zinc-500 mb-6">{f.statLabel}</div>
                <div className="rounded-2xl bg-white/[0.03] p-3 w-fit mx-auto mb-5">
                  <f.icon className="h-6 w-6 text-zinc-400 group-hover:text-cyan-400 transition-colors" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DELIVERY ═══ */}
      <section className="relative py-24 sm:py-32">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400 mb-3">Доставка</p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 tracking-tight">
                Бережная доставка на электромобиле
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-8 text-lg">
                Собственная логистика на уникальном электромобиле KANGAROO ELECTRO.
                Привозим, собираем, настраиваем — всё включено в один визит.
              </p>
              <div className="space-y-5">
                {[
                  { icon: Leaf, title: "Экологичная доставка", desc: "Электромобиль — тихо, чисто, без выхлопов", color: "text-emerald-400", bg: "bg-emerald-500/10" },
                  { icon: Shield, title: "Бережная транспортировка", desc: "Специально оборудованный кузов для перевозки станций", color: "text-blue-400", bg: "bg-blue-500/10" },
                  { icon: Truck, title: "Сборка на месте", desc: "Установка, настройка и демонстрация всех функций", color: "text-violet-400", bg: "bg-violet-500/10" },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className={`rounded-xl ${item.bg} p-3 shrink-0`}>
                      <item.icon className={`h-5 w-5 ${item.color}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{item.title}</h4>
                      <p className="text-sm text-zinc-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-cyan-600/10 rounded-3xl blur-2xl" />
              <div className="relative rounded-3xl glass-card p-12 flex flex-col items-center justify-center aspect-[4/3]">
                <div className="rounded-3xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 p-8 mb-6">
                  <Truck className="h-20 w-20 text-emerald-400" />
                </div>
                <p className="text-2xl font-bold">KANGAROO ELECTRO</p>
                <p className="text-sm text-zinc-500 mt-2 text-center">Собственный электромобиль для бережной доставки станций</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CONFIGURATIONS ═══ */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute right-0 bottom-0 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[128px]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-violet-400 mb-3">Конфигурации</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">Любая конфигурация под ваши задачи</h2>
            <p className="mt-5 text-zinc-400 max-w-2xl mx-auto text-lg">
              Подберём идеальный комплект кронштейнов. При специфичных запросах можем привезти несколько
              вариантов и на месте выбрать самый удобный — бесплатно.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { monitors: "1 монитор", size: "до 34\"", extra: "Для фокусной работы", popular: false },
              { monitors: "2 монитора", size: "до 27\"", extra: "Для разработки и дизайна", popular: true },
              { monitors: "3 монитора", size: "до 27\"", extra: "Для трейдинга и мультитаска", popular: false },
              { monitors: "1 монитор + ноутбук", size: "кронштейн для ноутбука", extra: "Гибридный формат", popular: false },
              { monitors: "2 монитора + ноутбук", size: "полный сетап", extra: "Максимум экранов", popular: false },
              { monitors: "Ваша конфигурация", size: "любой обвес", extra: "Вертикальный монитор, планшет и т.д.", popular: false },
            ].map((c, i) => (
              <div
                key={i}
                className={`group relative rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] ${
                  c.popular
                    ? "glass-card gradient-border"
                    : "glass-card"
                }`}
              >
                {c.popular && (
                  <span className="inline-flex items-center rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-xs font-medium text-blue-400 mb-3">
                    Популярная
                  </span>
                )}
                <h4 className="font-bold text-lg">{c.monitors}</h4>
                <p className="text-sm text-zinc-400 mt-1.5">{c.size}</p>
                <p className="text-xs text-zinc-600 mt-2">{c.extra}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ STATIONS ═══ */}
      <section id="stations" className="relative py-24 sm:py-32">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400 mb-3">Каталог</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">Доступные станции</h2>
            <p className="mt-5 text-zinc-400 max-w-xl mx-auto text-lg">
              Актуальные данные в реальном времени. Выберите станцию и забронируйте прямо сейчас.
            </p>
          </div>
          <StationsSection
            onSelect={(id, name) => setSelectedStation({ id, name })}
          />
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/5 rounded-full blur-[128px]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-400 mb-3">Тарифы</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">Стоимость аренды</h2>
            <p className="mt-5 text-zinc-400 max-w-xl mx-auto text-lg">
              Чем дольше — тем выгоднее. Доставка и сборка оплачиваются разово.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PRICING_RENT.map((p) => (
              <div
                key={p.period}
                className={`group relative rounded-3xl p-7 transition-all duration-300 hover:scale-[1.02] ${
                  p.highlight
                    ? "glass-card gradient-border ring-1 ring-blue-500/20"
                    : "glass-card"
                }`}
              >
                {p.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-semibold text-white whitespace-nowrap ${
                    p.highlight
                      ? "bg-gradient-to-r from-blue-600 to-violet-600 shadow-lg shadow-blue-600/20"
                      : "bg-zinc-700"
                  }`}>
                    {p.badge}
                  </div>
                )}
                <div className="text-sm text-zinc-500 mb-2 font-medium">{p.period}</div>
                <div className="text-3xl font-bold mb-0.5 tracking-tight">
                  {p.price} <span className="text-base font-normal text-zinc-500">₽/мес</span>
                </div>
                <div className={`text-lg font-bold mb-4 ${p.highlight ? "text-gradient-blue" : "text-blue-400"}`}>
                  {p.daily} ₽/день
                </div>
                <div className="pt-4 border-t border-white/[0.06]">
                  <div className="text-sm text-zinc-500">{p.total} ₽</div>
                  <div className="text-xs text-zinc-600 mt-1">{p.note}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 rounded-3xl glass-card p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1 w-8 rounded-full bg-gradient-to-r from-blue-500 to-violet-500" />
              <h3 className="text-xl font-bold">Стоимость покупки</h3>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 text-sm">
              {[
                { val: "239 990 ₽", label: "Базовая станция", highlight: false },
                { val: "+ 15 000 ₽", label: "Замшевая обшивка", highlight: false },
                { val: "+ 15–55 тыс ₽", label: "Кронштейны и обвес", highlight: false },
                { val: "260–300 тыс ₽", label: "Полный комплект", highlight: true },
              ].map((item) => (
                <div key={item.label}>
                  <div className={`text-2xl font-bold ${item.highlight ? "text-gradient-blue" : "text-white"}`}>{item.val}</div>
                  <div className="text-zinc-500 mt-1">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ WHY RENT ═══ */}
      <section className="relative py-24 sm:py-32">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400 mb-3">Сравнение</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">Почему аренда — это выгодно</h2>
            <p className="mt-5 text-zinc-400 max-w-xl mx-auto text-lg">
              Тест-драйв вместо покупки вслепую. Убедитесь, что станция подходит именно вам.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl glass-card p-8 sm:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-2 w-2 rounded-full bg-red-400" />
                <h3 className="text-xl font-bold text-zinc-400">Покупка сразу</h3>
              </div>
              <ul className="space-y-4 text-sm text-zinc-500">
                {[
                  "260 000 – 300 000 ₽ сразу",
                  "Не понятно, подойдёт ли именно вам",
                  "Самостоятельная доставка и сборка",
                  "Сложно продать если не подошло",
                ].map((txt) => (
                  <li key={txt} className="flex items-start gap-3">
                    <XCircleIcon className="h-5 w-5 text-red-400/40 shrink-0 mt-0.5" />
                    {txt}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl glass-card gradient-border p-8 sm:p-10 ring-1 ring-blue-500/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                <h3 className="text-xl font-bold">Аренда в ERGOSET</h3>
              </div>
              <ul className="space-y-4 text-sm text-zinc-300">
                {[
                  "От 12 000 ₽/мес — полноценный тест-драйв",
                  "Попробуете в деле на длительной дистанции",
                  "Доставка, сборка и настройка включены",
                  "Можно выкупить со скидкой или вернуть",
                  "Чем дольше — тем дешевле (от 199 ₽/день)",
                ].map((txt) => (
                  <li key={txt} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                    {txt}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SPECS ═══ */}
      <section id="specs" className="relative py-24 sm:py-32">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500 mb-3">Спецификации</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">Технические характеристики</h2>
          </div>
          <div className="max-w-2xl mx-auto rounded-3xl glass-card overflow-hidden">
            {SPECS.map((s, i) => (
              <div
                key={s.label}
                className={`flex justify-between items-center px-8 py-5 ${i !== SPECS.length - 1 ? "border-b border-white/[0.04]" : ""} hover:bg-white/[0.02] transition-colors`}
              >
                <span className="text-zinc-500 text-sm">{s.label}</span>
                <span className="font-medium text-right text-sm">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BOOKING FORM ═══ */}
      <section id="booking" className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[128px]" />
          <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[128px]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400 mb-3">Бронирование</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">Забронировать станцию</h2>
            <p className="mt-5 text-zinc-400 max-w-xl mx-auto text-lg">
              Оставьте заявку — мы свяжемся для уточнения деталей и подберём идеальную конфигурацию
            </p>
          </div>
          <BookingForm
            selectedStationId={selectedStation?.id}
            selectedStationName={selectedStation?.name}
          />
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section id="faq" className="relative py-24 sm:py-32">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500 mb-3">F.A.Q.</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">Частые вопросы</h2>
          </div>
          <div className="max-w-2xl mx-auto space-y-3">
            {FAQ.map((item, i) => (
              <div
                key={i}
                className="rounded-2xl glass-card overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left group"
                >
                  <span className="font-medium pr-4 text-[15px] group-hover:text-white transition-colors">{item.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-zinc-500 shrink-0 transition-all duration-300 ${openFaq === i ? "rotate-180 text-blue-400" : ""}`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaq === i ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-6 pb-5 text-sm text-zinc-400 leading-relaxed">
                    {item.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-600/10 to-violet-600/10 rounded-full blur-[128px]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-6xl font-bold mb-6 tracking-tight">Давайте пробовать?</h2>
          <p className="text-zinc-400 mb-10 max-w-xl mx-auto text-lg">
            Убедитесь сами, что эргономичная станция — это то, что нужно для комфортной и продуктивной работы
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <a
              href="#booking"
              className="group rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-10 py-4 text-base font-semibold text-white shadow-2xl shadow-blue-600/20 hover:shadow-blue-600/30 hover:brightness-110 transition-all duration-300 flex items-center gap-2"
            >
              Забронировать станцию
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-zinc-500">
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-400" /> от 199 ₽/день</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-400" /> Доставка и сборка</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-400" /> Минимум 2 месяца</span>
          </div>
        </div>
      </section>
    </>
  );
}
