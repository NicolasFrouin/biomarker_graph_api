-- CreateEnum
CREATE TYPE "Trend" AS ENUM ('RISING', 'FALLING', 'STABLE');

-- CreateTable
CREATE TABLE "Subject" (
    "id" SERIAL NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Biomarker" (
    "id" SERIAL NOT NULL,
    "loincCode" TEXT,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Biomarker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Units" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "defaultTargetUnitId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BiomarkerAllowedUnits" (
    "id" SERIAL NOT NULL,
    "biomarkerId" INTEGER NOT NULL,
    "unitsId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BiomarkerAllowedUnits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Observation" (
    "id" SERIAL NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "biomarkerAllowedUnitsId" INTEGER NOT NULL,
    "analyte" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "measuredAt" TIMESTAMP(3) NOT NULL,
    "rawPayload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Observation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Units_name_key" ON "Units"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BiomarkerAllowedUnits_biomarkerId_unitsId_key" ON "BiomarkerAllowedUnits"("biomarkerId", "unitsId");

-- AddForeignKey
ALTER TABLE "Units" ADD CONSTRAINT "Units_defaultTargetUnitId_fkey" FOREIGN KEY ("defaultTargetUnitId") REFERENCES "BiomarkerAllowedUnits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiomarkerAllowedUnits" ADD CONSTRAINT "BiomarkerAllowedUnits_biomarkerId_fkey" FOREIGN KEY ("biomarkerId") REFERENCES "Biomarker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiomarkerAllowedUnits" ADD CONSTRAINT "BiomarkerAllowedUnits_unitsId_fkey" FOREIGN KEY ("unitsId") REFERENCES "Units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observation" ADD CONSTRAINT "Observation_analyte_fkey" FOREIGN KEY ("analyte") REFERENCES "Biomarker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observation" ADD CONSTRAINT "Observation_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observation" ADD CONSTRAINT "Observation_biomarkerAllowedUnitsId_fkey" FOREIGN KEY ("biomarkerAllowedUnitsId") REFERENCES "BiomarkerAllowedUnits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
