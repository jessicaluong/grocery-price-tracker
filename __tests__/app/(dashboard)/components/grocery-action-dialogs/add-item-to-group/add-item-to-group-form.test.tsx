import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useToast } from "@/hooks/use-toast";
import { addItemToGroupAction } from "@/actions/grocery-actions";
import { Unit } from "@/types/grocery";
import AddItemToGroupForm from "@/app/(dashboard)/groceries/components/grocery-action-dialogs/add-item-to-group/add-item-to-group-form";

jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(() => ({
    toast: jest.fn(),
  })),
}));

jest.mock("@/actions/grocery-actions", () => ({
  addItemToGroupAction: jest.fn(),
}));

describe("AddItemToGroupForm", () => {
  /**
   * This component uses the same validation as AddItemForm (tested in add-item-form.test.tsx)
   * These tests focus only on AddItemGroupForm-specific behavior
   */

  const mockOnSuccess = jest.fn();
  const user = userEvent.setup();
  const group = {
    id: "test-group-id",
    name: "orange juice",
    brand: "Tropicana",
    store: "Walmart",
    count: 2,
    amount: 250,
    unit: "mL" as Unit,
  };

  describe("render", () => {
    it("renders the form correctly", () => {
      render(<AddItemToGroupForm group={group} onSuccess={mockOnSuccess} />);

      expect(screen.getByLabelText("Price")).toBeInTheDocument();
      expect(screen.getByLabelText("Date")).toBeInTheDocument();

      const saleLabel = screen.getByText("Sale Price?");
      const container = saleLabel.closest("div");
      const checkbox = container?.querySelector('[role="checkbox"]');
      expect(checkbox).toBeInTheDocument();

      expect(
        screen.getByRole("button", { name: "Submit" })
      ).toBeInTheDocument();
    });
  });

  describe("successful submission", () => {
    it("calls addItemToGroupAction, toast, and onSuccess when form submission is successful", async () => {
      const mockToast = jest.fn();
      (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
      (addItemToGroupAction as jest.Mock).mockResolvedValue({ success: true });

      render(<AddItemToGroupForm group={group} onSuccess={mockOnSuccess} />);

      // fill in required fields
      await user.type(screen.getByLabelText("Price"), "1.50");

      await user.click(screen.getByRole("button", { name: "Submit" }));

      await waitFor(() => {
        expect(addItemToGroupAction).toHaveBeenCalled();
        expect(mockToast).toHaveBeenCalledWith({
          description: "Item added.",
        });
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it("handles form values correctly", async () => {
      (addItemToGroupAction as jest.Mock).mockResolvedValue({ success: true });

      render(<AddItemToGroupForm group={group} onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText("Price"), "1.50");
      await user.click(screen.getByRole("checkbox"));

      await user.click(screen.getByRole("button", { name: "Submit" }));

      await waitFor(() => {
        expect(addItemToGroupAction).toHaveBeenCalledWith(
          expect.objectContaining({
            price: 1.5,
            date: expect.any(Date),
            isSale: true,
          }),
          "test-group-id"
        );
      });
    });

    it("shows loading state during submission", async () => {
      let resolveAction: (value: any) => void;
      const actionPromise = new Promise((resolve) => {
        resolveAction = resolve;
      });

      (addItemToGroupAction as jest.Mock).mockReturnValue(actionPromise);

      render(<AddItemToGroupForm group={group} onSuccess={mockOnSuccess} />);

      // fill in required fields
      await user.type(screen.getByLabelText("Price"), "1.50");

      await user.click(screen.getByRole("button", { name: "Submit" }));

      expect(screen.getByText("Adding...")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Adding..." })).toBeDisabled();

      resolveAction!({ success: true });

      await waitFor(() => {
        expect(screen.queryByText("Adding...")).not.toBeInTheDocument();
      });
    });
  });

  describe("error handling", () => {
    it("displays server-side errors", async () => {
      const serverErrors = { name: ["Server validation error"] };
      (addItemToGroupAction as jest.Mock).mockResolvedValue({
        errors: serverErrors,
      });

      render(<AddItemToGroupForm group={group} onSuccess={mockOnSuccess} />);

      // fill in required fields
      await user.type(screen.getByLabelText("Price"), "1.50");

      await user.click(screen.getByRole("button", { name: "Submit" }));

      await waitFor(() => {
        expect(
          screen.getByText((content) =>
            content.includes("Server validation error")
          )
        ).toBeInTheDocument();
      });
    });

    it("handles unexpected errors during submission", async () => {
      (addItemToGroupAction as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      render(<AddItemToGroupForm group={group} onSuccess={mockOnSuccess} />);

      // fill in required fields
      await user.type(screen.getByLabelText("Price"), "1.50");

      await user.click(screen.getByRole("button", { name: "Submit" }));

      await waitFor(() => {
        expect(
          screen.getByText((content) =>
            content.includes("An error occurred while adding item")
          )
        ).toBeInTheDocument();
      });
    });
  });
});
