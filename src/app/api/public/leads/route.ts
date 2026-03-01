import { NextResponse } from "next/server";
import { leadPublicCreateSchema } from "@/domain/leads/validation";
import { createLead } from "@/services/leads";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = leadPublicCreateSchema.parse(body);
    const lead = await createLead({
      ...parsed,
      desiredStartDate: parsed.desiredStartDate ?? undefined,
      email: parsed.email || undefined,
    });
    return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 });
  } catch (e: unknown) {
    if (e && typeof e === "object" && "issues" in e) {
      return NextResponse.json({ error: "Ошибка валидации", details: (e as { issues: unknown }).issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Ошибка создания заявки" }, { status: 500 });
  }
}
