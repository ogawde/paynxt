
import { PrismaClient, UserType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const consumer1 = await prisma.user.upsert({
    where: { email: "consumer1@example.com" },
    update: {},
    create: {
      email: "consumer1@example.com",
      passwordHash,
      userType: UserType.CONSUMER,
      balance: 1000000, 
    },
  });

  const consumer2 = await prisma.user.upsert({
    where: { email: "consumer2@example.com" },
    update: {},
    create: {
      email: "consumer2@example.com",
      passwordHash,
      userType: UserType.CONSUMER,
      balance: 1000000,
    },
  });

  const merchant1 = await prisma.user.upsert({
    where: { email: "merchant1@example.com" },
    update: {},
    create: {
      email: "merchant1@example.com",
      passwordHash,
      userType: UserType.MERCHANT,
      balance: 1000000,
    },
  });

  const merchant2 = await prisma.user.upsert({
    where: { email: "merchant2@example.com" },
    update: {},
    create: {
      email: "merchant2@example.com",
      passwordHash,
      userType: UserType.MERCHANT,
      balance: 1000000,
    },
  });
}

main()
  .catch((e) => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

