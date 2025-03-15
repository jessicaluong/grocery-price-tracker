import prisma from "@/lib/db";
import { test as setup } from "@playwright/test";
import * as bcrypt from "bcrypt";

setup("setting up database", async ({}) => {
  console.log("setting up database...");

  // Create test user
  const hashedPassword = await bcrypt.hash("password123", 10);
  await prisma.user.create({
    data: {
      email: "test@example.com",
      hashedPassword,
    },
  });

  console.log("test database setup complete");
});
