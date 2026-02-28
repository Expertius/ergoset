"use server";

import { login, logout } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Введите email и пароль" };
  }

  const user = await login(email, password);
  if (!user) {
    return { error: "Неверный email или пароль" };
  }

  redirect("/");
}

export async function logoutAction() {
  await logout();
  redirect("/login");
}
