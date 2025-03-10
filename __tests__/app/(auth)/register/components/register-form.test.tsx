import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { registerUserAction } from "@/actions/auth-actions";
import RegisterForm from "@/app/(auth)/register/components/register-form";
import { useRouter } from "next/navigation";

jest.mock("@/actions/auth-actions", () => ({
  registerUserAction: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("RegisterForm", () => {
  const user = userEvent.setup();

  it("renders form fields correctly", () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Register" })
    ).toBeInTheDocument();
  });

  it("validates email format", async () => {
    render(<RegisterForm />);

    const emailInput = screen.getByLabelText("Email");
    await user.type(emailInput, "invalid-email");

    await user.click(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => {
      expect(screen.getByText("Invalid email format")).toBeInTheDocument();
    });

    expect(registerUserAction).not.toHaveBeenCalled();
  });

  it("validates password requirements", async () => {
    render(<RegisterForm />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "short");

    await user.click(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => {
      expect(
        screen.getByText("Password must be at least 8 characters")
      ).toBeInTheDocument();
    });

    expect(registerUserAction).not.toHaveBeenCalled();
  });

  it("validates password complexity", async () => {
    render(<RegisterForm />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password12345");

    await user.click(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => {
      expect(
        screen.getByText(
          "Password must contain at least one uppercase letter, one lowercase letter, and one number"
        )
      ).toBeInTheDocument();
    });

    expect(registerUserAction).not.toHaveBeenCalled();
  });

  it("submits form with valid data", async () => {
    (registerUserAction as jest.Mock).mockResolvedValue({ success: true });

    render(<RegisterForm />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "Password123");

    await user.click(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => {
      expect(registerUserAction).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "Password123",
      });
    });
  });

  it("displays loading state during submission", async () => {
    let resolveAction: (value: any) => void;
    const actionPromise = new Promise((resolve) => {
      resolveAction = resolve;
    });

    (registerUserAction as jest.Mock).mockReturnValue(actionPromise);

    render(<RegisterForm />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "Password123");

    await user.click(screen.getByRole("button", { name: "Register" }));

    expect(screen.getByText("Registering...")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Registering..." })
    ).toBeDisabled();

    // Resolve the promise to complete the submission
    resolveAction!({ success: true });

    await waitFor(() => {
      expect(screen.queryByText("Registering...")).not.toBeInTheDocument();
    });
  });

  it("displays server-side errors", async () => {
    const serverErrors = { email: ["Email already in use"] };
    (registerUserAction as jest.Mock).mockResolvedValue({
      errors: serverErrors,
    });

    render(<RegisterForm />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "Password123");

    await user.click(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => {
      expect(screen.getByText("Email already in use")).toBeInTheDocument();
    });
  });

  it("handles unexpected errors during submission", async () => {
    (registerUserAction as jest.Mock).mockRejectedValue(
      new Error("Network error")
    );

    render(<RegisterForm />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "Password123");

    await user.click(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => {
      expect(
        screen.getByText("An error occurred during registration")
      ).toBeInTheDocument();
    });
  });

  it("redirects after successful submission", async () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (registerUserAction as jest.Mock).mockResolvedValue({ success: true });

    render(<RegisterForm />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "Password123");
    await user.click(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });
});
