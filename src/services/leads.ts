import { prisma } from "@/lib/db";
import type { LeadStatus, LeadSource, Prisma } from "@/generated/prisma";
import { randomBytes } from "crypto";

// ─── LIST ───────────────────────────────────────────────

export async function getLeads(params: {
  search?: string;
  status?: LeadStatus;
  source?: LeadSource;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  assignedToId?: string;
} = {}) {
  const { search, status, source, sortBy = "createdAt", sortDir = "desc", assignedToId } = params;

  const where: Prisma.LeadWhereInput = {};
  if (assignedToId) where.assignedToId = assignedToId;
  if (status) where.status = status;
  if (source) where.source = source;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  return prisma.lead.findMany({
    where,
    include: {
      desiredAsset: { select: { id: true, code: true, name: true, status: true } },
      assignedTo: { select: { id: true, fullName: true } },
    },
    orderBy: { [sortBy]: sortDir },
    take: 200,
  });
}

// ─── GET BY ID ──────────────────────────────────────────

export async function getLeadById(id: string) {
  return prisma.lead.findUnique({
    where: { id },
    include: {
      desiredAsset: { select: { id: true, code: true, name: true, status: true, brand: true, model: true } },
      assignedTo: { select: { id: true, fullName: true, email: true } },
      convertedClient: { select: { id: true, fullName: true } },
      convertedDeal: { select: { id: true, type: true, status: true } },
    },
  });
}

// ─── CREATE ─────────────────────────────────────────────

export async function createLead(data: {
  name: string;
  phone?: string;
  email?: string;
  interest?: "rent" | "buy" | "rent_to_purchase" | "info";
  desiredAssetId?: string;
  desiredConfig?: string;
  desiredStartDate?: Date;
  desiredMonths?: number;
  source?: "website" | "phone" | "referral" | "social" | "ads" | "other";
  notes?: string;
}) {
  return prisma.lead.create({ data });
}

// ─── UPDATE ─────────────────────────────────────────────

export async function updateLead(id: string, data: Prisma.LeadUpdateInput) {
  return prisma.lead.update({ where: { id }, data });
}

// ─── CONTRACT TOKEN ─────────────────────────────────────

export async function generateContractToken(leadId: string) {
  const token = randomBytes(32).toString("hex");
  return prisma.lead.update({
    where: { id: leadId },
    data: { contractToken: token, status: "contract_pending" },
  });
}

// ─── GET BY CONTRACT TOKEN ──────────────────────────────

export async function getLeadByContractToken(token: string) {
  return prisma.lead.findUnique({
    where: { contractToken: token },
    include: {
      desiredAsset: { select: { code: true, name: true } },
    },
  });
}

// ─── SAVE CONTRACT DATA ─────────────────────────────────

export async function saveContractData(token: string, contractData: Record<string, unknown>) {
  return prisma.lead.update({
    where: { contractToken: token },
    data: { contractData, status: "contract_filled" },
  });
}

// ─── CONVERT TO DEAL ────────────────────────────────────

export async function convertLeadToDeal(leadId: string, userId: string) {
  const lead = await prisma.lead.findUniqueOrThrow({
    where: { id: leadId },
  });

  if (lead.status === "converted") throw new Error("Лид уже конвертирован");

  const contractInfo = lead.contractData as Record<string, string> | null;
  const clientName = contractInfo?.fullName || lead.name;

  return prisma.$transaction(async (tx) => {
    const client = await tx.client.create({
      data: {
        fullName: clientName,
        phone: contractInfo?.phone || lead.phone || undefined,
        email: contractInfo?.email || lead.email || undefined,
        passportSeries: contractInfo?.passportSeries || undefined,
        passportNumber: contractInfo?.passportNumber || undefined,
        passportIssuedBy: contractInfo?.passportIssuedBy || undefined,
        passportIssueDate: contractInfo?.passportIssueDate
          ? new Date(contractInfo.passportIssueDate)
          : undefined,
        registrationAddress: contractInfo?.registrationAddress || undefined,
        actualAddress: contractInfo?.actualAddress || undefined,
        deliveryNotes: contractInfo?.deliveryNotes || undefined,
      },
    });

    const dealType = lead.interest === "buy"
      ? "sale"
      : lead.interest === "rent_to_purchase"
        ? "rent_to_purchase"
        : "rent";

    const deal = await tx.deal.create({
      data: {
        type: dealType as "rent" | "sale" | "rent_to_purchase",
        status: "lead",
        clientId: client.id,
        createdById: userId,
        source: lead.source,
        comment: lead.notes || undefined,
      },
    });

    await tx.lead.update({
      where: { id: leadId },
      data: {
        status: "converted",
        convertedClientId: client.id,
        convertedDealId: deal.id,
        convertedAt: new Date(),
      },
    });

    return { client, deal };
  });
}

// ─── STATS ──────────────────────────────────────────────

export async function getLeadStats(params: { assignedToId?: string } = {}) {
  const scope = params.assignedToId ? { assignedToId: params.assignedToId } : {};
  const [total, newCount, contactedCount, qualifiedCount, convertedCount] = await Promise.all([
    prisma.lead.count({ where: scope }),
    prisma.lead.count({ where: { ...scope, status: "new" } }),
    prisma.lead.count({ where: { ...scope, status: "contacted" } }),
    prisma.lead.count({ where: { ...scope, status: "qualified" } }),
    prisma.lead.count({ where: { ...scope, status: "converted" } }),
  ]);
  return { total, new: newCount, contacted: contactedCount, qualified: qualifiedCount, converted: convertedCount };
}

// ─── PUBLIC: AVAILABLE STATIONS ─────────────────────────

export async function getPublicStations() {
  const thirtyDaysOut = new Date();
  thirtyDaysOut.setDate(thirtyDaysOut.getDate() + 30);

  const [available, soonAvailable] = await Promise.all([
    prisma.asset.findMany({
      where: { status: "available", isActive: true },
      select: {
        id: true,
        code: true,
        name: true,
        brand: true,
        model: true,
        type: true,
        upholstery: true,
        color: true,
        description: true,
      },
    }),
    prisma.rental.findMany({
      where: {
        endDate: { lte: thirtyDaysOut, gte: new Date() },
        deal: { status: { in: ["active", "extended"] } },
      },
      select: {
        endDate: true,
        asset: {
          select: {
            id: true,
            code: true,
            name: true,
            brand: true,
            model: true,
            type: true,
            upholstery: true,
            color: true,
            description: true,
          },
        },
      },
      orderBy: { endDate: "asc" },
    }),
  ]);

  const availableStations = available.map((a) => ({
    ...a,
    availability: "available" as const,
    availableFrom: null as Date | null,
  }));

  const soonIds = new Set(available.map((a) => a.id));
  const soonStations = soonAvailable
    .filter((r) => !soonIds.has(r.asset.id))
    .map((r) => ({
      ...r.asset,
      availability: "soon" as const,
      availableFrom: r.endDate,
    }));

  return [...availableStations, ...soonStations];
}
