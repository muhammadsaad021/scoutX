import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({ log: ['warn', 'error'] });

async function main() {

  const existingAdmin = await prisma.users.findFirst({
    where: { Email: 'admin@scoutx.com' },
  });

  if (existingAdmin) {
    console.log('Admin user already exists. Skipping seed.');
    return;
  }

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.users.create({
    data: {
      Name: 'System Admin',
      Email: 'admin@scoutx.com',
      PasswordHash: hashedPassword,
      Role: 'Admin',
    },
  });

  console.log(`Successfully created Admin User: ${admin.Email}`);
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
