"use client";

import { useState, useEffect } from "react";
import { Send, CheckCircle2, Loader2 } from "lucide-react";

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
      <div className="text-center py-12">
        <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-400 mb-4" />
        <h3 className="text-2xl font-bold mb-2">Заявка отправлена!</h3>
        <p className="text-zinc-400 max-w-md mx-auto">
          Мы свяжемся с вами в ближайшее время для уточнения деталей и подбора идеальной конфигурации.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      {selectedStationName && (
        <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 text-center">
          <p className="text-sm text-blue-400">Выбранная станция</p>
          <p className="font-semibold text-lg">{selectedStationName}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Имя *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
            placeholder="Ваше имя"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Телефон *</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
            placeholder="+7 (___) ___-__-__"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
          placeholder="email@example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-3">Меня интересует</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {INTEREST_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setInterest(opt.value)}
              className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                interest === opt.value
                  ? "border-blue-500 bg-blue-500/10 text-blue-400"
                  : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600"
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
            <label className="block text-sm font-medium text-zinc-300 mb-3">Конфигурация мониторов</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {CONFIG_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setConfig(opt.value)}
                  className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                    config === opt.value
                      ? "border-blue-500 bg-blue-500/10 text-blue-400"
                      : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {config === "custom" && (
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Опишите конфигурацию</label>
              <textarea
                value={customConfig}
                onChange={(e) => setCustomConfig(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors resize-none"
                placeholder="Какие мониторы, размеры, дополнительное оборудование..."
              />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                Желаемая дата начала
              </label>
              <input
                type="date"
                value={desiredStartDate}
                onChange={(e) => setDesiredStartDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
              />
            </div>
            {interest === "rent" || interest === "rent_to_purchase" ? (
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Срок аренды (мес.)
                </label>
                <input
                  type="number"
                  min={2}
                  max={36}
                  value={desiredMonths}
                  onChange={(e) => setDesiredMonths(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                  placeholder="Минимум 2 месяца"
                />
              </div>
            ) : null}
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1.5">Комментарий</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors resize-none"
          placeholder="Дополнительные пожелания, вопросы..."
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !name}
        className="w-full rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Send className="h-5 w-5" />
        )}
        {loading ? "Отправка..." : "Отправить заявку"}
      </button>

      <p className="text-xs text-zinc-500 text-center">
        Отправляя форму, вы соглашаетесь на обработку персональных данных
      </p>
    </form>
  );
}
