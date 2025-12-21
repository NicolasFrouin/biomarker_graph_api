import { PrismaClient } from 'prisma/generated/client';

export default async function seedUnit(prisma: PrismaClient) {
  const res = await prisma.unit.createManyAndReturn({
    data: [
      // glucose in blood
      { name: 'mmol/L' }, // default
      // { name: 'mg/dL' },
      // hemoglobin in blood
      { name: 'g/dL' },
      // creatinine in both blood and urine
      { name: 'mg/dL' }, // default
      { name: 'µmol/L' },
    ],
  });

  console.log('Seeded Units:', res);
}
