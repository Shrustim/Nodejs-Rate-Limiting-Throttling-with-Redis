import { prisma } from "../src/config/database.js";

async function testRollback() {
  const email = "rollback-test@example.com";

  await prisma.user.deleteMany({
    where: {
      email,
    },
  });

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          name: "Rollback Test",
          email,
        },
      });

      throw new Error("Force transaction failure");
    });
  } catch (error) {
    console.log("Transaction failed as expected");
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (user === null) {
    console.log("PASS: transaction rolled back");
  } else {
    console.log("FAIL: user still exists");
  }

  await prisma.$disconnect();
}

testRollback();
