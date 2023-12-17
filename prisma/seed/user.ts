import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashPassword = await bcrypt.hash('123456789', 10);
  await prisma.user.upsert({
    where: { email: 'admin@eco-spark.io' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@eco-spark.io',
      password: hashPassword,
      role: Role.ADMIN,
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
