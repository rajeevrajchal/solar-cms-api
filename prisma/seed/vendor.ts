import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.vendor.create({
    data: {
      name: 'Unknown',
      code: 'UN-O1',
      description: 'If product have no vendor or you cannot be define it.',
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async () => {
    await prisma.$disconnect();
    process.exit(1);
  });
