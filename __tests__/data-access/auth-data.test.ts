import { registerUser } from "@/data-access/auth-data";
import prisma from "@/lib/db";
import bcrypt from "bcrypt";

jest.mock("@/lib/db", () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
}));

describe("User Repository", () => {
  describe("registerUser", () => {
    const userData = {
      email: "test@example.com",
      password: "Password123",
    };

    it("should check if email is already in use", async () => {
      await registerUser(userData);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: userData.email },
      });
    });

    it("should return error if email is already registered", async () => {
      const mockExistingUser = {
        id: "existing_user_id",
        email: userData.email,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockExistingUser);

      const result = await registerUser(userData);

      expect(result).toEqual({ error: { email: ["Email already in use"] } });
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it("should create new user with email and hashed password", async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_password");

      await registerUser(userData);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: userData.email,
          hashedPassword: "hashed_password",
        },
      });
    });

    it("should handle database errors", async () => {
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      await expect(registerUser(userData)).rejects.toThrow("Database error");
    });
  });
});
