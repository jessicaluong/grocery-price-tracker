import prisma from "@/lib/db";
import { test as teardown } from "@playwright/test";

teardown("delete database", async ({}) => {
  console.log("deleting test database...");

  await prisma.item.deleteMany({});
  await prisma.group.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.verificationRequest.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.$disconnect();

  console.log("database deleted");
});
