import { NextResponse } from "next/server";
import { getPublicStations } from "@/services/leads";

export async function GET() {
  try {
    const stations = await getPublicStations();
    return NextResponse.json({ stations });
  } catch {
    return NextResponse.json({ error: "Ошибка загрузки" }, { status: 500 });
  }
}
