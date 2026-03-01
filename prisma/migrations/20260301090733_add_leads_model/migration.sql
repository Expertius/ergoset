-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('new', 'contacted', 'qualified', 'negotiation', 'contract_pending', 'contract_filled', 'converted', 'rejected');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('website', 'phone', 'referral', 'social', 'ads', 'other');

-- CreateEnum
CREATE TYPE "LeadInterest" AS ENUM ('rent', 'buy', 'rent_to_purchase', 'info');

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "interest" "LeadInterest" NOT NULL DEFAULT 'rent',
    "desiredAssetId" TEXT,
    "desiredConfig" TEXT,
    "desiredStartDate" TIMESTAMP(3),
    "desiredMonths" INTEGER,
    "source" "LeadSource" NOT NULL DEFAULT 'website',
    "status" "LeadStatus" NOT NULL DEFAULT 'new',
    "notes" TEXT,
    "managerNotes" TEXT,
    "assignedToId" TEXT,
    "contractToken" TEXT,
    "contractData" JSONB,
    "convertedClientId" TEXT,
    "convertedDealId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "contactedAt" TIMESTAMP(3),
    "convertedAt" TIMESTAMP(3),

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "leads_contractToken_key" ON "leads"("contractToken");

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_desiredAssetId_fkey" FOREIGN KEY ("desiredAssetId") REFERENCES "assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_convertedClientId_fkey" FOREIGN KEY ("convertedClientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_convertedDealId_fkey" FOREIGN KEY ("convertedDealId") REFERENCES "deals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
