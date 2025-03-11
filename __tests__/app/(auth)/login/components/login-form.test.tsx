import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "@/app/(auth)/login/components/login-form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("LoginForm", () => {
  const user = userEvent.setup();

  it("renders form fields correctly", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
  });

  it("validates required fields", async () => {
    render(<LoginForm />);

    await user.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(screen.getByText("Email is required")).toBeInTheDocument();
      expect(screen.getByText("Password is required")).toBeInTheDocument();
    });

    expect(signIn).not.toHaveBeenCalled();
  });

  it("validates email format", async () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    await user.type(emailInput, "invalid-email");
    await user.type(passwordInput, "password123");

    await user.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(screen.getByText("Invalid email format")).toBeInTheDocument();
    });

    expect(signIn).not.toHaveBeenCalled();
  });

  it("submits form with valid data", async () => {
    (signIn as jest.Mock).mockResolvedValue({ ok: true, error: null });

    render(<LoginForm />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    await user.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith("credentials", {
        email: "test@example.com",
        password: "password123",
        redirect: false,
      });
    });
  });

  it("displays loading state during submission", async () => {
    let resolveSignIn: (value: any) => void;
    const signInPromise = new Promise((resolve) => {
      resolveSignIn = resolve;
    });

    (signIn as jest.Mock).mockReturnValue(signInPromise);

    render(<LoginForm />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(screen.getByText("Logging in...")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Logging in..." })
    ).toBeDisabled();

    // Resolve the promise to complete the submission
    resolveSignIn!({ ok: true });

    await waitFor(() => {
      expect(screen.queryByText("Logging in...")).not.toBeInTheDocument();
    });
  });

  it("displays error message for failed login", async () => {
    (signIn as jest.Mock).mockResolvedValue({
      ok: false,
      error: "Invalid credentials",
    });

    render(<LoginForm />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "wrong-password");

    await user.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(screen.getByText("Invalid email or password")).toBeInTheDocument();
    });
  });

  it("handles unexpected errors during submission", async () => {
    (signIn as jest.Mock).mockRejectedValue(new Error("Network error"));

    render(<LoginForm />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    await user.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(
        screen.getByText("An error occurred during login")
      ).toBeInTheDocument();
    });
  });

  it("redirects after successful submission", async () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (signIn as jest.Mock).mockResolvedValue({ ok: true, error: null });

    render(<LoginForm />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "Password123");
    await user.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/groceries");
    });
  });
});
