"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function updateClientProfileAction(
  clientId: string,
  data: { phone?: string; actualAddress?: string }
) {
  const session = await getSession();
  requireRole(session, "CLIENT");

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client || client.userId !== session.id) {
    return { success: false, error: "Недостаточно прав" };
  }

  try {
    await prisma.client.update({
      where: { id: clientId },
      data: {
        phone: data.phone,
        actualAddress: data.actualAddress,
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

  if (newPassword.length < 6) {
    return { success: false, error: "Пароль должен быть не менее 6 символов" };
  }

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) return { success: false, error: "Пользователь не найден" };

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    return { success: false, error: "Неверный текущий пароль" };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: session.id },
    data: { passwordHash },
  });

  return { success: true };
}
