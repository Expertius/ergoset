"use server";

import { revalidatePath } from "next/cache";
import { clientCreateSchema, clientUpdateSchema } from "@/domain/clients/validation";
import * as clientService from "@/services/clients";
import { getSession } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";

export type ActionResult = {
  success: boolean;
  error?: string;
};

export async function createClientAction(formData: FormData): Promise<ActionResult> {
  const session = await getSession();
  requireRole(session, "ADMIN", "MANAGER");
  const raw = Object.fromEntries(formData.entries());
  const tagsRaw = formData.get("tags") as string;
  const parsed = clientCreateSchema.safeParse({
    ...raw,
    tags: tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [],
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    await clientService.createClient(parsed.data);
    revalidatePath("/clients");
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка создания клиента";
    return { success: false, error: msg };
  }
}

export async function updateClientAction(formData: FormData): Promise<ActionResult> {
  const session = await getSession();
  requireRole(session, "ADMIN", "MANAGER");
  const raw = Object.fromEntries(formData.entries());
  const tagsRaw = formData.get("tags") as string;
  const parsed = clientUpdateSchema.safeParse({
    ...raw,
    tags: tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [],
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    await clientService.updateClient(parsed.data);
    revalidatePath("/clients");
    revalidatePath(`/clients/${parsed.data.id}`);
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка обновления клиента";
    return { success: false, error: msg };
  }
}
