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
} from "lucide-react";
import { StationsSection } from "./stations-section";
import { BookingForm } from "./booking-form";

const BENEFITS = [
  {
    icon: Heart,
    title: "Идеальная анатомия",
    desc: "Анатомически правильная форма и умеренная жёсткость позволяют расслаблять мышцы спины. Забудьте о болях в спине и шее.",
  },
  {
    icon: Zap,
    title: "Выше продуктивность",
    desc: "Полулёжа концентрация вырастает — эффект кокона позволяет работать большими слотами без усталости.",
  },
  {
    icon: Sparkles,
    title: "Новые ощущения",
    desc: "Получите опыт, который не имеет аналогов. Станция вызывает привыкание к хорошему — это тест-драйв будущего.",
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
  },
  {
    icon: Eye,
    title: "Экран там где нужно",
    desc: "Всегда на одном расстоянии от глаз, что обеспечивает комфорт при любом положении.",
  },
  {
    icon: Monitor,
    title: "До 3 мониторов",
    desc: "Плюс дополнительный кронштейн для ноутбука, планшета или вертикального монитора.",
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
  },
  {
    period: "3 месяца",
    price: "10 470",
    daily: "349",
    total: "31 410",
    note: "Экономия 15%",
    highlight: true,
  },
  {
    period: "3–6 мес.",
    price: "8 790",
    daily: "293",
    total: "Помесячно",
    note: "Продление в этом периоде",
    highlight: false,
  },
  {
    period: "7+ мес.",
    price: "5 999",
    daily: "199",
    total: "Помесячно",
    note: "Максимальная выгода",
    highlight: true,
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

export function LandingClient() {
  const [selectedStation, setSelectedStation] = useState<{ id: string; name: string } | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden py-24 sm:py-32 lg:py-40">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-4 py-1.5 text-sm text-blue-400 mb-8">
            <Sparkles className="h-4 w-4" />
            Тест-драйв будущего рабочего места
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
            Подписка на{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              киберстанции
            </span>
            <br />
            e-station
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Эргономичные рабочие станции с полным циклом обслуживания.
            Работайте или играйте с максимальным комфортом{" "}
            <span className="text-white font-semibold">от 199 ₽/день</span>
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#booking"
              className="rounded-xl bg-blue-600 px-8 py-3.5 text-base font-semibold text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20"
            >
              Забронировать станцию
            </a>
            <a
              href="#how-it-works"
              className="rounded-xl border border-zinc-700 px-8 py-3.5 text-base font-medium text-zinc-300 hover:bg-zinc-800 transition-colors flex items-center gap-2"
            >
              Как это работает
              <ArrowDown className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ═══ BENEFITS ═══ */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">Почему киберстанция</h2>
            <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
              Это не просто кресло — это полноценная рабочая станция, которая меняет подход к работе
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 hover:border-zinc-700 transition-colors"
              >
                <div className="rounded-xl bg-blue-500/10 p-3 w-fit mb-5">
                  <b.icon className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{b.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" className="py-20 sm:py-28 bg-zinc-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">Как работает подписка</h2>
            <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
              Как каршеринг, только на эргономичное рабочее место. 4 простых шага.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.num} className="relative">
                <div className="text-5xl font-extrabold text-zinc-800 mb-4">{s.num}</div>
                <div className="rounded-xl bg-blue-500/10 p-3 w-fit mb-4">
                  <s.icon className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SOCIAL PROOF ═══ */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">Что говорят клиенты</h2>
            <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
              Реальные отзывы людей, которые уже попробовали работать на киберстанции
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Алексей, разработчик",
                text: "Работаю по 10 часов в день — спина больше не болит. За 2 месяца полностью привык и не хочу возвращаться на обычное кресло.",
                stars: 5,
              },
              {
                name: "Мария, дизайнер",
                text: "Сначала боялась, что будет непривычно. Через неделю поняла — это совершенно другой уровень комфорта. 3 монитора идеально встали.",
                stars: 5,
              },
              {
                name: "Дмитрий, геймер",
                text: "Взял на 2 месяца попробовать, сейчас на 8-м. Играть полулёжа — это нечто. Доставили и собрали за час, всё чётко.",
                stars: 5,
              },
            ].map((t, i) => (
              <div
                key={i}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6"
              >
                <Quote className="h-8 w-8 text-blue-500/30 mb-4" />
                <p className="text-zinc-300 leading-relaxed mb-4">{t.text}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-400">{t.name}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="py-20 sm:py-28 bg-zinc-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="text-center p-8">
                <div className="rounded-xl bg-blue-500/10 p-3 w-fit mx-auto mb-5">
                  <f.icon className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DELIVERY ═══ */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Бережная доставка на электромобиле
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-6">
                Собственная логистика на уникальном электромобиле KANGAROO ELECTRO.
                Привозим, собираем, настраиваем — всё включено в один визит.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-emerald-500/10 p-2 mt-0.5">
                    <Leaf className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Экологичная доставка</h4>
                    <p className="text-sm text-zinc-400">Электромобиль — тихо, чисто, без выхлопов</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-blue-500/10 p-2 mt-0.5">
                    <Shield className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Бережная транспортировка</h4>
                    <p className="text-sm text-zinc-400">Специально оборудованный кузов для перевозки станций</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-purple-500/10 p-2 mt-0.5">
                    <Truck className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Сборка на месте</h4>
                    <p className="text-sm text-zinc-400">Установка, настройка и демонстрация всех функций</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl border border-zinc-800 bg-zinc-900/50 flex items-center justify-center">
                <div className="text-center p-8">
                  <Truck className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                  <p className="text-xl font-bold">KANGAROO ELECTRO</p>
                  <p className="text-sm text-zinc-400 mt-2">Собственный электромобиль для доставки станций</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CONFIGURATIONS ═══ */}
      <section className="py-20 sm:py-28 bg-zinc-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">Любая конфигурация под ваши задачи</h2>
            <p className="mt-4 text-zinc-400 max-w-2xl mx-auto">
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
                className={`rounded-xl border p-5 ${
                  c.popular
                    ? "border-blue-500/50 bg-blue-500/5"
                    : "border-zinc-800 bg-zinc-900/50"
                }`}
              >
                {c.popular && (
                  <span className="text-xs font-medium text-blue-400 mb-2 block">Популярная</span>
                )}
                <h4 className="font-semibold text-lg">{c.monitors}</h4>
                <p className="text-sm text-zinc-400 mt-1">{c.size}</p>
                <p className="text-xs text-zinc-500 mt-2">{c.extra}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ STATIONS ═══ */}
      <section id="stations" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">Доступные станции</h2>
            <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
              Актуальные данные в реальном времени. Выберите станцию и забронируйте прямо сейчас.
            </p>
          </div>
          <StationsSection
            onSelect={(id, name) => setSelectedStation({ id, name })}
          />
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">Стоимость аренды</h2>
            <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
              Чем дольше — тем выгоднее. Доставка и сборка оплачиваются разово.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PRICING_RENT.map((p) => (
              <div
                key={p.period}
                className={`rounded-2xl border p-6 relative ${
                  p.highlight
                    ? "border-blue-500/50 bg-blue-500/5"
                    : "border-zinc-800 bg-zinc-900/50"
                }`}
              >
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-0.5 text-xs font-medium text-white">
                    Выгодно
                  </div>
                )}
                <div className="text-sm text-zinc-400 mb-1">{p.period}</div>
                <div className="text-3xl font-bold mb-1">
                  {p.price} <span className="text-lg font-normal text-zinc-400">₽/мес</span>
                </div>
                <div className="text-lg font-semibold text-blue-400 mb-3">
                  {p.daily} ₽/день
                </div>
                <div className="text-sm text-zinc-500">{p.total} ₽</div>
                <div className="text-xs text-zinc-500 mt-1">{p.note}</div>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
            <h3 className="text-xl font-bold mb-4">Стоимость покупки</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
              <div>
                <div className="text-2xl font-bold">239 990 ₽</div>
                <div className="text-zinc-400">Базовая станция</div>
              </div>
              <div>
                <div className="text-2xl font-bold">+ 15 000 ₽</div>
                <div className="text-zinc-400">Замшевая обшивка</div>
              </div>
              <div>
                <div className="text-2xl font-bold">+ 15–55 тыс ₽</div>
                <div className="text-zinc-400">Кронштейны и обвес</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">260–300 тыс ₽</div>
                <div className="text-zinc-400">Полный комплект</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ WHY RENT ═══ */}
      <section className="py-20 sm:py-28 bg-zinc-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">Почему аренда — это выгодно</h2>
            <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
              Тест-драйв вместо покупки вслепую. Убедитесь, что станция подходит именно вам.
            </p>
          </div>
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
              <h3 className="text-xl font-bold mb-4 text-red-400">Покупка сразу</h3>
              <ul className="space-y-3 text-sm text-zinc-400">
                <li className="flex items-start gap-2">
                  <XCircleIcon className="h-5 w-5 text-red-400/60 shrink-0 mt-0.5" />
                  260 000 – 300 000 ₽ сразу
                </li>
                <li className="flex items-start gap-2">
                  <XCircleIcon className="h-5 w-5 text-red-400/60 shrink-0 mt-0.5" />
                  Не понятно, подойдёт ли именно вам
                </li>
                <li className="flex items-start gap-2">
                  <XCircleIcon className="h-5 w-5 text-red-400/60 shrink-0 mt-0.5" />
                  Самостоятельная доставка и сборка
                </li>
                <li className="flex items-start gap-2">
                  <XCircleIcon className="h-5 w-5 text-red-400/60 shrink-0 mt-0.5" />
                  Сложно продать если не подошло
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-8">
              <h3 className="text-xl font-bold mb-4 text-blue-400">Аренда в ERGOSET</h3>
              <ul className="space-y-3 text-sm text-zinc-300">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  От 12 000 ₽/мес — полноценный тест-драйв
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  Попробуете в деле на длительной дистанции
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  Доставка, сборка и настройка включены
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  Можно выкупить со скидкой или вернуть
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  Чем дольше — тем дешевле (от 199 ₽/день)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SPECS ═══ */}
      <section id="specs" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">Технические характеристики</h2>
          </div>
          <div className="max-w-2xl mx-auto rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            {SPECS.map((s, i) => (
              <div
                key={s.label}
                className={`flex justify-between px-6 py-4 ${i !== SPECS.length - 1 ? "border-b border-zinc-800" : ""}`}
              >
                <span className="text-zinc-400">{s.label}</span>
                <span className="font-medium text-right">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BOOKING FORM ═══ */}
      <section id="booking" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">Забронировать станцию</h2>
            <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
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
      <section id="faq" className="py-20 sm:py-28 bg-zinc-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">Частые вопросы</h2>
          </div>
          <div className="max-w-2xl mx-auto space-y-3">
            {FAQ.map((item, i) => (
              <div
                key={i}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <span className="font-medium pr-4">{item.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-zinc-400 shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-sm text-zinc-400 leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Давайте пробовать?</h2>
          <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
            Убедитесь сами, что эргономичная станция — это то, что нужно для комфортной и продуктивной работы
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#booking"
              className="rounded-xl bg-blue-600 px-8 py-3.5 text-base font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              Забронировать станцию
            </a>
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Check className="h-4 w-4 text-emerald-400" />
              от 199 ₽/день
              <Check className="h-4 w-4 text-emerald-400 ml-2" />
              Доставка и сборка
              <Check className="h-4 w-4 text-emerald-400 ml-2" />
              Минимум 2 месяца
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
