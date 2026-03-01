"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import type { DocumentType, DocumentStatus } from "@/generated/prisma/browser";
import * as docService from "@/services/documents";
import { getSession } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";

export type ActionResult = {
  success: boolean;
  error?: string;
};

const VALID_DOC_TYPES: DocumentType[] = [
  "rental_contract", "transfer_act", "return_act", "buyout_doc", "equipment_appendix",
];
const VALID_DOC_STATUSES: DocumentStatus[] = [
  "draft", "generated", "sent", "signed", "archived",
];

const generateDocSchema = z.object({
  dealId: z.string().min(1),
  docType: z.enum(VALID_DOC_TYPES as [string, ...string[]]),
  rentalId: z.string().optional(),
});

const updateStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(VALID_DOC_STATUSES as [string, ...string[]]),
});

export async function generateDocumentAction(
  dealId: string,
  docType: string,
  rentalId?: string
): Promise<ActionResult> {
  const session = await getSession();
  requireRole(session, "ADMIN", "MANAGER");

  const parsed = generateDocSchema.safeParse({ dealId, docType, rentalId });
  if (!parsed.success) {
    return { success: false, error: "Некорректный тип документа" };
  }

  try {
    await docService.generateDocument(
      parsed.data.dealId,
      parsed.data.docType as DocumentType,
      parsed.data.rentalId
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

  const parsed = updateStatusSchema.safeParse({ id, status });
  if (!parsed.success) {
    return { success: false, error: "Некорректный статус" };
  }

  try {
    await docService.updateDocumentStatus(parsed.data.id, parsed.data.status as DocumentStatus);
    revalidatePath("/documents");
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка обновления статуса";
    return { success: false, error: msg };
  }
}
