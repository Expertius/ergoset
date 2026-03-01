-- AlterTable
ALTER TABLE "deals" ADD COLUMN     "parentDealId" TEXT;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_parentDealId_fkey" FOREIGN KEY ("parentDealId") REFERENCES "deals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
