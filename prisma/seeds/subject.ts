import { PrismaClient } from 'prisma/generated/client';

export default async function seedSubject(prisma: PrismaClient) {
  const res = await prisma.subject.createManyAndReturn({
    data: [
      {
        firstname: 'Marc',
        lastname: 'Dupont',
      },
    ],
  });

  console.log('Seeded Subject:', res);
}
