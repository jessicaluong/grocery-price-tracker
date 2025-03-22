import bcrypt from "bcrypt";
import prisma from "@/lib/db";
import { TRegisterSchema } from "@/zod-schemas/auth-schemas";

export async function registerUser({ email, password }: TRegisterSchema) {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: { email: ["Email already in use"] } };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      hashedPassword,
    },
  });
}
