"use server";

import { z } from "zod";
import { login, logout } from "@/lib/auth";
import { getHomeRoute } from "@/lib/rbac";
import { redirect } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(1, "Введите пароль"),
});

export async function loginAction(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const result = loginSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.errors[0]?.message || "Некорректные данные" };
  }

  const user = await login(result.data.email, result.data.password);
  if (!user) {
    return { error: "Неверный email или пароль" };
  }

  redirect(getHomeRoute(user.role));
}

export async function logoutAction() {
  await logout();
  redirect("/login");
}
