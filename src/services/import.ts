import { prisma } from "@/lib/db";

export type ImportEntity = "assets" | "accessories" | "clients" | "payments";

type ImportRow = Record<string, string>;

export type ImportResult = {
  total: number;
  imported: number;
  errors: { row: number; message: string }[];
};

export function parseCSV(content: string): ImportRow[] {
  const lines = content.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows: ImportRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: ImportRow = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || "";
    });
    rows.push(row);
  }

  return rows;
}

export async function importAssets(
  rows: ImportRow[],
  columnMap: Record<string, string>
): Promise<ImportResult> {
  const result: ImportResult = { total: rows.length, imported: 0, errors: [] };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      const code = row[columnMap["code"]] || "";
      const name = row[columnMap["name"]] || "";
      if (!code || !name) {
        result.errors.push({ row: i + 2, message: "Код и название обязательны" });
        continue;
      }

      await prisma.asset.upsert({
        where: { code },
        create: {
          code,
          name,
          brand: row[columnMap["brand"]] || undefined,
          model: row[columnMap["model"]] || undefined,
          type: row[columnMap["type"]] || undefined,
          color: row[columnMap["color"]] || undefined,
          upholstery: row[columnMap["upholstery"]] || undefined,
          tableType: row[columnMap["tableType"]] || undefined,
          location: row[columnMap["location"]] || undefined,
          notes: row[columnMap["notes"]] || undefined,
          purchasePrice: row[columnMap["purchasePrice"]]
            ? parseInt(row[columnMap["purchasePrice"]])
            : undefined,
          retailPrice: row[columnMap["retailPrice"]]
            ? parseInt(row[columnMap["retailPrice"]])
            : undefined,
        },
        update: {
          name,
          brand: row[columnMap["brand"]] || undefined,
          model: row[columnMap["model"]] || undefined,
          color: row[columnMap["color"]] || undefined,
        },
      });
      result.imported++;
    } catch (e) {
      result.errors.push({
        row: i + 2,
        message: e instanceof Error ? e.message : "Unknown error",
      });
    }
  }

  return result;
}

export async function importAccessories(
  rows: ImportRow[],
  columnMap: Record<string, string>
): Promise<ImportResult> {
  const result: ImportResult = { total: rows.length, imported: 0, errors: [] };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      const sku = row[columnMap["sku"]] || "";
      const name = row[columnMap["name"]] || "";
      if (!sku || !name) {
        result.errors.push({ row: i + 2, message: "SKU и название обязательны" });
        continue;
      }

      await prisma.accessory.upsert({
        where: { sku },
        create: {
          sku,
          name,
          category: (row[columnMap["category"]] as "bracket" | "rail" | "platform" | "block" | "cable" | "adapter" | "other") || "other",
          description: row[columnMap["description"]] || undefined,
          purchasePrice: row[columnMap["purchasePrice"]]
            ? parseInt(row[columnMap["purchasePrice"]])
            : undefined,
          retailPrice: row[columnMap["retailPrice"]]
            ? parseInt(row[columnMap["retailPrice"]])
            : undefined,
        },
        update: { name },
      });
      result.imported++;
    } catch (e) {
      result.errors.push({
        row: i + 2,
        message: e instanceof Error ? e.message : "Unknown error",
      });
    }
  }

  return result;
}

export async function importClients(
  rows: ImportRow[],
  columnMap: Record<string, string>
): Promise<ImportResult> {
  const result: ImportResult = { total: rows.length, imported: 0, errors: [] };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      const fullName = row[columnMap["fullName"]] || "";
      if (!fullName) {
        result.errors.push({ row: i + 2, message: "ФИО обязательно" });
        continue;
      }

      await prisma.client.create({
        data: {
          fullName,
          phone: row[columnMap["phone"]] || undefined,
          email: row[columnMap["email"]] || undefined,
          registrationAddress: row[columnMap["registrationAddress"]] || undefined,
          actualAddress: row[columnMap["actualAddress"]] || undefined,
          notes: row[columnMap["notes"]] || undefined,
          passportSeries: row[columnMap["passportSeries"]] || undefined,
          passportNumber: row[columnMap["passportNumber"]] || undefined,
        },
      });
      result.imported++;
    } catch (e) {
      result.errors.push({
        row: i + 2,
        message: e instanceof Error ? e.message : "Unknown error",
      });
    }
  }

  return result;
}

export async function importPayments(
  rows: ImportRow[],
  columnMap: Record<string, string>
): Promise<ImportResult> {
  const result: ImportResult = { total: rows.length, imported: 0, errors: [] };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      const dealId = row[columnMap["dealId"]] || "";
      const amount = parseInt(row[columnMap["amount"]] || "0");
      if (!dealId || !amount) {
        result.errors.push({ row: i + 2, message: "dealId и amount обязательны" });
        continue;
      }

      await prisma.payment.create({
        data: {
          dealId,
          date: row[columnMap["date"]] ? new Date(row[columnMap["date"]]) : new Date(),
          amount,
          kind: (row[columnMap["kind"]] as "rent" | "delivery" | "assembly" | "deposit" | "sale" | "refund" | "penalty" | "discount_adjustment") || "rent",
          method: (row[columnMap["method"]] as "cash" | "card" | "bank_transfer" | "sbp" | "other") || "cash",
          status: (row[columnMap["status"]] as "planned" | "paid" | "partially_paid" | "refunded" | "canceled") || "paid",
          comment: row[columnMap["comment"]] || undefined,
        },
      });
      result.imported++;
    } catch (e) {
      result.errors.push({
        row: i + 2,
        message: e instanceof Error ? e.message : "Unknown error",
      });
    }
  }

  return result;
}
