"use server";

import { revalidatePath } from "next/cache";
import {
  parseCSV,
  importAssets,
  importAccessories,
  importClients,
  importPayments,
  type ImportEntity,
  type ImportResult,
} from "@/services/import";
import { getSession } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";

export type ImportActionResult = {
  success: boolean;
  error?: string;
  result?: ImportResult;
  preview?: { headers: string[]; rows: Record<string, string>[] };
};

export async function previewCSVAction(formData: FormData): Promise<ImportActionResult> {
  const session = await getSession();
  requireRole(session, "ADMIN");
  const file = formData.get("file") as File;
  if (!file || file.size === 0) {
    return { success: false, error: "Файл не выбран" };
  }

  try {
    const content = await file.text();
    const rows = parseCSV(content);
    if (rows.length === 0) {
      return { success: false, error: "Файл пустой или некорректный" };
    }

    const headers = Object.keys(rows[0]);
    return {
      success: true,
      preview: { headers, rows: rows.slice(0, 10) },
    };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Ошибка чтения файла",
    };
  }
}

export async function executeImportAction(formData: FormData): Promise<ImportActionResult> {
  const session = await getSession();
  requireRole(session, "ADMIN");
  const file = formData.get("file") as File;
  const entity = formData.get("entity") as ImportEntity;
  const mappingJson = formData.get("mapping") as string;

  if (!file || !entity || !mappingJson) {
    return { success: false, error: "Недостаточно данных" };
  }

  try {
    const content = await file.text();
    const rows = parseCSV(content);
    const columnMap = JSON.parse(mappingJson) as Record<string, string>;

    let result: ImportResult;
    switch (entity) {
      case "assets":
        result = await importAssets(rows, columnMap);
        revalidatePath("/assets");
        break;
      case "accessories":
        result = await importAccessories(rows, columnMap);
        revalidatePath("/accessories");
        break;
      case "clients":
        result = await importClients(rows, columnMap);
        revalidatePath("/clients");
        break;
      case "payments":
        result = await importPayments(rows, columnMap);
        revalidatePath("/payments");
        break;
      default:
        return { success: false, error: "Неизвестный тип сущности" };
    }

    revalidatePath("/import");
    return { success: true, result };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Ошибка импорта",
    };
  }
}
