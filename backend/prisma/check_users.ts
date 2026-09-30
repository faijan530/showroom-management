import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  const users = await prisma.user.findMany({
    select: { id: true, phone: true, fullName: true, role: true, email: true },
  });
  console.log('Existing Users in Database:', JSON.stringify(users, null, 2));
}

checkUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
