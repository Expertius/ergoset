import { prisma } from "@/lib/db";
import type { DocumentType, DocumentStatus } from "@/generated/prisma/browser";
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import * as fs from "fs/promises";
import * as path from "path";
import { formatDate, formatCurrency } from "@/lib/utils";

const TEMPLATES_DIR = path.join(process.cwd(), "templates");
const OUTPUT_DIR = path.join(process.cwd(), "generated-docs");

const TEMPLATE_MAP: Record<string, string> = {
  rental_contract: "rental-contract.docx",
  transfer_act: "transfer-act.docx",
  return_act: "return-act.docx",
  buyout_doc: "buyout-doc.docx",
  equipment_appendix: "equipment-appendix.docx",
};

export type DocumentFilters = {
  dealId?: string;
  type?: DocumentType;
  status?: DocumentStatus;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  scopeByManagerId?: string;
};

export async function getDocuments(filters?: DocumentFilters) {
  const where: Record<string, unknown> = {};
  if (filters?.dealId) where.dealId = filters.dealId;
  if (filters?.type) where.type = filters.type;
  if (filters?.status) where.status = filters.status;
  if (filters?.scopeByManagerId) {
    where.deal = { ...((where.deal as Record<string, unknown>) || {}), createdById: filters.scopeByManagerId };
  }

  const sortField = filters?.sortBy || "createdAt";
  const sortDir = filters?.sortOrder || "desc";
  const validFields = ["createdAt", "type", "status"];
  const orderBy = validFields.includes(sortField)
    ? { [sortField]: sortDir }
    : { createdAt: "desc" as const };

  return prisma.document.findMany({
    where,
    include: {
      deal: { include: { client: true } },
      rental: { include: { asset: true } },
    },
    orderBy,
    take: 200,
  });
}

export async function generateDocument(
  dealId: string,
  docType: DocumentType,
  rentalId?: string
) {
  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    include: {
      client: true,
      rentals: {
        include: {
          asset: true,
          periods: { orderBy: { periodNumber: "asc" } },
          accessories: { include: { accessory: true } },
        },
      },
    },
  });

  if (!deal) throw new Error("Сделка не найдена");

  const rental = rentalId
    ? deal.rentals.find((r) => r.id === rentalId)
    : deal.rentals[0];

  const templateName = TEMPLATE_MAP[docType];
  const templatePath = path.join(TEMPLATES_DIR, templateName);

  let filePath: string | undefined;

  const templateExists = await fs.access(templatePath).then(() => true).catch(() => false);
  if (templateExists) {
    const content = await fs.readFile(templatePath, "binary");
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    const data = {
      client_name: deal.client.fullName,
      client_phone: deal.client.phone || "",
      client_email: deal.client.email || "",
      client_passport_series: deal.client.passportSeries || "",
      client_passport_number: deal.client.passportNumber || "",
      client_passport_issued_by: deal.client.passportIssuedBy || "",
      client_passport_issue_date: deal.client.passportIssueDate
        ? formatDate(deal.client.passportIssueDate)
        : "",
      client_registration_address: deal.client.registrationAddress || "",
      client_actual_address: deal.client.actualAddress || "",
      deal_type: deal.type,
      deal_date: formatDate(deal.createdAt),
      asset_code: rental?.asset.code || "",
      asset_name: rental?.asset.name || "",
      asset_brand: rental?.asset.brand || "",
      asset_model: rental?.asset.model || "",
      start_date: rental ? formatDate(rental.startDate) : "",
      end_date: rental ? formatDate(rental.endDate) : "",
      planned_months: rental?.plannedMonths?.toString() || "",
      rent_amount: rental ? formatCurrency(rental.rentAmount) : "",
      delivery_amount: rental ? formatCurrency(rental.deliveryAmount) : "",
      assembly_amount: rental ? formatCurrency(rental.assemblyAmount) : "",
      deposit_amount: rental ? formatCurrency(rental.depositAmount) : "",
      discount_amount: rental ? formatCurrency(rental.discountAmount) : "",
      total_amount: rental ? formatCurrency(rental.totalPlannedAmount) : "",
      delivery_address: rental?.addressDelivery || "",
      accessories: rental?.accessories.map((a) => ({
        name: a.accessory.name,
        qty: a.qty.toString(),
        price: formatCurrency(a.price),
      })) || [],
    };

    doc.render(data);

    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    const fileName = `${docType}-${deal.id.slice(0, 8)}-${Date.now()}.docx`;
    filePath = path.join(OUTPUT_DIR, fileName);
    const buf = doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });
    await fs.writeFile(filePath, buf);
  }

  const document = await prisma.document.create({
    data: {
      dealId,
      rentalId: rental?.id,
      type: docType,
      templateName: templateName,
      filePath: filePath || null,
      status: filePath ? "generated" : "draft",
    },
  });

  return document;
}

export async function updateDocumentStatus(
  id: string,
  status: DocumentStatus
) {
  return prisma.document.update({
    where: { id },
    data: { status },
  });
}
