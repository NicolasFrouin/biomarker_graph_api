/*
  Warnings:

  - You are about to drop the column `analyte` on the `Observation` table. All the data in the column will be lost.
  - You are about to drop the column `biomarkerAllowedUnitId` on the `Observation` table. All the data in the column will be lost.
  - You are about to drop the `Biomarker` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BiomarkerAllowedUnit` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `analyteAllowedUnitId` to the `Observation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `analyteId` to the `Observation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Biomarker" DROP CONSTRAINT "Biomarker_defaultTargetUnitId_fkey";

-- DropForeignKey
ALTER TABLE "BiomarkerAllowedUnit" DROP CONSTRAINT "BiomarkerAllowedUnit_biomarkerId_fkey";

-- DropForeignKey
ALTER TABLE "BiomarkerAllowedUnit" DROP CONSTRAINT "BiomarkerAllowedUnit_unitId_fkey";

-- DropForeignKey
ALTER TABLE "Observation" DROP CONSTRAINT "Observation_analyte_fkey";

-- DropForeignKey
ALTER TABLE "Observation" DROP CONSTRAINT "Observation_biomarkerAllowedUnitId_fkey";

-- AlterTable
ALTER TABLE "Observation" DROP COLUMN "analyte",
DROP COLUMN "biomarkerAllowedUnitId",
ADD COLUMN     "analyteAllowedUnitId" INTEGER NOT NULL,
ADD COLUMN     "analyteId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Biomarker";

-- DropTable
DROP TABLE "BiomarkerAllowedUnit";

-- CreateTable
CREATE TABLE "Analyte" (
    "id" SERIAL NOT NULL,
    "loincCode" TEXT,
    "name" TEXT NOT NULL,
    "longName" TEXT,
    "defaultTargetUnitId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Analyte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyteAllowedUnit" (
    "id" SERIAL NOT NULL,
    "analyteId" INTEGER NOT NULL,
    "unitId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnalyteAllowedUnit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AnalyteAllowedUnit_analyteId_unitId_key" ON "AnalyteAllowedUnit"("analyteId", "unitId");

-- AddForeignKey
ALTER TABLE "Analyte" ADD CONSTRAINT "Analyte_defaultTargetUnitId_fkey" FOREIGN KEY ("defaultTargetUnitId") REFERENCES "AnalyteAllowedUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyteAllowedUnit" ADD CONSTRAINT "AnalyteAllowedUnit_analyteId_fkey" FOREIGN KEY ("analyteId") REFERENCES "Analyte"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyteAllowedUnit" ADD CONSTRAINT "AnalyteAllowedUnit_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observation" ADD CONSTRAINT "Observation_analyteId_fkey" FOREIGN KEY ("analyteId") REFERENCES "Analyte"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observation" ADD CONSTRAINT "Observation_analyteAllowedUnitId_fkey" FOREIGN KEY ("analyteAllowedUnitId") REFERENCES "AnalyteAllowedUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
