-- CreateTable
CREATE TABLE "upholstery_materials" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "surchargePrice" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "upholstery_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "upholstery_colors" (
    "id" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "upholstery_colors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_catalog" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "cities" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_catalog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "upholstery_materials_code_key" ON "upholstery_materials"("code");

-- CreateIndex
CREATE UNIQUE INDEX "upholstery_colors_materialId_code_key" ON "upholstery_colors"("materialId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "service_catalog_code_key" ON "service_catalog"("code");

-- AddForeignKey
ALTER TABLE "upholstery_colors" ADD CONSTRAINT "upholstery_colors_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "upholstery_materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;
