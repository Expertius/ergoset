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
  AlertTriangle,
  Award,
  MapPin,
  Clock,
  Wrench,
  ShieldCheck,
  GraduationCap,
  Timer,
  Package,
} from "lucide-react";
import { StationsSection } from "./stations-section";
import { BookingForm } from "./booking-form";

const CDN = "https://static.tildacdn.com";
const ES = "https://e-station.tech";

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

const POSITION_IMAGES = [
  `${ES}/local/templates/easyworkstation/dist/images/1.0944f910.webp`,
  `${ES}/local/templates/easyworkstation/dist/images/2.5c505854.webp`,
  `${ES}/local/templates/easyworkstation/dist/images/3.5d731755.webp`,
  `${ES}/local/templates/easyworkstation/dist/images/4.2aa215fb.webp`,
];

const SIZE_DIAGRAM = `${ES}/images/sizesStation.webp`;
const SIZE_DIAGRAM_2 = `${ES}/images/sizesStation1.webp`;

const POSITIONS = [
  {
    title: "Полулёжа",
    desc: "Основной рабочий режим. Ноги приподняты, спинка откинута. Нагрузка на позвоночник и кровоток максимально снижена. Для продуктивной сфокусированной работы и долгих конф-коллов.",
    badge: "Основной режим",
  },
  {
    title: "Лёжа (релакс)",
    desc: "Для потребления контента, игр с джойстиком, дневного восстанавливающего сна. Полное расслабление мышц и позвоночника.",
    badge: "Отдых",
  },
  {
    title: "Сидя",
    desc: "Традиционное положение. Если нужно обсудить вопросы с коллегой, подписать документы или просто соблюсти этикет.",
    badge: "Классика",
  },
];

const QUALITY_DETAILS = [
  { title: "Подголовник", desc: "Две подвижные части подстраиваются под изгибы тела, создавая правильную ортопедическую поддержку головы." },
  { title: "Подушечка под шею", desc: "Из вязкоэластичного ППУ с эффектом памяти. Расслабляет мышцы и уменьшает нагрузку на шейные позвонки." },
  { title: "Спинка кресла", desc: "Для снятия нагрузки и усталости. В комплекте подушечка под поясницу для дополнительной поддержки." },
  { title: "Сиденье", desc: "Имеет анатомическое углубление ближе к спинке и антискользящий выступ у основания." },
  { title: "Стол и подлокотники", desc: "Широкий алюминиевый стол, единая плоскость с подлокотниками. Мягкие вставки для предплечий снижают риск туннельного синдрома." },
  { title: "Поддержка для ног", desc: "Позволяет расслабить мышцы ног, восстановить кровообращение. Устраняет затекания, снижает риск отёков и варикоза." },
];

const TEST_RESULTS = [
  { value: "87%", label: "снижение боли в пояснице" },
  { value: "74%", label: "снижение боли в грудном отделе" },
  { value: "73%", label: "снижение боли в шейном отделе" },
  { value: "16%", label: "снижение индекса напряжения" },
];

const HEALTH_STATS = [
  { value: "10.4 ч", label: "Мы проводим сидя каждый день — работа, транспорт, ТВ, игры" },
  { value: "90%", label: "россиян имеют хронические заболевания позвоночника (ВОЗ)" },
  { value: "34", label: "хронических заболевания связаны с длительным сидением" },
  { value: "½", label: "трудоспособного населения РФ ежегодно берёт больничный из-за спины" },
];

const EXPERTS = [
  {
    name: "Шишонин А.Ю.",
    role: "Врач, вертебролог, реабилитолог",
    quote: "EasyWorkStation — это возможность работы лёжа, полулёжа. Атрофии мышц не возникнет. Станция избавит мышцы от плохого кровообращения, от утомления. Позволяет сохранить здоровье.",
    initials: "ША",
  },
  {
    name: "Эни-Олорунда В.С.",
    role: "Врач, вертебролог, реабилитолог",
    quote: "Станция исключает вред от сидячего положения и превращает рабочий процесс в комфортный лечебный отдых. Тело находится в максимально правильном и анатомичном положении.",
    initials: "ЭВ",
  },
  {
    name: "Агентство инноваций Москвы",
    role: "Пилотное тестирование, Технопарк «Строгино»",
    quote: "10 человек тестировали станцию 2 недели со специальными измерительными приборами. Уровень боли упал в среднем на 87% в поясничном отделе. Инновационность продукта подтверждена.",
    initials: "АИ",
  },
];

