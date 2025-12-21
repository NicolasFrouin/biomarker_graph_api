/*
  Warnings:

  - You are about to drop the column `defaultTargetUnitId` on the `Unit` table. All the data in the column will be lost.
  - Added the required column `defaultTargetUnitId` to the `Biomarker` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Unit" DROP CONSTRAINT "Unit_defaultTargetUnitId_fkey";

-- AlterTable
ALTER TABLE "Biomarker" ADD COLUMN     "defaultTargetUnitId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Unit" DROP COLUMN "defaultTargetUnitId";

-- AddForeignKey
ALTER TABLE "Biomarker" ADD CONSTRAINT "Biomarker_defaultTargetUnitId_fkey" FOREIGN KEY ("defaultTargetUnitId") REFERENCES "BiomarkerAllowedUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
