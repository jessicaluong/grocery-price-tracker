import { registerUser } from "@/data-access/user-repository";
import prisma from "@/lib/db";

describe("User Repository Integration Tests", () => {
  afterAll(async () => {
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany({});
  });

  describe("registerUser", () => {
    it("should successfully register a new user", async () => {
      const email = `test@example.com`;
      const password = "Password123";

      const result = await registerUser({
        email,
        password,
      });

      // Expect no errors
      expect(result).toBeUndefined();

      const user = await prisma.user.findUnique({
        where: { email },
      });

      expect(user).toBeDefined();
      expect(user?.email).toBe(email);

      // Verify password was hashed (not stored in plaintext)
      expect(user?.hashedPassword).not.toBe(password);
      expect(user?.hashedPassword).toBeDefined();
    });

    it("should return error for duplicate email", async () => {
      const email = `test@example.com`;
      const password = "Password123";

      await registerUser({
        email,
        password,
      });

      const result = await registerUser({
        email,
        password: "DifferentPassword123",
      });

      expect(result).toEqual({
        error: { email: ["Email already in use"] },
      });

      const users = await prisma.user.findMany({
        where: {
          email,
        },
      });
      expect(users.length).toBe(1);
    });
  });
});
