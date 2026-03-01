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
          <div key={i} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 animate-pulse h-64" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-zinc-400">
        <Armchair className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p>Не удалось загрузить станции. Попробуйте обновить страницу.</p>
      </div>
    );
  }

  if (stations.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-400">
        <Armchair className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p className="text-lg">Все станции сейчас в аренде</p>
        <p className="text-sm mt-2">Оставьте заявку — мы свяжемся, как только появится свободная станция</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {stations.map((s) => (
        <div
          key={s.id}
          className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 hover:border-blue-500/50 transition-all duration-300"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">{s.name}</h3>
              <p className="text-sm text-zinc-400">{s.code}</p>
            </div>
            {s.availability === "available" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Доступна
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-400">
                <Clock className="h-3.5 w-3.5" />
                Скоро
              </span>
            )}
          </div>

          <div className="space-y-2 text-sm text-zinc-400 mb-6">
            {s.brand && <p>Бренд: <span className="text-zinc-200">{s.brand}</span></p>}
            {s.model && <p>Модель: <span className="text-zinc-200">{s.model}</span></p>}
            {s.upholstery && <p>Обивка: <span className="text-zinc-200">{s.upholstery}</span></p>}
            {s.color && <p>Цвет: <span className="text-zinc-200">{s.color}</span></p>}
            {s.availability === "soon" && s.availableFrom && (
              <p>Освободится: <span className="text-yellow-400">{new Date(s.availableFrom).toLocaleDateString("ru-RU")}</span></p>
            )}
          </div>

          <button
            onClick={() => onSelect(s.id, s.name)}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
          >
            {s.availability === "available" ? "Забронировать" : "Оставить заявку"}
          </button>
        </div>
      ))}
    </div>
  );
}
