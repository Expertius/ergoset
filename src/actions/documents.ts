"use server";

import { revalidatePath } from "next/cache";
import type { DocumentType, DocumentStatus } from "@/generated/prisma/browser";
import * as docService from "@/services/documents";
import { getSession } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";

export type ActionResult = {
  success: boolean;
  error?: string;
};

export async function generateDocumentAction(
  dealId: string,
  docType: string,
  rentalId?: string
): Promise<ActionResult> {
  const session = await getSession();
  requireRole(session, "ADMIN", "MANAGER");
  try {
    await docService.generateDocument(
      dealId,
      docType as DocumentType,
      rentalId
    );
    revalidatePath("/documents");
    revalidatePath(`/deals/${dealId}`);
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка генерации документа";
    return { success: false, error: msg };
  }
}

export async function updateDocumentStatusAction(
  id: string,
  status: string
): Promise<ActionResult> {
  const session = await getSession();
  requireRole(session, "ADMIN", "MANAGER");
  try {
    await docService.updateDocumentStatus(id, status as DocumentStatus);
    revalidatePath("/documents");
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка обновления статуса";
    return { success: false, error: msg };
  }
}
