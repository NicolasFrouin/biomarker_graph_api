/*
  Warnings:

  - You are about to drop the column `biomarkerAllowedUnitsId` on the `Observation` table. All the data in the column will be lost.
  - You are about to drop the `BiomarkerAllowedUnits` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Units` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `biomarkerAllowedUnitId` to the `Observation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BiomarkerAllowedUnits" DROP CONSTRAINT "BiomarkerAllowedUnits_biomarkerId_fkey";

-- DropForeignKey
ALTER TABLE "BiomarkerAllowedUnits" DROP CONSTRAINT "BiomarkerAllowedUnits_unitsId_fkey";

-- DropForeignKey
ALTER TABLE "Observation" DROP CONSTRAINT "Observation_biomarkerAllowedUnitsId_fkey";

-- DropForeignKey
ALTER TABLE "Units" DROP CONSTRAINT "Units_defaultTargetUnitId_fkey";

-- AlterTable
ALTER TABLE "Biomarker" ADD COLUMN     "longName" TEXT;

-- AlterTable
ALTER TABLE "Observation" DROP COLUMN "biomarkerAllowedUnitsId",
ADD COLUMN     "biomarkerAllowedUnitId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "BiomarkerAllowedUnits";

-- DropTable
DROP TABLE "Units";

-- CreateTable
CREATE TABLE "Unit" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "defaultTargetUnitId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BiomarkerAllowedUnit" (
    "id" SERIAL NOT NULL,
    "biomarkerId" INTEGER NOT NULL,
    "unitId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BiomarkerAllowedUnit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Unit_name_key" ON "Unit"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BiomarkerAllowedUnit_biomarkerId_unitId_key" ON "BiomarkerAllowedUnit"("biomarkerId", "unitId");

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_defaultTargetUnitId_fkey" FOREIGN KEY ("defaultTargetUnitId") REFERENCES "BiomarkerAllowedUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiomarkerAllowedUnit" ADD CONSTRAINT "BiomarkerAllowedUnit_biomarkerId_fkey" FOREIGN KEY ("biomarkerId") REFERENCES "Biomarker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiomarkerAllowedUnit" ADD CONSTRAINT "BiomarkerAllowedUnit_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observation" ADD CONSTRAINT "Observation_biomarkerAllowedUnitId_fkey" FOREIGN KEY ("biomarkerAllowedUnitId") REFERENCES "BiomarkerAllowedUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
