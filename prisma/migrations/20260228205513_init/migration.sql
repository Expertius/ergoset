-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGER', 'LOGISTICS');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('available', 'reserved', 'rented', 'maintenance', 'sold', 'archived');

-- CreateEnum
CREATE TYPE "DealType" AS ENUM ('rent', 'sale', 'rent_to_purchase', 'reservation', 'return_deal', 'exchange');

-- CreateEnum
CREATE TYPE "DealStatus" AS ENUM ('lead', 'booked', 'delivery_scheduled', 'delivered', 'active', 'extended', 'return_scheduled', 'closed_return', 'closed_purchase', 'canceled');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('cash', 'card', 'bank_transfer', 'sbp', 'other');

-- CreateEnum
CREATE TYPE "PaymentKind" AS ENUM ('rent', 'delivery', 'assembly', 'deposit', 'sale', 'refund', 'penalty', 'discount_adjustment');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('planned', 'paid', 'partially_paid', 'refunded', 'canceled');

-- CreateEnum
CREATE TYPE "RentalPeriodType" AS ENUM ('first', 'extension', 'final', 'purchase_transition');

-- CreateEnum
CREATE TYPE "DeliveryTaskType" AS ENUM ('delivery', 'pickup', 'replacement', 'maintenance_visit');

-- CreateEnum
CREATE TYPE "DeliveryTaskStatus" AS ENUM ('planned', 'in_progress', 'completed', 'canceled');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('rental_contract', 'transfer_act', 'return_act', 'buyout_doc', 'equipment_appendix');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('draft', 'generated', 'sent', 'signed', 'archived');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('asset_purchase', 'accessory_purchase', 'delivery_cost', 'assembly_cost', 'repair', 'tax', 'ads', 'other');

-- CreateEnum
CREATE TYPE "InventoryMovementType" AS ENUM ('incoming', 'reserve', 'issue', 'return_item', 'writeoff', 'repair', 'lost');

