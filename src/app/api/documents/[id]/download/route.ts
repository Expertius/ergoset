import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import * as fs from "fs";
import * as path from "path";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc || !doc.filePath) {
    return NextResponse.json({ error: "Файл не найден" }, { status: 404 });
  }

  if (!fs.existsSync(doc.filePath)) {
    return NextResponse.json({ error: "Файл отсутствует на диске" }, { status: 404 });
  }

  const buffer = fs.readFileSync(doc.filePath);
  const fileName = path.basename(doc.filePath);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
