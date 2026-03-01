"use client";

import { useState } from "react";
import Image from "next/image";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { StationsSection } from "./stations-section";
import { BookingForm } from "./booking-form";

const CDN = "https://static.tildacdn.com";

const HERO_IMAGES = [
  `${CDN}/tild3730-3336-4766-b631-383533323736/Group_38.png`,
  `${CDN}/tild3634-3935-4934-b837-303263383439/Group_89.png`,
];

const PRODUCT_IMAGES = [
  `${CDN}/tild3133-6437-4136-b831-363836353061/image_33.png`,
  `${CDN}/tild3261-3432-4831-a639-303234623238/image_32.png`,
  `${CDN}/tild6436-6638-4433-b462-616632653635/image_31.png`,
  `${CDN}/tild6437-3463-4262-a264-616633343536/image_34.png`,
  `${CDN}/tild3832-3666-4165-b937-316363356237/image_35.png`,
  `${CDN}/tild3564-6632-4137-b263-623437666137/image_36.png`,
  `${CDN}/tild3365-6261-4235-b130-343665393763/image_37.png`,
  `${CDN}/tild3331-3465-4731-b137-373562323333/image_38.png`,
];

const CLIENT_PHOTOS = [
  `${CDN}/tild3033-6562-4432-b763-323163653362/IMG_1958.JPG`,
  `${CDN}/tild3062-3164-4466-b230-333634623339/IMG_6277.JPG`,
  `${CDN}/tild3262-3966-4734-a333-336230353365/IMG_1922.JPG`,
  `${CDN}/tild3333-3236-4262-a137-646332653736/IMG_0290.JPG`,
  `${CDN}/tild3563-6230-4139-b465-396637343263/IMG_1923.JPG`,
  `${CDN}/tild3833-3564-4061-a539-323936396562/IMG_0296.JPG`,
  `${CDN}/tild3964-3031-4866-a235-373932376337/IMG_2521.JPG`,
  `${CDN}/tild6135-3339-4365-a335-346239633363/IMG_6146.JPG`,
  `${CDN}/tild6366-3437-4633-a663-383964323961/IMG_1962.JPG`,
  `${CDN}/tild6532-3235-4632-b763-643265633962/IMG_2520.JPG`,
  `${CDN}/tild6539-3365-4661-b162-396333366362/IMG_1955.JPG`,
  `${CDN}/tild6639-6465-4163-b032-366536363439/IMG_6142.JPG`,
];

const DELIVERY_IMG = `${CDN}/tild3332-3466-4831-a663-343535356132/2025-11-04_09-24-17.png`;
const DELIVERY_PHOTO = `${CDN}/tild3566-3334-4939-b230-323031383864/PHOTO-2025-02-25-12-.jpg`;

const CONFIG_PHOTOS = [
  `${CDN}/tild3632-3339-4334-b739-613830646565/2025-10-31_16-57-03.png`,
  `${CDN}/tild6163-3234-4132-b965-303166646665/47b5c366-418c-4934-9.jpg`,
  `${CDN}/tild6566-3738-4331-a237-333639633861/bcba0971-f4fa-418c-a.jpg`,
];

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
  { icon: ClipboardList, num: "01", title: "Определяемся с конфигурацией", desc: "Сообщаете количество мониторов и оборудования — подбираем самый удобный комплект кронштейнов." },
  { icon: FileSignature, num: "02", title: "Договор и оплата", desc: "Делаем бронь, подписываем договор онлайн и ставим в календарь доставку." },
  { icon: Truck, num: "03", title: "Доставка и сборка", desc: "В согласованный день привозим станцию, устанавливаем и настраиваем у вас на адресе." },
  { icon: Smile, num: "04", title: "Наслаждаетесь", desc: "Тестируете в полной мере на длительной дистанции. Счастливые и здоровые работаете или играете." },
];

