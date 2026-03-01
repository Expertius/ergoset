"use client";

import { useEffect, useState } from "react";
import { Armchair, Clock, CheckCircle2 } from "lucide-react";

type Station = {
  id: string;
  code: string;
  name: string;
  brand: string | null;
  model: string | null;
  type: string | null;
  upholstery: string | null;
  color: string | null;
  description: string | null;
  availability: "available" | "soon";
  availableFrom: string | null;
};

export function StationsSection({ onSelect }: { onSelect: (id: string, name: string) => void }) {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/public/stations")
      .then((r) => r.json())
      .then((d) => setStations(d.stations || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-3xl glass-card p-8 animate-pulse h-72" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="rounded-3xl glass-card inline-flex flex-col items-center p-12">
          <Armchair className="h-12 w-12 text-zinc-600 mb-4" />
          <p className="text-zinc-400">Не удалось загрузить станции. Попробуйте обновить страницу.</p>
        </div>
      </div>
    );
  }

  if (stations.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="rounded-3xl glass-card inline-flex flex-col items-center p-12">
          <Armchair className="h-12 w-12 text-zinc-600 mb-4" />
          <p className="text-lg font-medium text-zinc-300">Все станции сейчас в аренде</p>
          <p className="text-sm text-zinc-500 mt-2 max-w-sm">Оставьте заявку — мы свяжемся, как только появится свободная станция</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {stations.map((s) => (
        <div
          key={s.id}
          className="group relative rounded-3xl glass-card p-7 hover:scale-[1.02] transition-all duration-300"
        >
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="font-bold text-lg">{s.name}</h3>
              <p className="text-xs text-zinc-600 mt-0.5 font-mono">{s.code}</p>
            </div>
            {s.availability === "available" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ACFF27]/10 border border-[#ACFF27]/20 px-3 py-1.5 text-xs font-medium text-[#ACFF27]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Доступна
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-400">
                <Clock className="h-3.5 w-3.5" />
                Скоро
              </span>
            )}
          </div>

          <div className="space-y-2.5 text-sm text-zinc-500 mb-7">
            {s.brand && <p>Бренд: <span className="text-zinc-300">{s.brand}</span></p>}
            {s.model && <p>Модель: <span className="text-zinc-300">{s.model}</span></p>}
            {s.upholstery && <p>Обивка: <span className="text-zinc-300">{s.upholstery}</span></p>}
            {s.color && <p>Цвет: <span className="text-zinc-300">{s.color}</span></p>}
            {s.availability === "soon" && s.availableFrom && (
              <p>Освободится: <span className="text-amber-400">{new Date(s.availableFrom).toLocaleDateString("ru-RU")}</span></p>
            )}
          </div>

          <button
            onClick={() => onSelect(s.id, s.name)}
            className="w-full rounded-xl bg-[#ACFF27] px-4 py-3 text-sm font-bold text-black hover:bg-[#c4ff5c] transition-all duration-200 shadow-lg shadow-[#ACFF27]/10"
          >
            {s.availability === "available" ? "Забронировать" : "Оставить заявку"}
          </button>
        </div>
      ))}
    </div>
  );
}
