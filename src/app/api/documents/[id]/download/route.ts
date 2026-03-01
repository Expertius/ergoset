import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import * as fs from "fs/promises";
import * as path from "path";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { id } = await params;

  const doc = await prisma.document.findUnique({
    where: { id },
    include: { deal: { select: { clientId: true, createdById: true } } },
  });
  if (!doc || !doc.filePath) {
    return NextResponse.json({ error: "Файл не найден" }, { status: 404 });
  }

  if (session.role === "CLIENT") {
    const client = await prisma.client.findUnique({ where: { userId: session.id } });
    if (!client || doc.deal.clientId !== client.id) {
      return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    }
  } else if (session.role === "MANAGER" && doc.deal.createdById !== session.id) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const fileExists = await fs.access(doc.filePath).then(() => true).catch(() => false);
  if (!fileExists) {
    return NextResponse.json({ error: "Файл отсутствует на диске" }, { status: 404 });
  }

  const buffer = await fs.readFile(doc.filePath);
  const fileName = path.basename(doc.filePath);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
