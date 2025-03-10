import { registerUserAction } from "@/actions/auth-actions";
import { registerUser } from "@/data-access/user-repository";
import { registerSchema } from "@/app/(auth)/register/lib/auth-types";

jest.mock("@/data-access/user-repository", () => ({
  registerUser: jest.fn(),
}));

describe("registerUserAction", () => {
  describe("validation", () => {
    describe("email", () => {
      it("should return validation errors for empty email", async () => {
        const result = await registerUserAction({
          email: "",
          password: "Password123",
        });

        expect(result).toHaveProperty("errors");
        expect(result.errors).toHaveProperty("email");
        expect(registerUser).not.toHaveBeenCalled();
      });

      describe("format", () => {
        it("should return validation errors for invalid email format", async () => {
          const result = await registerUserAction({
            email: "invalid-email",
            password: "Password123",
          });

          expect(result).toHaveProperty("errors");
          expect(result.errors).toHaveProperty("email");
          expect(registerUser).not.toHaveBeenCalled();
        });
        it("should return validation errors for invalid email format (only @)", async () => {
          const result = await registerUserAction({
            email: "@",
            password: "Password123",
          });

          expect(result).toHaveProperty("errors");
          expect(result.errors).toHaveProperty("email");
          expect(registerUser).not.toHaveBeenCalled();
        });
        it("should return validation errors for invalid email format (only .)", async () => {
          const result = await registerUserAction({
            email: ".",
            password: "Password123",
          });

          expect(result).toHaveProperty("errors");
          expect(result.errors).toHaveProperty("email");
          expect(registerUser).not.toHaveBeenCalled();
        });
        it("should return validation errors for invalid email format (only @ and .)", async () => {
          const result = await registerUserAction({
            email: "@.",
            password: "Password123",
          });

          expect(result).toHaveProperty("errors");
          expect(result.errors).toHaveProperty("email");
          expect(registerUser).not.toHaveBeenCalled();
        });
      });
    });

    describe("password", () => {
      it("returns validation errors when password is too short", async () => {
        const result = await registerUserAction({
          email: "test@example.com",
          password: "short",
        });

        expect(result).toHaveProperty("errors");
        expect(result.errors).toHaveProperty("password");
        expect(registerUser).not.toHaveBeenCalled();
      });

      it("returns validation errors when password is too long", async () => {
        const tooLongPassword = "a".repeat(101);

        const result = await registerUserAction({
          email: "test@example.com",
          password: tooLongPassword,
        });

        expect(result).toHaveProperty("errors");
        expect(result.errors).toHaveProperty("password");
        expect(registerUser).not.toHaveBeenCalled();
      });

      it("returns validation errors for wrong password format", async () => {
        const result = await registerUserAction({
          email: "test@example.com",
          password: "wrongformat",
        });
        expect(result).toHaveProperty("errors");
        expect(result.errors).toHaveProperty("password");
        expect(registerUser).not.toHaveBeenCalled();
      });
    });
  });

  describe("email normalization", () => {
    it("normalizes email case sensitivity during registration", async () => {
      const originalEmail = "Test@Example.COM";
      const normalizedEmail = "test@example.com";

      const inputData = await registerUserAction({
        email: originalEmail,
        password: "Password123",
      });

      await registerUserAction(inputData);

      expect(registerUser).toHaveBeenCalledWith({
        email: normalizedEmail,
        password: "Password123",
      });
    });

    it("normalizes email whitespace during registration", async () => {
      const originalEmail = "  test@example.com  ";
      const normalizedEmail = "test@example.com";

      const inputData = {
        email: originalEmail,
        password: "Password123",
      };

      await registerUserAction(inputData);

      expect(registerUser).toHaveBeenCalledWith({
        email: normalizedEmail,
        password: "Password123",
      });
    });
  });

  describe("successful registration", () => {
    it("calls registerUser with validated data and returns success", async () => {
      const validData = {
        email: "test@example.com",
        password: "Password123",
      };

      const result = await registerUserAction(validData);

      expect(registerUser).toHaveBeenCalledWith(validData);
      expect(result).toEqual({ success: true });
    });
  });

  describe("error handling", () => {
    it("returns server errors from registerUser", async () => {
      const validData = {
        email: "test@example.com",
        password: "Password123",
      };

      const mockServerError = {
        error: { email: ["Email already in use"] },
      };

      (registerUser as jest.Mock).mockResolvedValue(mockServerError);

      const result = await registerUserAction(validData);

      expect(result).toHaveProperty("errors");
      expect(result.errors).toHaveProperty("email");
    });

    it("handles unexpected errors during registration", async () => {
      const validData = {
        email: "test@example.com",
        password: "Password123",
      };

      (registerUser as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const result = await registerUserAction(validData);

      expect(result).toHaveProperty("errors");
      expect(result.errors).toHaveProperty("form", "Failed to register user");
    });
  });
});
