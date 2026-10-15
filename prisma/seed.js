// import "dotenv/config";
// import {PrismaPg} from "@prisma/adapter-pg";
// import {PrismaClient} from "../generated/prisma/client.ts";
// const adapter = new PrismaPg({
//     connectionString: process.env.DATABASE_URL,
//     max:10,
//     connectTimeoutMillis:5000,
// })
// const prisma = new PrismaClient({ adapter });
// async function main(){
//     const roles = [
//         { name: "admin" },
//         { name: "user" },
//         { name: "manager" }
//     ];
//     for (const role of roles) {
//         await prisma.role.upsert({
//             where: { name: role.name },
//             update: {},
//             create: role,
//         });
//     }
// }
// main().catch((e) => {
//     console.error(e);
//     process.exit(1);
// }).finally(async () => {
//     await prisma.$disconnect();
// });

import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../src/config/database.js";

async function main() {
  const userRole = await prisma.role.upsert({
    where: {
      name: "USER",
    },
    update: {},
    create: {
      name: "USER",
    },
  });

  const adminRole = await prisma.role.upsert({
    where: {
      name: "ADMIN",
    },
    update: {},
    create: {
      name: "ADMIN",
    },
  });

  const adminPasswordHash = await bcrypt.hash(
    "Admin@12345",
    12
  );

  const userPasswordHash = await bcrypt.hash(
    "User@12345",
    12
  );

  const admin = await prisma.user.upsert({
    where: {
      email: "admin@example.com",
    },
    update: {
      passwordHash: adminPasswordHash,
      isActive: true,
    },
    create: {
      name: "Practice Admin",
      email: "admin@example.com",
      passwordHash: adminPasswordHash,
    },
  });

  const normalUser = await prisma.user.upsert({
    where: {
      email: "user@example.com",
    },
    update: {
      passwordHash: userPasswordHash,
      isActive: true,
    },
    create: {
      name: "Practice User",
      email: "user@example.com",
      passwordHash: userPasswordHash,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: admin.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      roleId: adminRole.id,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: normalUser.id,
        roleId: userRole.id,
      },
    },
    update: {},
    create: {
      userId: normalUser.id,
      roleId: userRole.id,
    },
  });

  console.log("Seed completed");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
