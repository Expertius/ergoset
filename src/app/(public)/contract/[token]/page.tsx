import type { Metadata } from "next";
import { ContractFormClient } from "@/components/public/contract-form-client";

export const metadata: Metadata = {
  title: "ERGOSET — Заполнение данных для договора",
  description: "Заполните данные для оформления договора аренды киберстанции",
};

type Props = {
  params: Promise<{ token: string }>;
};

export default async function ContractPage({ params }: Props) {
  const { token } = await params;
  return <ContractFormClient token={token} />;
}
