"use server";

import { prisma } from "@/lib/db";
import { getSession, login } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function generateInviteToken(clientId: string) {
  const session = await getSession();
  requireRole(session, "ADMIN", "MANAGER");

  try {
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) return { success: false as const, error: "Клиент не найден" };
    if (!client.email) return { success: false as const, error: "У клиента не указан email" };
    if (client.userId) return { success: false as const, error: "Клиент уже имеет аккаунт" };

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.client.update({
      where: { id: clientId },
      data: { inviteToken: token, inviteExpiresAt: expiresAt },
    });

    revalidatePath("/clients");
    revalidatePath(`/clients/${clientId}`);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return {
      success: true as const,
      inviteUrl: `${baseUrl}/invite/${token}`,
      token,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка создания приглашения";
    return { success: false as const, error: msg };
  }
}

export async function validateInviteToken(token: string) {
  const client = await prisma.client.findUnique({
    where: { inviteToken: token },
    select: {
      id: true,
      fullName: true,
      email: true,
      inviteExpiresAt: true,
      userId: true,
    },
  });

  if (!client) return { valid: false, error: "Ссылка недействительна" } as const;
  if (client.userId) return { valid: false, error: "Аккаунт уже активирован" } as const;
  if (client.inviteExpiresAt && client.inviteExpiresAt < new Date()) {
    return { valid: false, error: "Срок действия ссылки истёк" } as const;
  }

  return {
    valid: true,
    clientName: client.fullName,
    clientEmail: client.email,
  } as const;
}

export async function activateClientAccount(token: string, password: string) {
  if (!password || password.length < 6) {
    return { success: false, error: "Пароль должен быть не менее 6 символов" };
  }

  const client = await prisma.client.findUnique({
    where: { inviteToken: token },
  });

  if (!client) return { success: false, error: "Ссылка недействительна" };
  if (client.userId) return { success: false, error: "Аккаунт уже активирован" };
  if (client.inviteExpiresAt && client.inviteExpiresAt < new Date()) {
    return { success: false, error: "Срок действия ссылки истёк" };
  }
  if (!client.email) return { success: false, error: "У клиента не указан email" };

  const existingUser = await prisma.user.findUnique({
    where: { email: client.email },
  });
  if (existingUser) {
    return { success: false, error: "Пользователь с таким email уже существует" };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        email: client.email!,
        passwordHash,
        fullName: client.fullName,
        role: "CLIENT",
      },
    });

    await tx.client.update({
      where: { id: client.id },
      data: {
        userId: newUser.id,
        inviteToken: null,
        inviteExpiresAt: null,
      },
    });

    return newUser;
  });

  await login(client.email, password);
  redirect("/cabinet");
}
