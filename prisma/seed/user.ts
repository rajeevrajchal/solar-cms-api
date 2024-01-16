import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashPassword = await bcrypt.hash('123456789', 10);
  await prisma.user.upsert({
    where: { email: 'admin@studio.io' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@studio.io',
      password: hashPassword,
      role: Role.ADMIN,
      is_active: true,
      is_temp: false,
    },
  });
  await prisma.user.upsert({
    where: { email: 'sale@studio.io' },
    update: {},
    create: {
      name: 'Sale User',
      email: 'sale@studio.io',
      password: hashPassword,
      role: Role.SALE,
      is_active: true,
      is_temp: false,
    },
  });
  await prisma.user.upsert({
    where: { email: 'engineer@studio.io' },
    update: {},
    create: {
      name: 'Engineer User',
      email: 'engineer@studio.io',
      password: hashPassword,
      role: Role.ENGINEER,
      is_active: true,
      is_temp: false,
    },
  });
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