const FEATURES = [
  { icon: RotateCcw, title: "Меняйте положение", desc: "От обычного сидя до полностью горизонтального — когда вам это нужно.", stat: "180°", statLabel: "диапазон" },
  { icon: Eye, title: "Экран там где нужно", desc: "Всегда на одном расстоянии от глаз, что обеспечивает комфорт при любом положении.", stat: "≡", statLabel: "идеальная дистанция" },
  { icon: Monitor, title: "До 3 мониторов", desc: "Плюс дополнительный кронштейн для ноутбука, планшета или вертикального монитора.", stat: "3+1", statLabel: "экранов" },
];

const PRICING_RENT = [
  { period: "2 месяца", price: "12 000", daily: "399", total: "24 000", note: "Минимальный срок аренды", highlight: false, badge: null },
  { period: "3 месяца", price: "10 470", daily: "349", total: "31 410", note: "Экономия 15%", highlight: false, badge: "Популярно" },
  { period: "3–6 мес.", price: "8 790", daily: "293", total: "Помесячно", note: "Продление в этом периоде", highlight: false, badge: null },
  { period: "7+ мес.", price: "5 999", daily: "199", total: "Помесячно", note: "Максимальная выгода", highlight: true, badge: "Лучшая цена" },
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
  { q: "Какой минимальный срок аренды?", a: "Минимальный срок — 2 месяца. Это позволяет вам полноценно протестировать станцию и привыкнуть к работе в эргономичном положении." },
  { q: "Что входит в стоимость аренды?", a: "Станция с выбранной конфигурацией кронштейнов. Доставка и сборка оплачиваются дополнительно разово. Мониторы и компьютеры не входят." },
  { q: "Можно ли выкупить станцию после аренды?", a: "Да! Мы предлагаем программу аренды с выкупом. Часть арендных платежей может быть зачтена при покупке." },
  { q: "Как проходит доставка и сборка?", a: "Собственная бережная доставка на электромобиле. Привозим, собираем, настраиваем, показываем как пользоваться — всё за один визит." },
  { q: "Подберёте кронштейны под мои мониторы?", a: "Да, подберём идеальный комплект. При специфичных запросах можем привезти несколько вариантов и на месте выбрать самый удобный — бесплатно." },
  { q: "Что если станция мне не подошла?", a: "Минимальный срок аренды — 2 месяца. По истечении вы можете вернуть станцию. Мы заберём и разберём всё сами." },
];

const TESTIMONIALS = [
  { name: "Алексей", role: "Разработчик", text: "Работаю по 10 часов в день — спина больше не болит. За 2 месяца полностью привык и не хочу возвращаться на обычное кресло.", stars: 5, initials: "АЛ" },
  { name: "Мария", role: "Дизайнер", text: "Сначала боялась, что будет непривычно. Через неделю поняла — это совершенно другой уровень комфорта. 3 монитора идеально встали.", stars: 5, initials: "МА" },
  { name: "Дмитрий", role: "Геймер", text: "Взял на 2 месяца попробовать, сейчас на 8-м. Играть полулёжа — это нечто. Доставили и собрали за час, всё чётко.", stars: 5, initials: "ДМ" },
];

