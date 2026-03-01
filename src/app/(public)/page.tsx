import type { Metadata } from "next";
import { LandingClient } from "@/components/public/landing-client";

export const metadata: Metadata = {
  title: "ERGOSET — Подписка на киберстанции e-station | от 199 ₽/день",
  description:
    "Эргономичные рабочие станции e-station по подписке. Аренда от 199 ₽/день. Доставка, сборка, настройка. Тест-драйв будущего рабочего места.",
};

export default function LandingPage() {
  return <LandingClient />;
}