-- CreateEnum
CREATE TYPE "AccessoryCategory" AS ENUM ('bracket', 'rail', 'platform', 'block', 'cable', 'adapter', 'other');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "supabaseId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'MANAGER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "type" TEXT,
    "upholstery" TEXT,
    "color" TEXT,
    "tableType" TEXT,
    "description" TEXT,
    "purchasePrice" INTEGER,
    "dealerPrice" INTEGER,
    "retailPrice" INTEGER,
    "purchaseDate" TIMESTAMP(3),
    "status" "AssetStatus" NOT NULL DEFAULT 'available',
    "location" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accessories" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "AccessoryCategory" NOT NULL DEFAULT 'other',
    "purchasePrice" INTEGER,
    "dealerPrice" INTEGER,
    "retailPrice" INTEGER,
    "description" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accessories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" TEXT NOT NULL,
    "accessoryId" TEXT NOT NULL,
    "location" TEXT NOT NULL DEFAULT 'warehouse',
    "qtyOnHand" INTEGER NOT NULL DEFAULT 0,
    "qtyReserved" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configurations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "defaultRentPrice1m" INTEGER,
    "defaultRentPrice2m" INTEGER,
    "defaultRentPrice3m" INTEGER,
    "defaultSalePrice" INTEGER,
    "defaultDeliveryPrice" INTEGER,
    "isTemplate" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuration_lines" (
    "id" TEXT NOT NULL,
    "configurationId" TEXT NOT NULL,
    "accessoryId" TEXT,
    "assetId" TEXT,
    "qty" INTEGER NOT NULL DEFAULT 1,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "defaultPrice" INTEGER,

    CONSTRAINT "configuration_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "birthDate" TIMESTAMP(3),
    "passportSeries" TEXT,
    "passportNumber" TEXT,
    "passportIssuedBy" TEXT,
    "passportIssueDate" TIMESTAMP(3),
    "registrationAddress" TEXT,
    "actualAddress" TEXT,
    "notes" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deals" (
    "id" TEXT NOT NULL,
    "type" "DealType" NOT NULL,
    "status" "DealStatus" NOT NULL DEFAULT 'lead',
    "clientId" TEXT NOT NULL,
    "createdById" TEXT,
    "source" TEXT,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rentals" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "configurationId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "plannedMonths" INTEGER,
    "actualEndDate" TIMESTAMP(3),
    "rentAmount" INTEGER NOT NULL DEFAULT 0,
    "deliveryAmount" INTEGER NOT NULL DEFAULT 0,
    "assemblyAmount" INTEGER NOT NULL DEFAULT 0,
    "depositAmount" INTEGER NOT NULL DEFAULT 0,
    "discountAmount" INTEGER NOT NULL DEFAULT 0,
    "totalPlannedAmount" INTEGER NOT NULL DEFAULT 0,
    "closeReason" TEXT,
    "purchaseConversionAmount" INTEGER,
    "addressDelivery" TEXT,
    "addressPickup" TEXT,
    "deliveryInstructions" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rentals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rental_periods" (
    "id" TEXT NOT NULL,
    "rentalId" TEXT NOT NULL,
    "periodNumber" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "amountRent" INTEGER NOT NULL DEFAULT 0,
    "amountDelivery" INTEGER NOT NULL DEFAULT 0,
    "amountAssembly" INTEGER NOT NULL DEFAULT 0,
    "amountDiscount" INTEGER NOT NULL DEFAULT 0,
    "amountTotal" INTEGER NOT NULL DEFAULT 0,
    "type" "RentalPeriodType" NOT NULL DEFAULT 'first',
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rental_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rental_accessory_lines" (
    "id" TEXT NOT NULL,
    "rentalId" TEXT NOT NULL,
    "accessoryId" TEXT NOT NULL,
    "qty" INTEGER NOT NULL DEFAULT 1,
    "price" INTEGER NOT NULL DEFAULT 0,
    "isIncluded" BOOLEAN NOT NULL DEFAULT false,
    "comment" TEXT,

    CONSTRAINT "rental_accessory_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_tasks" (
    "id" TEXT NOT NULL,
    "rentalId" TEXT NOT NULL,
    "type" "DeliveryTaskType" NOT NULL,
    "plannedAt" TIMESTAMP(3),
    "status" "DeliveryTaskStatus" NOT NULL DEFAULT 'planned',
    "assignee" TEXT,
    "address" TEXT,
    "instructions" TEXT,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "rentalId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "method" "PaymentMethod" NOT NULL DEFAULT 'cash',
    "kind" "PaymentKind" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'planned',
    "taxReceiptUrl" TEXT,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "assetId" TEXT,
    "dealId" TEXT,
    "rentalId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "rentalId" TEXT,
    "type" "DocumentType" NOT NULL,
    "templateName" TEXT,
    "filePath" TEXT,
    "publicUrl" TEXT,
    "status" "DocumentStatus" NOT NULL DEFAULT 'draft',
    "signatureUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_movements" (
    "id" TEXT NOT NULL,
    "accessoryId" TEXT NOT NULL,
    "type" "InventoryMovementType" NOT NULL,
    "qty" INTEGER NOT NULL,
    "locationFrom" TEXT,
    "locationTo" TEXT,
    "relatedRentalId" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comment" TEXT,

    CONSTRAINT "inventory_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_supabaseId_key" ON "users"("supabaseId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "assets_code_key" ON "assets"("code");

-- CreateIndex
CREATE UNIQUE INDEX "accessories_sku_key" ON "accessories"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_accessoryId_location_key" ON "inventory_items"("accessoryId", "location");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_accessoryId_fkey" FOREIGN KEY ("accessoryId") REFERENCES "accessories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuration_lines" ADD CONSTRAINT "configuration_lines_configurationId_fkey" FOREIGN KEY ("configurationId") REFERENCES "configurations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuration_lines" ADD CONSTRAINT "configuration_lines_accessoryId_fkey" FOREIGN KEY ("accessoryId") REFERENCES "accessories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuration_lines" ADD CONSTRAINT "configuration_lines_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rentals" ADD CONSTRAINT "rentals_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "deals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rentals" ADD CONSTRAINT "rentals_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rentals" ADD CONSTRAINT "rentals_configurationId_fkey" FOREIGN KEY ("configurationId") REFERENCES "configurations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_periods" ADD CONSTRAINT "rental_periods_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "rentals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_accessory_lines" ADD CONSTRAINT "rental_accessory_lines_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "rentals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_accessory_lines" ADD CONSTRAINT "rental_accessory_lines_accessoryId_fkey" FOREIGN KEY ("accessoryId") REFERENCES "accessories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_tasks" ADD CONSTRAINT "delivery_tasks_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "rentals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "deals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "rentals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "deals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "deals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "rentals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_accessoryId_fkey" FOREIGN KEY ("accessoryId") REFERENCES "accessories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_relatedRentalId_fkey" FOREIGN KEY ("relatedRentalId") REFERENCES "rentals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
