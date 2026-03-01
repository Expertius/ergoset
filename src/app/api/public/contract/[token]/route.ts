import { NextResponse } from "next/server";
import { getLeadByContractToken, saveContractData } from "@/services/leads";
import { contractDataSchema } from "@/domain/leads/validation";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  try {
    const lead = await getLeadByContractToken(token);
    if (!lead) {
      return NextResponse.json({ error: "Ссылка недействительна" }, { status: 404 });
    }
    if (lead.status === "contract_filled" || lead.status === "converted") {
      return NextResponse.json({
        filled: true,
        message: "Данные уже заполнены. Спасибо!",
      });
    }
    return NextResponse.json({
      filled: false,
      leadName: lead.name,
      station: lead.desiredAsset,
      existingData: lead.contractData || null,
    });
  } catch {
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  try {
    const lead = await getLeadByContractToken(token);
    if (!lead) {
      return NextResponse.json({ error: "Ссылка недействительна" }, { status: 404 });
    }
    if (lead.status === "converted") {
      return NextResponse.json({ error: "Заявка уже обработана" }, { status: 400 });
    }
    const body = await request.json();
    const parsed = contractDataSchema.parse(body);
    await saveContractData(token, parsed as unknown as Record<string, unknown>);
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    if (e && typeof e === "object" && "issues" in e) {
      return NextResponse.json({ error: "Ошибка валидации", details: (e as { issues: unknown }).issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Ошибка сохранения" }, { status: 500 });
  }
}
