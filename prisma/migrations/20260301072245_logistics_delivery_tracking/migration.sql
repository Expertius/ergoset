-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "deliveryNotes" TEXT;

-- AlterTable
ALTER TABLE "delivery_tasks" ADD COLUMN     "clientNote" TEXT,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "distanceKm" DOUBLE PRECISION,
ADD COLUMN     "driveDurationMin" INTEGER,
ADD COLUMN     "floor" INTEGER,
ADD COLUMN     "fuelCost" INTEGER,
ADD COLUMN     "hasElevator" BOOLEAN,
ADD COLUMN     "logistComment" TEXT,
ADD COLUMN     "otherCost" INTEGER,
ADD COLUMN     "pointFrom" TEXT,
ADD COLUMN     "pointFromLat" DOUBLE PRECISION,
ADD COLUMN     "pointFromLng" DOUBLE PRECISION,
ADD COLUMN     "pointTo" TEXT,
ADD COLUMN     "pointToLat" DOUBLE PRECISION,
ADD COLUMN     "pointToLng" DOUBLE PRECISION,
ADD COLUMN     "salaryBase" INTEGER,
ADD COLUMN     "salaryPerKm" INTEGER,
ADD COLUMN     "salaryTotal" INTEGER,
ADD COLUMN     "startedAt" TIMESTAMP(3),
ADD COLUMN     "timeAssembly" INTEGER,
ADD COLUMN     "timeCarrying" INTEGER,
ADD COLUMN     "timeDisassembly" INTEGER,
ADD COLUMN     "timeDriving" INTEGER,
ADD COLUMN     "timeLoading" INTEGER,
ADD COLUMN     "timeUnloading" INTEGER,
ADD COLUMN     "tollCost" INTEGER,
ADD COLUMN     "totalCost" INTEGER,
ADD COLUMN     "totalTimeMin" INTEGER;

-- AlterTable
ALTER TABLE "expenses" ADD COLUMN     "deliveryTaskId" TEXT;

-- CreateTable
CREATE TABLE "delivery_comments" (
    "id" TEXT NOT NULL,
    "deliveryTaskId" TEXT NOT NULL,
    "authorId" TEXT,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "delivery_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_rates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "baseSalary" INTEGER NOT NULL DEFAULT 0,
    "perKmRate" INTEGER NOT NULL DEFAULT 0,
    "fuelPerKmRate" INTEGER NOT NULL DEFAULT 0,
    "assemblyRate" INTEGER NOT NULL DEFAULT 0,
    "disassemblyRate" INTEGER NOT NULL DEFAULT 0,
    "floorRate" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_rates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "delivery_rates_name_key" ON "delivery_rates"("name");

-- AddForeignKey
ALTER TABLE "delivery_comments" ADD CONSTRAINT "delivery_comments_deliveryTaskId_fkey" FOREIGN KEY ("deliveryTaskId") REFERENCES "delivery_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_comments" ADD CONSTRAINT "delivery_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_deliveryTaskId_fkey" FOREIGN KEY ("deliveryTaskId") REFERENCES "delivery_tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
