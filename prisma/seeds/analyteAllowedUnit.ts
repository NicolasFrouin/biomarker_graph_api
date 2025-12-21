import { PrismaClient } from 'prisma/generated/client';

export default async function seedAnalyteAllowedUnit(prisma: PrismaClient) {
  const units = await prisma.unit.findMany();
  const analytes = await prisma.analyte.findMany();

  const res = await prisma.analyteAllowedUnit.createManyAndReturn({
    data: [
      {
        analyteId: analytes.find((a) => a.loincCode === '2339-0')!.id,
        unitId: units.find((u) => u.name === 'mmol/L')!.id,
      },
      {
        analyteId: analytes.find((a) => a.loincCode === '2339-0')!.id,
        unitId: units.find((u) => u.name === 'mg/dL')!.id,
      },
      {
        analyteId: analytes.find((a) => a.loincCode === '59260-0')!.id,
        unitId: units.find((u) => u.name === 'g/dL')!.id,
      },
      {
        analyteId: analytes.find((a) => a.loincCode === '2161-8')!.id,
        unitId: units.find((u) => u.name === 'mg/dL')!.id,
      },
      {
        analyteId: analytes.find((a) => a.loincCode === '2161-8')!.id,
        unitId: units.find((u) => u.name === 'µmol/L')!.id,
      },
      {
        analyteId: analytes.find((a) => a.loincCode === '77140-2')!.id,
        unitId: units.find((u) => u.name === 'mg/dL')!.id,
      },
      {
        analyteId: analytes.find((a) => a.loincCode === '77140-2')!.id,
        unitId: units.find((u) => u.name === 'µmol/L')!.id,
      },
    ],
  });

  console.log('Seeded AnalyteAllowedUnits:', res);
}
