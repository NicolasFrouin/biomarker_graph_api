-- DropForeignKey
ALTER TABLE "Analyte" DROP CONSTRAINT "Analyte_defaultTargetUnitId_fkey";

-- CreateIndex
CREATE INDEX "Analyte_loincCode_idx" ON "Analyte"("loincCode");

-- CreateIndex
CREATE INDEX "Unit_name_idx" ON "Unit"("name");

-- AddForeignKey
ALTER TABLE "Analyte" ADD CONSTRAINT "Analyte_defaultTargetUnitId_fkey" FOREIGN KEY ("defaultTargetUnitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
