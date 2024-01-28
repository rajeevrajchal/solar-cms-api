import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: 'guest_customer@studio.io' },
    update: {},
    create: {
      name: 'Guest Customer',
      email: 'guest@studio.io',
      role: Role.CUSTOMER,
      type: 'guest',
      password: '',
      is_active: true,
      is_temp: false,
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
