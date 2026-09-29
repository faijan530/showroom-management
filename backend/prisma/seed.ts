import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const phone = process.env.SUPERADMIN_PHONE;
  const password = process.env.SUPERADMIN_PASSWORD;
  const fullName = process.env.SUPERADMIN_NAME;
  const email = process.env.SUPERADMIN_EMAIL || null;

  if (!phone || !password || !fullName) {
    throw new Error(
      'Missing required Superadmin environment variables. Please configure SUPERADMIN_PHONE, SUPERADMIN_PASSWORD, and SUPERADMIN_NAME in backend/.env'
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const superadmin = await prisma.user.upsert({
    where: { phone },
    update: {
      fullName,
      email,
      passwordHash,
      role: UserRole.SUPERADMIN,
    },
    create: {
      phone,
      fullName,
      email,
      passwordHash,
      role: UserRole.SUPERADMIN,
    },
  });

  console.log('Superadmin user seeded successfully from environment variables:');
  console.log(`- ID: ${superadmin.id}`);
  console.log(`- Phone: ${superadmin.phone}`);
  console.log(`- Name: ${superadmin.fullName}`);
  console.log(`- Email: ${superadmin.email || 'N/A'}`);
  console.log(`- Role: ${superadmin.role}`);
}

main()
  .catch((e) => {
    console.error('Error seeding superadmin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