const BENEFITS = [
  { icon: Heart, title: "Идеальная анатомия", desc: "Анатомически правильная форма и умеренная жёсткость позволяют расслаблять мышцы спины. Забудьте о болях в спине и шее." },
  { icon: Zap, title: "Выше продуктивность", desc: "Полулёжа концентрация вырастает — эффект кокона позволяет работать большими слотами без усталости." },
  { icon: Sparkles, title: "Новые ощущения", desc: "Получите опыт, который не имеет аналогов. Станция вызывает привыкание к хорошему — это тест-драйв будущего." },
];

const STEPS = [
  { icon: ClipboardList, num: "01", title: "Определяемся с конфигурацией", desc: "Сообщаете количество мониторов и оборудования — подбираем самый удобный комплект кронштейнов." },
  { icon: FileSignature, num: "02", title: "Договор и оплата", desc: "Делаем бронь, подписываем договор онлайн и ставим в календарь доставку." },
  { icon: Truck, num: "03", title: "Доставка и сборка", desc: "В согласованный день привозим станцию, устанавливаем и настраиваем у вас на адресе." },
  { icon: Smile, num: "04", title: "Наслаждаетесь", desc: "Тестируете в полной мере на длительной дистанции. Счастливые и здоровые работаете или играете." },
];

const FEATURES = [
  { icon: RotateCcw, title: "Меняйте положение", desc: "От обычного сидя до полностью горизонтального — когда вам это нужно.", stat: "180°", statLabel: "диапазон" },
  { icon: Eye, title: "Экран там где нужно", desc: "Настраиваемое расстояние 45–110 см от глаз. При трансформации расстояние не меняется.", stat: "45–110", statLabel: "см до экрана" },
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
  { label: "Необходимая площадь", value: "1,5 м²" },
  { label: "Производство", value: "Россия (Реестр инноваций Москвы)" },
];

const FAQ = [
  { q: "Какой минимальный срок аренды?", a: "Минимальный срок — 2 месяца. Это позволяет вам полноценно протестировать станцию и привыкнуть к работе в эргономичном положении." },
  { q: "Что входит в стоимость аренды?", a: "Станция с выбранной конфигурацией кронштейнов. Доставка и сборка оплачиваются дополнительно разово. Мониторы и компьютеры не входят." },
  { q: "Можно ли выкупить станцию после аренды?", a: "Да! Мы предлагаем программу аренды с выкупом. Часть арендных платежей может быть зачтена при покупке." },
  { q: "Как проходит доставка и сборка?", a: "Собственная бережная доставка на электромобиле. Привозим, собираем, настраиваем, показываем как пользоваться — всё за один визит. Время сборки — от 40 минут до 2 часов." },
  { q: "Подберёте кронштейны под мои мониторы?", a: "Да, подберём идеальный комплект. При специфичных запросах можем привезти несколько вариантов и на месте выбрать самый удобный — бесплатно." },
  { q: "Что если станция мне не подошла?", a: "Минимальный срок аренды — 2 месяца. По истечении вы можете вернуть станцию. Мы заберём и разберём всё сами." },
  { q: "Какая гарантия?", a: "Гарантия на металлокаркас — 5 лет, на механизм складывания и раскладывания — 1 год. Все комплектующие всегда есть на складе." },
  { q: "Можно ли протестировать перед арендой?", a: "Да! Запишитесь на бесплатное тестирование в шоуруме. Доступно в Москве, Санкт-Петербурге, Минске, Краснодаре и Казани." },
];

const TESTIMONIALS = [
  {
    name: "Максим",
    photo: `${ES}/upload/iblock/42c/78i917u0p7ao17z34f10oq7bbovaw0zc.webp`,
    text: "Раньше я не мог долго сидеть на одном месте, хотелось с ногами на стул залезть. Даже массажисты отметили, что у меня уменьшилось напряжение в пояснице. Сейчас у меня широкий монитор и сбоку ноутбук — удобно и для работы, и для игр.",
  },
  {
    name: "Роман",
    photo: `${ES}/upload/iblock/27f/nnlos6wy65zgkqmuedhl1llc0s9cesvs.webp`,
    text: "Долго думал, стоит ли тратить такие деньги, но спустя 4 месяца — нисколько не жалею. Побаливания спины ушли, не надо покупать телевизор, стол, стул, реклайнер — всё это заменила станция.",
  },
  {
    name: "Антон",
    photo: `${ES}/upload/iblock/5ff/ilma4mho2y3j98p696r906flr329n2bp.webp`,
    text: "С обычным игровым столом не сравнится. А у меня был и хороший стол с электроприводом, и дорогущее кресло. Главный аспект — возможность откидывать кресло. Спина значительно дольше не устаёт.",
  },
];