function ImageGallery({ images, className = "" }: { images: string[]; className?: string }) {
  const [idx, setIdx] = useState(0);
  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setIdx((i) => (i + 1) % images.length);

  return (
    <div className={`relative group ${className}`}>
      <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-zinc-900">
        <Image
          src={images[idx]}
          alt="e-station"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={idx === 0}
        />
      </div>
      {images.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80">
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? "w-6 bg-[#ACFF27]" : "w-1.5 bg-white/40"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function LandingClient() {
  const [selectedStation, setSelectedStation] = useState<{ id: string; name: string } | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [photoPage, setPhotoPage] = useState(0);
  const photosPerPage = 6;
  const visiblePhotos = CLIENT_PHOTOS.slice(photoPage * photosPerPage, (photoPage + 1) * photosPerPage);

  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#ACFF27]/[0.04] rounded-full blur-[128px] animate-float" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#ACFF27]/[0.03] rounded-full blur-[128px] animate-float-delayed" />
          <div className="absolute inset-0 grid-pattern" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div className="animate-slide-up">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#ACFF27]/20 bg-[#ACFF27]/[0.06] px-5 py-2 text-sm text-[#ACFF27] mb-8 backdrop-blur-sm">
                  <Sparkles className="h-4 w-4" />
                  <span>Подписка на рабочие места будущего</span>
                </div>
              </div>

              <h1 className="animate-slide-up delay-100 text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]">
                Киберстанции
                <br />
                <span className="text-gradient-brand">e-station</span>
                <br />
                <span className="text-zinc-500">по подписке</span>
              </h1>

              <p className="animate-slide-up delay-200 mt-6 text-lg text-zinc-400 max-w-lg leading-relaxed">
                Эргономичные рабочие станции с полным циклом обслуживания.
                Работайте или играйте с максимальным комфортом{" "}
                <span className="text-white font-semibold">от 199 ₽/день</span>
              </p>

              <div className="animate-slide-up delay-300 mt-10 flex flex-col sm:flex-row items-start gap-4">
                <a
                  href="#booking"
                  className="group rounded-2xl bg-[#ACFF27] px-8 py-4 text-base font-bold text-black hover:bg-[#c4ff5c] transition-all duration-300 flex items-center gap-2 shadow-2xl shadow-[#ACFF27]/20"
                >
                  Забронировать
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

              <div className="animate-slide-up delay-400 mt-14 grid grid-cols-3 gap-6 max-w-sm">
                {[
                  { value: "199₽", label: "в день" },
                  { value: "24/7", label: "поддержка" },
                  { value: "1 час", label: "сборка" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="text-2xl font-bold text-white">{s.value}</div>
                    <div className="text-xs text-zinc-500 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="animate-fade-in delay-200">
              <ImageGallery images={HERO_IMAGES} />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PRODUCT GALLERY ═══ */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#ACFF27] mb-3">Галерея</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">Конфигурации станций</h2>
            <p className="mt-5 text-zinc-400 max-w-xl mx-auto text-lg">
              Доступны самые разнообразные конфигурации — подберём именно то, что вам нужно
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PRODUCT_IMAGES.map((src, i) => (
              <div key={i} className="group relative aspect-square rounded-2xl overflow-hidden bg-zinc-900">
                <Image
                  src={src}
                  alt={`Конфигурация станции ${i + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BENEFITS ═══ */}
      <section className="relative py-24 sm:py-32">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#ACFF27] mb-3">Преимущества</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">Почему киберстанция</h2>
            <p className="mt-5 text-zinc-400 max-w-xl mx-auto text-lg">
              Это не просто кресло — это полноценная рабочая станция, которая меняет подход к работе
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {BENEFITS.map((b) => (
              <div key={b.title} className="group relative rounded-3xl glass-card p-8 hover:scale-[1.02] transition-all duration-300">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#ACFF27]/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="rounded-2xl bg-[#ACFF27]/[0.08] p-4 w-fit mb-6">
                    <b.icon className="h-7 w-7 text-[#ACFF27]" />
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
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#ACFF27]/[0.03] rounded-full blur-[128px]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#ACFF27] mb-3">Процесс</p>
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
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ACFF27] text-black text-sm font-bold shrink-0">
                      {s.num}
                    </div>
                    <div className="rounded-xl bg-white/[0.04] p-2.5">
                      <s.icon className="h-5 w-5 text-zinc-400 group-hover:text-[#ACFF27] transition-colors" />
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

      {/* ═══ FEATURES with real images ═══ */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#ACFF27] mb-3">Возможности</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">Продумано до деталей</h2>
          </div>
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <ImageGallery images={CONFIG_PHOTOS} />
            </div>
            <div className="space-y-8">
              {FEATURES.map((f) => (
                <div key={f.title} className="group flex gap-5">
                  <div className="shrink-0">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ACFF27]/[0.08] group-hover:bg-[#ACFF27]/[0.12] transition-colors">
                      <f.icon className="h-6 w-6 text-[#ACFF27]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-3 mb-1">
                      <h3 className="text-lg font-bold">{f.title}</h3>
                      <span className="text-sm font-bold text-[#ACFF27]">{f.stat}</span>
                    </div>
                    <p className="text-zinc-400 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CLIENT PHOTOS ═══ */}
      <section className="relative py-24 sm:py-32">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#ACFF27] mb-3">Реальные сетапы</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">Фото от довольных клиентов</h2>
            <p className="mt-5 text-zinc-400 max-w-xl mx-auto text-lg">
              Реальные рабочие места наших клиентов — от разработчиков до геймеров
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {visiblePhotos.map((src, i) => (
              <div key={`${photoPage}-${i}`} className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-900">
                <Image
                  src={src}
                  alt={`Сетап клиента ${photoPage * photosPerPage + i + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
          {CLIENT_PHOTOS.length > photosPerPage && (
            <div className="flex justify-center gap-3 mt-8">
              <button
                onClick={() => setPhotoPage((p) => Math.max(0, p - 1))}
                disabled={photoPage === 0}
                className="flex h-10 w-10 items-center justify-center rounded-full glass-card text-zinc-400 hover:text-white disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setPhotoPage((p) => Math.min(Math.ceil(CLIENT_PHOTOS.length / photosPerPage) - 1, p + 1))}
                disabled={(photoPage + 1) * photosPerPage >= CLIENT_PHOTOS.length}
                className="flex h-10 w-10 items-center justify-center rounded-full glass-card text-zinc-400 hover:text-white disabled:opacity-30 transition-all"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ═══ SOCIAL PROOF ═══ */}
      <section className="relative py-24 sm:py-32">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#ACFF27] mb-3">Отзывы</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">Что говорят клиенты</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="group relative rounded-3xl glass-card p-8 hover:scale-[1.01] transition-all duration-300">
                <Quote className="h-10 w-10 text-[#ACFF27]/10 mb-5" />
                <p className="text-zinc-300 leading-relaxed mb-6 text-[15px]">{t.text}</p>
                <div className="flex items-center gap-3 pt-5 border-t border-white/[0.06]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ACFF27] text-black text-xs font-bold">
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-zinc-500">{t.role}</div>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} className="h-3.5 w-3.5 fill-[#ACFF27] text-[#ACFF27]" />
                    ))}
                  </div>
                </div>
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
            <p className="text-sm font-semibold uppercase tracking-widest text-[#ACFF27] mb-3">Каталог</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">Доступные станции</h2>
            <p className="mt-5 text-zinc-400 max-w-xl mx-auto text-lg">
              Актуальные данные в реальном времени. Выберите станцию и забронируйте прямо сейчас.
            </p>
          </div>
          <StationsSection onSelect={(id, name) => setSelectedStation({ id, name })} />
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[800px] h-[400px] bg-[#ACFF27]/[0.03] rounded-full blur-[128px]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#ACFF27] mb-3">Тарифы</p>
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
                  p.highlight ? "glass-card gradient-border ring-1 ring-[#ACFF27]/20" : "glass-card"
                }`}
              >
                {p.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-semibold whitespace-nowrap ${
                    p.highlight ? "bg-[#ACFF27] text-black shadow-lg shadow-[#ACFF27]/20" : "bg-zinc-700 text-white"
                  }`}>
                    {p.badge}
                  </div>
                )}
                <div className="text-sm text-zinc-500 mb-2 font-medium">{p.period}</div>
                <div className="text-3xl font-bold mb-0.5 tracking-tight">
                  {p.price} <span className="text-base font-normal text-zinc-500">₽/мес</span>
                </div>
                <div className={`text-lg font-bold mb-4 ${p.highlight ? "text-[#ACFF27]" : "text-[#ACFF27]/70"}`}>
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
              <div className="h-1 w-8 rounded-full bg-[#ACFF27]" />
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
                  <div className={`text-2xl font-bold ${item.highlight ? "text-[#ACFF27]" : "text-white"}`}>{item.val}</div>
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
            <p className="text-sm font-semibold uppercase tracking-widest text-[#ACFF27] mb-3">Сравнение</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">Почему аренда — это выгодно</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl glass-card p-8 sm:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-2 w-2 rounded-full bg-red-400" />
                <h3 className="text-xl font-bold text-zinc-400">Покупка сразу</h3>
              </div>
              <ul className="space-y-4 text-sm text-zinc-500">
                {["260 000 – 300 000 ₽ сразу", "Не понятно, подойдёт ли именно вам", "Самостоятельная доставка и сборка", "Сложно продать если не подошло"].map((txt) => (
                  <li key={txt} className="flex items-start gap-3">
                    <XCircleIcon className="h-5 w-5 text-red-400/40 shrink-0 mt-0.5" />
                    {txt}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl glass-card gradient-border p-8 sm:p-10 ring-1 ring-[#ACFF27]/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-2 w-2 rounded-full bg-[#ACFF27]" />
                <h3 className="text-xl font-bold">Аренда в ERGOSET</h3>
              </div>
              <ul className="space-y-4 text-sm text-zinc-300">
                {["От 12 000 ₽/мес — полноценный тест-драйв", "Попробуете в деле на длительной дистанции", "Доставка, сборка и настройка включены", "Можно выкупить со скидкой или вернуть", "Чем дольше — тем дешевле (от 199 ₽/день)"].map((txt) => (
                  <li key={txt} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-[#ACFF27] shrink-0 mt-0.5" />
                    {txt}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ DELIVERY ═══ */}
      <section className="relative py-24 sm:py-32">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-[#ACFF27] mb-3">Доставка</p>
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
                  { icon: Shield, title: "Бережная транспортировка", desc: "Специально оборудованный кузов для перевозки станций", color: "text-[#ACFF27]", bg: "bg-[#ACFF27]/10" },
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
            <div className="space-y-4">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-zinc-900">
                <Image src={DELIVERY_IMG} alt="KANGAROO ELECTRO" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
              </div>
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-zinc-900">
                <Image src={DELIVERY_PHOTO} alt="Доставка станции" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
              </div>
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
              <div key={s.label} className={`flex justify-between items-center px-8 py-5 ${i !== SPECS.length - 1 ? "border-b border-white/[0.04]" : ""} hover:bg-white/[0.02] transition-colors`}>
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
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-[#ACFF27]/[0.03] rounded-full blur-[128px]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#ACFF27] mb-3">Бронирование</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">Забронировать станцию</h2>
            <p className="mt-5 text-zinc-400 max-w-xl mx-auto text-lg">
              Оставьте заявку — мы свяжемся для уточнения деталей и подберём идеальную конфигурацию
            </p>
          </div>
          <BookingForm selectedStationId={selectedStation?.id} selectedStationName={selectedStation?.name} />
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
              <div key={i} className="rounded-2xl glass-card overflow-hidden transition-all duration-200">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left group"
                >
                  <span className="font-medium pr-4 text-[15px] group-hover:text-white transition-colors">{item.q}</span>
                  <ChevronDown className={`h-5 w-5 text-zinc-500 shrink-0 transition-all duration-300 ${openFaq === i ? "rotate-180 text-[#ACFF27]" : ""}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
                  <div className="px-6 pb-5 text-sm text-zinc-400 leading-relaxed">{item.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ACFF27]/[0.05] rounded-full blur-[128px]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-6xl font-bold mb-6 tracking-tight">Давайте пробовать?</h2>
          <p className="text-zinc-400 mb-10 max-w-xl mx-auto text-lg">
            Убедитесь сами, что эргономичная станция — это то, что нужно для комфортной и продуктивной работы
          </p>
          <a
            href="#booking"
            className="group inline-flex items-center gap-2 rounded-2xl bg-[#ACFF27] px-10 py-4 text-base font-bold text-black hover:bg-[#c4ff5c] transition-all duration-300 shadow-2xl shadow-[#ACFF27]/20"
          >
            Забронировать станцию
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </a>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-zinc-500 mt-8">
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-[#ACFF27]" /> от 199 ₽/день</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-[#ACFF27]" /> Доставка и сборка</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-[#ACFF27]" /> Минимум 2 месяца</span>
          </div>
        </div>
      </section>
    </>
  );
}
