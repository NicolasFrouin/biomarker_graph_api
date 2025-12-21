import { PrismaClient } from 'prisma/generated/client';

export default async function seedObservation(prisma: PrismaClient) {
  const subject = await prisma.subject.findFirst();
  const analytes = await prisma.analyte.findMany({
    include: { analyteAllowedUnit: true },
  });

  for (let d = 1; d < 6; d++) {
    for (let h = 0; h < 10; h++) {
      for (const analyte of analytes) {
        const value = parseFloat((Math.random() * 100).toFixed(2));
        const measuredAt = new Date();
        measuredAt.setDate(measuredAt.getDate() - d);
        measuredAt.setHours(8 + h);
        await prisma.observation.create({
          data: {
            subjectId: subject!.id,
            analyteAllowedUnitId:
              analyte.analyteAllowedUnit[
                Math.floor(Math.random() * analyte.analyteAllowedUnit.length)
              ].id,
            analyteId: analyte.id,
            value,
            measuredAt,
            rawPayload: {},
          },
        });
      }
    }
  }

  console.log('Seeded Observations:', await prisma.observation.findMany());
}