const SHOWROOM_CITIES = ["Москва", "Санкт-Петербург", "Минск", "Краснодар", "Казань"];

function ImageGallery({ images, className = "" }: { images: string[]; className?: string }) {
  const [idx, setIdx] = useState(0);
  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setIdx((i) => (i + 1) % images.length);

  return (
    <div className={`relative group ${className}`}>
      <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-zinc-900">
        <Image src={images[idx]} alt="e-station" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" priority={idx === 0} />
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
              <button key={i} onClick={() => setIdx(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? "w-6 bg-[#ACFF27]" : "w-1.5 bg-white/40"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SectionHeader({ tag, title, desc }: { tag: string; title: string; desc?: string }) {
  return (
    <div className="text-center mb-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-[#ACFF27] mb-3">{tag}</p>
      <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">{title}</h2>
      {desc && <p className="mt-5 text-zinc-400 max-w-xl mx-auto text-lg">{desc}</p>}
    </div>
  );
}

export function LandingClient() {
  const [selectedStation, setSelectedStation] = useState<{ id: string; name: string } | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [photoPage, setPhotoPage] = useState(0);
  const [posIdx, setPosIdx] = useState(0);
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
                Эргономичная замена традиционному столу и стулу. Персональное рабочее пространство, которое полностью настраивается под вас{" "}
                <span className="text-white font-semibold">от 199 ₽/день</span>
              </p>
              <div className="animate-slide-up delay-300 mt-10 flex flex-col sm:flex-row items-start gap-4">
                <a href="#booking" className="group rounded-2xl bg-[#ACFF27] px-8 py-4 text-base font-bold text-black hover:bg-[#c4ff5c] transition-all duration-300 flex items-center gap-2 shadow-2xl shadow-[#ACFF27]/20">
                  Забронировать
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </a>
                <a href="#how-it-works" className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm px-8 py-4 text-base font-medium text-zinc-300 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 flex items-center gap-2">
                  Как это работает
                  <ArrowDown className="h-4 w-4" />
                </a>
              </div>
              <div className="animate-slide-up delay-400 mt-14 grid grid-cols-3 gap-6 max-w-sm">
                {[{ value: "199₽", label: "в день" }, { value: "5 лет", label: "гарантия" }, { value: "1.5м²", label: "площадь" }].map((s) => (
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

      {/* ═══ NEW: PROBLEM / SOLUTION ═══ */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-3xl glass-card p-8 sm:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-xl bg-red-500/10 p-3"><AlertTriangle className="h-6 w-6 text-red-400" /></div>
                <h3 className="text-xl font-bold text-red-400">Проблема</h3>
              </div>
              <p className="text-zinc-400 leading-relaxed text-[15px]">
                Доказано, что работа по 8 часов в день в обычном кресле разрушает организм. Даже если удаётся держать спину прямо, это не спасает от рисков сидячего образа жизни: боли в спине, шее, руках и другие заболевания.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                {[{ v: "90%", l: "с заболеваниями позвоночника" }, { v: "10.4ч", l: "сидя каждый день" }].map((s) => (
                  <div key={s.l} className="rounded-xl bg-red-500/[0.04] border border-red-500/10 p-4">
                    <div className="text-2xl font-bold text-red-400">{s.v}</div>
                    <div className="text-xs text-zinc-500 mt-1">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl glass-card gradient-border p-8 sm:p-10 ring-1 ring-[#ACFF27]/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-xl bg-[#ACFF27]/10 p-3"><Check className="h-6 w-6 text-[#ACFF27]" /></div>
                <h3 className="text-xl font-bold">Решение — e-station</h3>
              </div>
              <p className="text-zinc-300 leading-relaxed text-[15px]">
                E-station — эргономичная замена традиционному столу и стулу. Вы сможете работать полулёжа и периодически менять положение одной кнопкой, чтобы избегать застойных поз. Монитор плавно двигается следом за спинкой.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                {[{ v: "–87%", l: "боли в пояснице" }, { v: "1.5м²", l: "необходимая площадь" }].map((s) => (
                  <div key={s.l} className="rounded-xl bg-[#ACFF27]/[0.04] border border-[#ACFF27]/10 p-4">
                    <div className="text-2xl font-bold text-[#ACFF27]">{s.v}</div>
                    <div className="text-xs text-zinc-500 mt-1">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ NEW: 3 POSITION MODES ═══ */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#ACFF27]/[0.03] rounded-full blur-[128px]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader tag="Трансформация" title="Меняйте положение одной кнопкой" desc="Спинка откидывается назад, подножка поднимается, а монитор плавно двигается следом" />
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-zinc-900">
              <Image src={POSITION_IMAGES[posIdx]} alt={POSITIONS[posIdx]?.title ?? "Положение"} fill className="object-contain" sizes="(max-width: 768px) 100vw, 50vw" />
            </div>
            <div className="space-y-4">
              {POSITIONS.map((p, i) => (
                <button
                  key={p.title}
                  onClick={() => setPosIdx(i)}
                  className={`w-full text-left rounded-2xl p-6 transition-all duration-300 ${posIdx === i ? "glass-card gradient-border ring-1 ring-[#ACFF27]/20" : "glass-card"}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xs font-semibold uppercase tracking-wider ${posIdx === i ? "text-[#ACFF27]" : "text-zinc-600"}`}>{p.badge}</span>
                  </div>
                  <h3 className={`text-lg font-bold mb-1 ${posIdx === i ? "text-white" : "text-zinc-400"}`}>{p.title}</h3>
                  <p className={`text-sm leading-relaxed ${posIdx === i ? "text-zinc-400" : "text-zinc-600"}`}>{p.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PRODUCT GALLERY ═══ */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader tag="Галерея" title="Конфигурации станций" desc="Доступны самые разнообразные конфигурации — подберём именно то, что вам нужно" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PRODUCT_IMAGES.map((src, i) => (
              <div key={i} className="group relative aspect-square rounded-2xl overflow-hidden bg-zinc-900">
                <Image src={src} alt={`Конфигурация ${i + 1}`} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 50vw, 25vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BENEFITS ═══ */}
      <section className="relative py-24 sm:py-32">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader tag="Преимущества" title="Почему киберстанция" desc="Это не просто кресло — это полноценная рабочая станция, которая меняет подход к работе" />
          <div className="grid gap-6 sm:grid-cols-3">
            {BENEFITS.map((b) => (
              <div key={b.title} className="group relative rounded-3xl glass-card p-8 hover:scale-[1.02] transition-all duration-300">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#ACFF27]/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="rounded-2xl bg-[#ACFF27]/[0.08] p-4 w-fit mb-6"><b.icon className="h-7 w-7 text-[#ACFF27]" /></div>
                  <h3 className="text-xl font-bold mb-3">{b.title}</h3>
                  <p className="text-zinc-400 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ NEW: QUALITY DETAILS ═══ */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute right-0 bottom-0 w-[500px] h-[500px] bg-[#ACFF27]/[0.03] rounded-full blur-[128px]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader tag="Качество" title="Качество в деталях" desc="Разработана с использованием 3D-проектирования и анализа прочности. Конструкция запатентована. Каркас из высококачественной стали." />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {QUALITY_DETAILS.map((d) => (
              <div key={d.title} className="group rounded-2xl glass-card p-6 hover:scale-[1.02] transition-all duration-300">
                <h4 className="font-bold mb-2 text-white group-hover:text-[#ACFF27] transition-colors">{d.title}</h4>
                <p className="text-sm text-zinc-500 leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#ACFF27]/[0.03] rounded-full blur-[128px]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader tag="Процесс" title="Как работает подписка" desc="Как каршеринг, только на эргономичное рабочее место. 4 простых шага." />
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
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ACFF27] text-black text-sm font-bold shrink-0">{s.num}</div>
                    <div className="rounded-xl bg-white/[0.04] p-2.5"><s.icon className="h-5 w-5 text-zinc-400 group-hover:text-[#ACFF27] transition-colors" /></div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader tag="Возможности" title="Продумано до деталей" />
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <ImageGallery images={CONFIG_PHOTOS} />
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

      {/* ═══ NEW: TEST RESULTS + HEALTH STATS ═══ */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[600px] h-[400px] bg-[#ACFF27]/[0.04] rounded-full blur-[128px]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader tag="Доказано наукой" title="Результаты медицинских тестов" desc="Пилотное тестирование совместно с Агентством инноваций Москвы на базе Технопарка «Строгино». 10 человек, 2 недели, специальные измерительные приборы." />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-20">
            {TEST_RESULTS.map((r) => (
              <div key={r.label} className="rounded-3xl glass-card gradient-border p-8 text-center">
                <div className="text-5xl font-black text-[#ACFF27] mb-3">{r.value}</div>
                <p className="text-sm text-zinc-400">{r.label}</p>
              </div>
            ))}
          </div>

          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold">Зачем это нужно: факты о сидячем образе жизни</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HEALTH_STATS.map((s) => (
              <div key={s.value} className="rounded-2xl glass-card p-6">
                <div className="text-3xl font-bold text-white mb-2">{s.value}</div>
                <p className="text-xs text-zinc-500 leading-relaxed">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ NEW: EXPERTS ═══ */}
      <section className="relative py-24 sm:py-32">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader tag="Эксперты" title="Мнения специалистов" desc="Врачи и исследователи подтверждают эффективность e-station" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {EXPERTS.map((e) => (
              <div key={e.name} className="rounded-3xl glass-card p-8">
                <GraduationCap className="h-8 w-8 text-[#ACFF27]/20 mb-4" />
                <p className="text-zinc-300 leading-relaxed mb-6 text-[15px] italic">&laquo;{e.quote}&raquo;</p>
                <div className="flex items-center gap-3 pt-5 border-t border-white/[0.06]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ACFF27] text-black text-xs font-bold">{e.initials}</div>
                  <div>
                    <div className="font-semibold text-sm">{e.name}</div>
                    <div className="text-xs text-zinc-500">{e.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CLIENT PHOTOS ═══ */}
      <section className="relative py-24 sm:py-32">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader tag="Реальные сетапы" title="Фото от довольных клиентов" desc="Реальные рабочие места наших клиентов — от разработчиков до геймеров" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {visiblePhotos.map((src, i) => (
              <div key={`${photoPage}-${i}`} className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-900">
                <Image src={src} alt={`Сетап клиента ${photoPage * photosPerPage + i + 1}`} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 50vw, 33vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
          {CLIENT_PHOTOS.length > photosPerPage && (
            <div className="flex justify-center gap-3 mt-8">
              <button onClick={() => setPhotoPage((p) => Math.max(0, p - 1))} disabled={photoPage === 0} className="flex h-10 w-10 items-center justify-center rounded-full glass-card text-zinc-400 hover:text-white disabled:opacity-30 transition-all">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={() => setPhotoPage((p) => Math.min(Math.ceil(CLIENT_PHOTOS.length / photosPerPage) - 1, p + 1))} disabled={(photoPage + 1) * photosPerPage >= CLIENT_PHOTOS.length} className="flex h-10 w-10 items-center justify-center rounded-full glass-card text-zinc-400 hover:text-white disabled:opacity-30 transition-all">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ═══ REVIEWS (real from e-station.tech) ═══ */}
      <section className="relative py-24 sm:py-32">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader tag="Отзывы" title="Что говорят клиенты" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="group relative rounded-3xl glass-card p-8 hover:scale-[1.01] transition-all duration-300">
                <Quote className="h-10 w-10 text-[#ACFF27]/10 mb-5" />
                <p className="text-zinc-300 leading-relaxed mb-6 text-[15px]">{t.text}</p>
                <div className="flex items-center gap-3 pt-5 border-t border-white/[0.06]">
                  <div className="relative h-10 w-10 rounded-full overflow-hidden bg-zinc-800 shrink-0">
                    <Image src={t.photo} alt={t.name} fill className="object-cover" sizes="40px" />
                  </div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="ml-auto flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
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
          <SectionHeader tag="Каталог" title="Доступные станции" desc="Актуальные данные в реальном времени. Выберите станцию и забронируйте прямо сейчас." />
          <StationsSection onSelect={(id, name) => setSelectedStation({ id, name })} />
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[800px] h-[400px] bg-[#ACFF27]/[0.03] rounded-full blur-[128px]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader tag="Тарифы" title="Стоимость аренды" desc="Чем дольше — тем выгоднее. Доставка и сборка оплачиваются разово." />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PRICING_RENT.map((p) => (
              <div key={p.period} className={`group relative rounded-3xl p-7 transition-all duration-300 hover:scale-[1.02] ${p.highlight ? "glass-card gradient-border ring-1 ring-[#ACFF27]/20" : "glass-card"}`}>
                {p.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-semibold whitespace-nowrap ${p.highlight ? "bg-[#ACFF27] text-black shadow-lg shadow-[#ACFF27]/20" : "bg-zinc-700 text-white"}`}>
                    {p.badge}
                  </div>
                )}
                <div className="text-sm text-zinc-500 mb-2 font-medium">{p.period}</div>
                <div className="text-3xl font-bold mb-0.5 tracking-tight">{p.price} <span className="text-base font-normal text-zinc-500">₽/мес</span></div>
                <div className={`text-lg font-bold mb-4 ${p.highlight ? "text-[#ACFF27]" : "text-[#ACFF27]/70"}`}>{p.daily} ₽/день</div>
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
                { val: "239 990 ₽", label: "Базовая станция", hl: false },
                { val: "+ 15 000 ₽", label: "Замшевая обшивка", hl: false },
                { val: "+ 15–55 тыс ₽", label: "Кронштейны и обвес", hl: false },
                { val: "260–300 тыс ₽", label: "Полный комплект", hl: true },
              ].map((item) => (
                <div key={item.label}>
                  <div className={`text-2xl font-bold ${item.hl ? "text-[#ACFF27]" : "text-white"}`}>{item.val}</div>
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
          <SectionHeader tag="Сравнение" title="Почему аренда — это выгодно" />
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl glass-card p-8 sm:p-10">
              <div className="flex items-center gap-3 mb-6"><div className="h-2 w-2 rounded-full bg-red-400" /><h3 className="text-xl font-bold text-zinc-400">Покупка сразу</h3></div>
              <ul className="space-y-4 text-sm text-zinc-500">
                {["260 000 – 300 000 ₽ сразу", "Не понятно, подойдёт ли именно вам", "Самостоятельная доставка и сборка", "Сложно продать если не подошло"].map((t) => (
                  <li key={t} className="flex items-start gap-3"><XCircleIcon className="h-5 w-5 text-red-400/40 shrink-0 mt-0.5" />{t}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl glass-card gradient-border p-8 sm:p-10 ring-1 ring-[#ACFF27]/10">
              <div className="flex items-center gap-3 mb-6"><div className="h-2 w-2 rounded-full bg-[#ACFF27]" /><h3 className="text-xl font-bold">Аренда в ERGOSET</h3></div>
              <ul className="space-y-4 text-sm text-zinc-300">
                {["От 12 000 ₽/мес — полноценный тест-драйв", "Попробуете в деле на длительной дистанции", "Доставка, сборка и настройка включены", "Можно выкупить со скидкой или вернуть", "Чем дольше — тем дешевле (от 199 ₽/день)"].map((t) => (
                  <li key={t} className="flex items-start gap-3"><Check className="h-5 w-5 text-[#ACFF27] shrink-0 mt-0.5" />{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ DELIVERY (enriched) ═══ */}
      <section className="relative py-24 sm:py-32">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-[#ACFF27] mb-3">Доставка и сборка</p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 tracking-tight">Бережная доставка на электромобиле</h2>
              <p className="text-zinc-400 leading-relaxed mb-8 text-lg">
                Собственная логистика на уникальном электромобиле KANGAROO ELECTRO. Привозим, собираем, настраиваем — всё включено в один визит.
              </p>
              <div className="space-y-5">
                {[
                  { icon: Leaf, title: "Бесплатно по Москве", desc: "Доставка внутри МКАД бесплатна. По РФ и СНГ — транспортной компанией", color: "text-emerald-400", bg: "bg-emerald-500/10" },
                  { icon: Timer, title: "Сборка 40 мин — 2 часа", desc: "Станция приходит полусобранной (5-7 модулей). Инструменты в комплекте", color: "text-[#ACFF27]", bg: "bg-[#ACFF27]/10" },
                  { icon: Package, title: "Компактная упаковка", desc: "Объём 0.96 м³, помещается в багажник легкового авто. Доставляется на паллете", color: "text-violet-400", bg: "bg-violet-500/10" },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className={`rounded-xl ${item.bg} p-3 shrink-0`}><item.icon className={`h-5 w-5 ${item.color}`} /></div>
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

      {/* ═══ NEW: WARRANTY + PATENTS ═══ */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader tag="Надёжность" title="Гарантия и сертификаты" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: ShieldCheck, title: "Каркас — 5 лет", desc: "Гарантия на металлокаркас из высококачественной стали" },
              { icon: Wrench, title: "Механизм — 1 год", desc: "Гарантия на механизм складывания и раскладывания" },
              { icon: Award, title: "Резидент Сколково", desc: "Официальный статус получен в январе 2025 года" },
              { icon: Shield, title: "Реестр инноваций", desc: "Внесена в Реестр инновационных решений города Москвы" },
            ].map((c) => (
              <div key={c.title} className="rounded-3xl glass-card p-7 text-center">
                <div className="rounded-2xl bg-[#ACFF27]/[0.08] p-4 w-fit mx-auto mb-5"><c.icon className="h-7 w-7 text-[#ACFF27]" /></div>
                <h4 className="font-bold mb-2">{c.title}</h4>
                <p className="text-sm text-zinc-500">{c.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 rounded-2xl glass-card p-6 text-center">
            <p className="text-sm text-zinc-400">
              Конструкция запатентована российскими и международными патентами. Производство в Москве. Все комплектующие всегда есть на складе.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ NEW: SHOWROOMS ═══ */}
      <section className="relative py-24 sm:py-32">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader tag="Тестирование" title="Запишитесь в шоурум" desc="Испытайте станцию лично перед арендой или покупкой — бесплатно" />
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {SHOWROOM_CITIES.map((city) => (
              <div key={city} className="rounded-2xl glass-card px-6 py-4 flex items-center gap-3">
                <MapPin className="h-5 w-5 text-[#ACFF27]" />
                <span className="font-medium">{city}</span>
              </div>
            ))}
          </div>
          <div className="text-center">
            <a href="#booking" className="group inline-flex items-center gap-2 rounded-2xl bg-[#ACFF27] px-8 py-4 text-base font-bold text-black hover:bg-[#c4ff5c] transition-all duration-300 shadow-lg shadow-[#ACFF27]/10">
              Записаться на тестирование
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      {/* ═══ SPECS (with size diagram) ═══ */}
      <section id="specs" className="relative py-24 sm:py-32">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader tag="Спецификации" title="Технические характеристики" />
          <div className="grid gap-10 lg:grid-cols-2 items-start">
            <div className="rounded-3xl glass-card overflow-hidden">
              {SPECS.map((s, i) => (
                <div key={s.label} className={`flex justify-between items-center px-8 py-5 ${i !== SPECS.length - 1 ? "border-b border-white/[0.04]" : ""} hover:bg-white/[0.02] transition-colors`}>
                  <span className="text-zinc-500 text-sm">{s.label}</span>
                  <span className="font-medium text-right text-sm">{s.value}</span>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-zinc-900">
                <Image src={SIZE_DIAGRAM} alt="Габариты e-station" fill className="object-contain p-4" sizes="(max-width: 768px) 100vw, 50vw" />
              </div>
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-zinc-900">
                <Image src={SIZE_DIAGRAM_2} alt="Габариты e-station в горизонтальном положении" fill className="object-contain p-4" sizes="(max-width: 768px) 100vw, 50vw" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ BOOKING FORM ═══ */}
      <section id="booking" className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-[#ACFF27]/[0.03] rounded-full blur-[128px]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader tag="Бронирование" title="Забронировать станцию" desc="Оставьте заявку — мы свяжемся для уточнения деталей и подберём идеальную конфигурацию" />
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
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-6 py-5 text-left group">
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
          <a href="#booking" className="group inline-flex items-center gap-2 rounded-2xl bg-[#ACFF27] px-10 py-4 text-base font-bold text-black hover:bg-[#c4ff5c] transition-all duration-300 shadow-2xl shadow-[#ACFF27]/20">
            Забронировать станцию
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </a>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-zinc-500 mt-8">
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-[#ACFF27]" /> от 199 ₽/день</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-[#ACFF27]" /> Гарантия 5 лет</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-[#ACFF27]" /> Бесплатная доставка по Москве</span>
          </div>
        </div>
      </section>
    </>
  );
}
