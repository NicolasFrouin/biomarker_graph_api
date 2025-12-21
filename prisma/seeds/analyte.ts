import { PrismaClient } from 'prisma/generated/client';

export default async function seedAnalyte(prisma: PrismaClient) {
  const units = await prisma.unit.findMany();

  const res = await prisma.analyte.createManyAndReturn({
    data: [
      {
        name: 'glucose',
        loincCode: '2339-0',
        longName: 'Glucose [Mass/volume] in Blood',
        defaultTargetUnitId: units.find((u) => u.name === 'mmol/L')!.id,
      },
      {
        name: 'hemoglobin',
        loincCode: '59260-0',
        longName: 'Hemoglobin [Moles/volume] in Blood',
        defaultTargetUnitId: units.find((u) => u.name === 'g/dL')!.id,
      },
      {
        name: 'creatinine',
        loincCode: '2161-8',
        longName: 'Creatinine [Mass/volume] in Urine',
        defaultTargetUnitId: units.find((u) => u.name === 'mg/dL')!.id,
      },
      {
        name: 'creatinine',
        loincCode: '77140-2',
        longName: 'Creatinine [Moles/volume] in Serum, Plasma or Blood',
        defaultTargetUnitId: units.find((u) => u.name === 'mg/dL')!.id,
      },
    ],
  });

  console.log('Seeded Analytes:', res);
}
