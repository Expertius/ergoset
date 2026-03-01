"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

const profileUpdateSchema = z.object({
  phone: z.string().optional(),
  actualAddress: z.string().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Введите текущий пароль"),
  newPassword: z.string().min(6, "Пароль должен быть не менее 6 символов"),
});

export async function updateClientProfileAction(
  clientId: string,
  data: { phone?: string; actualAddress?: string }
) {
  const session = await getSession();
  requireRole(session, "CLIENT");

  const parsed = profileUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Некорректные данные" };
  }

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client || client.userId !== session.id) {
    return { success: false, error: "Недостаточно прав" };
  }

  try {
    await prisma.client.update({
      where: { id: clientId },
      data: {
        phone: parsed.data.phone,
        actualAddress: parsed.data.actualAddress,
      },
    });
    revalidatePath("/cabinet/profile");
    return { success: true };
  } catch {
    return { success: false, error: "Ошибка сохранения" };
  }
}

export async function changePasswordAction(
  currentPassword: string,
  newPassword: string
) {
  const session = await getSession();
  if (!session) return { success: false, error: "Не авторизован" };

  const parsed = changePasswordSchema.safeParse({ currentPassword, newPassword });
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message || "Некорректные данные" };
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user) return { success: false, error: "Пользователь не найден" };

    const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
    if (!valid) {
      return { success: false, error: "Неверный текущий пароль" };
    }

    const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
    await prisma.user.update({
      where: { id: session.id },
      data: { passwordHash },
    });

    return { success: true };
  } catch {
    return { success: false, error: "Ошибка смены пароля" };
  }
}
