"use server";

import { revalidatePath } from "next/cache";
import { leadUpdateSchema } from "@/domain/leads/validation";
import {
  updateLead as updateLeadService,
  generateContractToken,
  convertLeadToDeal,
} from "@/services/leads";
import { getSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { requireRole } from "@/lib/rbac";

export async function updateLeadAction(id: string, formData: FormData) {
  const session = await getSession();
  requireRole(session, "ADMIN", "MANAGER");
  try {
    const raw = Object.fromEntries(formData.entries());
    const parsed = leadUpdateSchema.parse(raw);
    const lead = await updateLeadService(id, {
      ...parsed,
      ...(parsed.status === "contacted" ? { contactedAt: new Date() } : {}),
    });
    await logAudit("Lead", id, "update", parsed as unknown as Record<string, unknown>);
    revalidatePath("/leads");
    revalidatePath(`/leads/${id}`);
    return { success: true, lead };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Ошибка обновления" };
  }
}

export async function assignLeadAction(id: string, assignedToId: string | null) {
  const session = await getSession();
  requireRole(session, "ADMIN", "MANAGER");
  try {
    await updateLeadService(id, { assignedToId });
    await logAudit("Lead", id, "assign", { assignedToId });
    revalidatePath("/leads");
    revalidatePath(`/leads/${id}`);
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Ошибка" };
  }
}

export async function sendContractFormAction(leadId: string) {
  const session = await getSession();
  requireRole(session, "ADMIN", "MANAGER");
  try {
    const lead = await generateContractToken(leadId);
    await logAudit("Lead", leadId, "send_contract_form", { contractToken: lead.contractToken });
    revalidatePath("/leads");
    revalidatePath(`/leads/${leadId}`);
    return { success: true, contractToken: lead.contractToken };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Ошибка" };
  }
}

export async function convertLeadAction(leadId: string) {
  const user = await getSession();
  requireRole(user, "ADMIN", "MANAGER");
  try {
    const { client, deal } = await convertLeadToDeal(leadId, user.id);
    await logAudit("Lead", leadId, "convert", { clientId: client.id, dealId: deal.id });
    revalidatePath("/leads");
    revalidatePath(`/leads/${leadId}`);
    revalidatePath("/deals");
    revalidatePath("/clients");
    return { success: true, clientId: client.id, dealId: deal.id };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Ошибка конвертации" };
  }
}

export async function rejectLeadAction(leadId: string, reason?: string) {
  const session = await getSession();
  requireRole(session, "ADMIN", "MANAGER");
  try {
    await updateLeadService(leadId, {
      status: "rejected",
      managerNotes: reason || undefined,
    });
    await logAudit("Lead", leadId, "reject", { reason });
    revalidatePath("/leads");
    revalidatePath(`/leads/${leadId}`);
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Ошибка" };
  }
}

export async function changeLeadStatusAction(leadId: string, status: string) {
  const session = await getSession();
  requireRole(session, "ADMIN", "MANAGER");
  try {
    await updateLeadService(leadId, {
      status: status as "new" | "contacted" | "qualified" | "negotiation" | "contract_pending" | "contract_filled" | "converted" | "rejected",
      ...(status === "contacted" ? { contactedAt: new Date() } : {}),
    });
    await logAudit("Lead", leadId, "status_change", { status });
    revalidatePath("/leads");
    revalidatePath(`/leads/${leadId}`);
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Ошибка" };
  }
}
