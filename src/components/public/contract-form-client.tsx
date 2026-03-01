"use client";

import { useEffect, useState } from "react";
import { Armchair, CheckCircle2, Loader2, Send, AlertCircle } from "lucide-react";
import { toast } from "sonner";

type ContractState =
  | { type: "loading" }
  | { type: "error"; message: string }
  | { type: "filled" }
  | { type: "form"; leadName: string; station: { code: string; name: string } | null }
  | { type: "success" };

export function ContractFormClient({ token }: { token: string }) {
  const [state, setState] = useState<ContractState>({ type: "loading" });
  const [submitting, setSubmitting] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [passportSeries, setPassportSeries] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [passportIssuedBy, setPassportIssuedBy] = useState("");
  const [passportIssueDate, setPassportIssueDate] = useState("");
  const [registrationAddress, setRegistrationAddress] = useState("");
  const [actualAddress, setActualAddress] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  useEffect(() => {
    fetch(`/api/public/contract/${token}`)
      .then(async (r) => {
        if (!r.ok) {
          const d = await r.json();
          setState({ type: "error", message: d.error || "Ошибка" });
          return;
        }
        const d = await r.json();
        if (d.filled) {
          setState({ type: "filled" });
        } else {
          setState({ type: "form", leadName: d.leadName, station: d.station });
          setFullName(d.leadName || "");
        }
      })
      .catch(() => setState({ type: "error", message: "Не удалось загрузить" }));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/public/contract/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName, phone, email, passportSeries, passportNumber,
          passportIssuedBy, passportIssueDate, registrationAddress,
          actualAddress, deliveryAddress, deliveryNotes,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Ошибка");
      }
      setState({ type: "success" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка отправки");
    } finally {
      setSubmitting(false);
    }
  }

  if (state.type === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (state.type === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <AlertCircle className="h-16 w-16 text-red-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Ссылка недействительна</h2>
        <p className="text-zinc-400">{state.message}</p>
      </div>
    );
  }

  if (state.type === "filled" || state.type === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <CheckCircle2 className="h-16 w-16 text-emerald-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">
          {state.type === "success" ? "Данные отправлены!" : "Данные уже заполнены"}
        </h2>
        <p className="text-zinc-400 max-w-md">
          {state.type === "success"
            ? "Спасибо! Менеджер проверит данные и свяжется с вами для подписания договора."
            : "Вы уже заполнили данные для договора. Менеджер свяжется с вами."
          }
        </p>
      </div>
    );
  }

  const inputCls = "w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors";
  const labelCls = "block text-sm font-medium text-zinc-300 mb-1.5";

  return (
    <div className="mx-auto max-w-2xl py-12 px-4 sm:px-6">
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Armchair className="h-8 w-8 text-blue-500" />
          <span className="text-2xl font-bold">ERGOSET</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">Данные для договора</h1>
        <p className="text-zinc-400">
          Заполните данные для оформления договора аренды
          {state.station && <span> станции <strong>{state.station.name}</strong></span>}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
          <h3 className="font-semibold text-lg mb-2">Персональные данные</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelCls}>ФИО полностью *</label>
              <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} placeholder="Иванов Иван Иванович" />
            </div>
            <div>
              <label className={labelCls}>Телефон *</label>
              <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} placeholder="+7 (___) ___-__-__" />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="email@example.com" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
          <h3 className="font-semibold text-lg mb-2">Паспортные данные</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Серия *</label>
              <input type="text" required value={passportSeries} onChange={(e) => setPassportSeries(e.target.value)} className={inputCls} placeholder="00 00" maxLength={5} />
            </div>
            <div>
              <label className={labelCls}>Номер *</label>
              <input type="text" required value={passportNumber} onChange={(e) => setPassportNumber(e.target.value)} className={inputCls} placeholder="000000" maxLength={7} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Кем выдан *</label>
              <input type="text" required value={passportIssuedBy} onChange={(e) => setPassportIssuedBy(e.target.value)} className={inputCls} placeholder="Отделением УФМС..." />
            </div>
            <div>
              <label className={labelCls}>Дата выдачи *</label>
              <input type="date" required value={passportIssueDate} onChange={(e) => setPassportIssueDate(e.target.value)} className={inputCls} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
          <h3 className="font-semibold text-lg mb-2">Адреса</h3>
          <div>
            <label className={labelCls}>Адрес регистрации *</label>
            <input type="text" required value={registrationAddress} onChange={(e) => setRegistrationAddress(e.target.value)} className={inputCls} placeholder="Полный адрес по прописке" />
          </div>
          <div>
            <label className={labelCls}>Фактический адрес (если отличается)</label>
            <input type="text" value={actualAddress} onChange={(e) => setActualAddress(e.target.value)} className={inputCls} placeholder="Где проживаете сейчас" />
          </div>
          <div>
            <label className={labelCls}>Адрес доставки станции</label>
            <input type="text" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} className={inputCls} placeholder="Куда привезти станцию" />
          </div>
          <div>
            <label className={labelCls}>Примечания к доставке</label>
            <textarea value={deliveryNotes} onChange={(e) => setDeliveryNotes(e.target.value)} rows={2} className={`${inputCls} resize-none`} placeholder="Этаж, наличие лифта, особенности подъезда..." />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          {submitting ? "Отправка..." : "Отправить данные"}
        </button>

        <p className="text-xs text-zinc-500 text-center">
          Данные используются исключительно для оформления договора аренды
        </p>
      </form>
    </div>
  );
}
