"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";

type BookingFormProps = {
  selectedStationId?: string;
  selectedStationName?: string;
};

const INTEREST_OPTIONS = [
  { value: "rent", label: "Аренда" },
  { value: "buy", label: "Покупка" },
  { value: "rent_to_purchase", label: "Аренда с выкупом" },
  { value: "info", label: "Больше информации" },
];

const CONFIG_OPTIONS = [
  { value: "1mon", label: "1 монитор (до 34\")" },
  { value: "2mon", label: "2 монитора (до 27\")" },
  { value: "3mon", label: "3 монитора (до 27\")" },
  { value: "1mon+laptop", label: "1 монитор + ноутбук" },
  { value: "2mon+laptop", label: "2 монитора + ноутбук" },
  { value: "custom", label: "Другая конфигурация" },
];

export function BookingForm({ selectedStationId, selectedStationName }: BookingFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState("rent");
  const [config, setConfig] = useState("");
  const [customConfig, setCustomConfig] = useState("");
  const [desiredStartDate, setDesiredStartDate] = useState("");
  const [desiredMonths, setDesiredMonths] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (selectedStationId) {
      document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedStationId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const body = {
        name,
        phone: phone || undefined,
        email: email || undefined,
        interest,
        desiredAssetId: selectedStationId || undefined,
        desiredConfig: config === "custom" ? customConfig : config || undefined,
        desiredStartDate: desiredStartDate || undefined,
        desiredMonths: desiredMonths ? parseInt(desiredMonths) : undefined,
        notes: notes || undefined,
        source: "website",
      };

      const res = await fetch("/api/public/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Ошибка отправки");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Произошла ошибка");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-16">
        <div className="rounded-3xl glass-card inline-flex flex-col items-center p-12 max-w-md mx-auto">
          <div className="rounded-full bg-[#ACFF27]/10 p-4 mb-6">
            <CheckCircle2 className="h-12 w-12 text-[#ACFF27]" />
          </div>
          <h3 className="text-2xl font-bold mb-3">Заявка отправлена!</h3>
          <p className="text-zinc-400 leading-relaxed">
            Мы свяжемся с вами в ближайшее время для уточнения деталей и подбора идеальной конфигурации.
          </p>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-white placeholder-zinc-600 focus:border-[#ACFF27]/30 focus:bg-white/[0.05] focus:ring-1 focus:ring-[#ACFF27]/20 outline-none transition-all duration-200 text-sm";

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <div className="rounded-3xl glass-card p-8 sm:p-10 space-y-6">
        {selectedStationName && (
          <div className="rounded-2xl border border-[#ACFF27]/20 bg-[#ACFF27]/[0.04] p-4 text-center">
            <p className="text-xs uppercase tracking-wider text-[#ACFF27] mb-1">Выбранная станция</p>
            <p className="font-semibold text-lg">{selectedStationName}</p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400 mb-2">Имя *</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Ваше имя" />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400 mb-2">Телефон *</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="+7 (___) ___-__-__" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400 mb-2">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="email@example.com" />
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400 mb-3">Меня интересует</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {INTEREST_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setInterest(opt.value)}
                className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  interest === opt.value
                    ? "border-[#ACFF27]/40 bg-[#ACFF27]/10 text-[#ACFF27]"
                    : "border-white/[0.06] bg-white/[0.02] text-zinc-500 hover:border-white/10 hover:text-zinc-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {interest !== "info" && (
          <>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400 mb-3">Конфигурация мониторов</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {CONFIG_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setConfig(opt.value)}
                    className={`rounded-xl border px-3 py-2.5 text-sm transition-all duration-200 ${
                      config === opt.value
                        ? "border-[#ACFF27]/40 bg-[#ACFF27]/10 text-[#ACFF27]"
                        : "border-white/[0.06] bg-white/[0.02] text-zinc-500 hover:border-white/10 hover:text-zinc-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {config === "custom" && (
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400 mb-2">Опишите конфигурацию</label>
                <textarea value={customConfig} onChange={(e) => setCustomConfig(e.target.value)} rows={2} className={`${inputClass} resize-none`} placeholder="Какие мониторы, размеры, дополнительное оборудование..." />
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400 mb-2">Желаемая дата начала</label>
                <input type="date" value={desiredStartDate} onChange={(e) => setDesiredStartDate(e.target.value)} min={new Date().toISOString().split("T")[0]} className={inputClass} />
              </div>
              {interest === "rent" || interest === "rent_to_purchase" ? (
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400 mb-2">Срок аренды (мес.)</label>
                  <input type="number" min={2} max={36} value={desiredMonths} onChange={(e) => setDesiredMonths(e.target.value)} className={inputClass} placeholder="Минимум 2 месяца" />
                </div>
              ) : null}
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400 mb-2">Комментарий</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={`${inputClass} resize-none`} placeholder="Дополнительные пожелания, вопросы..." />
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/[0.04] p-4 text-sm text-red-400">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading || !name}
          className="w-full rounded-xl bg-[#ACFF27] px-6 py-4 text-base font-bold text-black hover:bg-[#c4ff5c] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-2xl shadow-[#ACFF27]/10"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
          {loading ? "Отправка..." : "Отправить заявку"}
        </button>

        <p className="text-xs text-zinc-600 text-center">
          Отправляя форму, вы соглашаетесь на обработку персональных данных
        </p>
      </div>
    </form>
  );
}
