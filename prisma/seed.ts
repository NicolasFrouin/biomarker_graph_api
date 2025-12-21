import seedUnit from './seeds/unit';
import seedSubject from './seeds/subject';
import seedAnalyte from './seeds/analyte';
import seedAnalyteAllowedUnit from './seeds/analyteAllowedUnit';
import seedObservation from './seeds/observation';
import { PrismaClient } from './generated/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

async function main() {
  await seedSubject(prisma);
  await seedUnit(prisma);
  await seedAnalyte(prisma);
  await seedAnalyteAllowedUnit(prisma);
  await seedObservation(prisma);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
