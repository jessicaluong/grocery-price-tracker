import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useToast } from "@/hooks/use-toast";
import { editItemAction } from "@/actions/grocery-actions";
import { useQueryClient } from "@tanstack/react-query";
import { useGroceryGroupContext } from "@/hooks/use-grocery-group";
import EditItemForm from "@/app/(dashboard)/groceries/components/grocery-list/grocery-group-dialog/grocery-group-table/grocery-item-dropdown/edit-item/edit-item-form";

jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(() => ({
    toast: jest.fn(),
  })),
}));

jest.mock("@/actions/grocery-actions", () => ({
  editItemAction: jest.fn(),
}));

jest.mock("@tanstack/react-query", () => ({
  useQueryClient: jest.fn(),
}));

jest.mock("@/hooks/use-grocery-group", () => ({
  useGroceryGroupContext: jest.fn(),
}));

describe("EditItemForm", () => {
  /**
   * This component uses the same validation as AddItemForm (tested in add-item-form.test.tsx)
   * These tests focus only on EditItemForm-specific behavior
   */

  const mockOnSuccess = jest.fn();
  const mockInvalidateQueries = jest.fn();
  const mockGroupId = "test-group-id";
  const user = userEvent.setup();
  const item = {
    id: "test-item-id",
    price: 2.99,
    date: new Date("2025-03-15T12:00:00"),
    isSale: true,
  };

  beforeEach(() => {
    (useQueryClient as jest.Mock).mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    });
    (useGroceryGroupContext as jest.Mock).mockReturnValue({
      groupId: mockGroupId,
    });
  });

  describe("render", () => {
    it("renders the form correctly", () => {
      render(<EditItemForm item={item} onSuccess={mockOnSuccess} />);

      expect(screen.getByLabelText("Price")).toBeInTheDocument();
      expect(screen.getByLabelText("Date")).toBeInTheDocument();

      const saleLabel = screen.getByText("Sale Price?");
      const container = saleLabel.closest("div");
      const checkbox = container?.querySelector('[role="checkbox"]');
      expect(checkbox).toBeInTheDocument();

      expect(screen.getByLabelText("Price")).toHaveValue(item.price.toString());
      expect(checkbox).toHaveAttribute("aria-checked", "true");
      expect(screen.getByText(/March 15th, 2025/i)).toBeInTheDocument();

      expect(
        screen.getByRole("button", { name: "Save changes" })
      ).toBeInTheDocument();
    });
  });

  describe("successful submission", () => {
    it("calls editItemAction, invalidates queries, shows toast, and calls onSuccess when form submission is successful", async () => {
      const mockToast = jest.fn();
      (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
      (editItemAction as jest.Mock).mockResolvedValue({ success: true });

      render(<EditItemForm item={item} onSuccess={mockOnSuccess} />);

      await user.click(screen.getByRole("button", { name: "Save changes" }));

      await waitFor(() => {
        expect(editItemAction).toHaveBeenCalled();
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
          queryKey: ["priceHistory", mockGroupId],
        });
        expect(mockToast).toHaveBeenCalledWith({
          description: "Item edited.",
        });
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it("handles form values correctly", async () => {
      (editItemAction as jest.Mock).mockResolvedValue({ success: true });

      render(<EditItemForm item={item} onSuccess={mockOnSuccess} />);

      const priceInput = screen.getByLabelText("Price");
      await user.clear(priceInput);
      await user.type(priceInput, "1.50");

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      await user.click(screen.getByRole("button", { name: "Save changes" }));

      await waitFor(() => {
        expect(editItemAction).toHaveBeenCalledWith(
          expect.objectContaining({
            price: 1.5,
            date: expect.any(Date),
            isSale: false,
          }),
          "test-item-id"
        );
      });
    });

    it("shows loading state during submission", async () => {
      let resolveAction: (value: any) => void;
      const actionPromise = new Promise((resolve) => {
        resolveAction = resolve;
      });

      (editItemAction as jest.Mock).mockReturnValue(actionPromise);

      render(<EditItemForm item={item} onSuccess={mockOnSuccess} />);

      await user.click(screen.getByRole("button", { name: "Save changes" }));

      expect(screen.getByText("Saving...")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Saving..." })).toBeDisabled();

      resolveAction!({ success: true });

      await waitFor(() => {
        expect(screen.queryByText("Saving...")).not.toBeInTheDocument();
      });
    });
  });

  describe("error handling", () => {
    it("displays server-side errors", async () => {
      const serverErrors = { name: ["Server validation error"] };
      (editItemAction as jest.Mock).mockResolvedValue({
        errors: serverErrors,
      });

      render(<EditItemForm item={item} onSuccess={mockOnSuccess} />);

      await user.click(screen.getByRole("button", { name: "Save changes" }));

      await waitFor(() => {
        expect(
          screen.getByText((content) =>
            content.includes("Server validation error")
          )
        ).toBeInTheDocument();
      });
    });

    it("handles unexpected errors during submission", async () => {
      (editItemAction as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      render(<EditItemForm item={item} onSuccess={mockOnSuccess} />);

      await user.click(screen.getByRole("button", { name: "Save changes" }));

      await waitFor(() => {
        expect(
          screen.getByText((content) =>
            content.includes("An error occurred while editing item")
          )
        ).toBeInTheDocument();
      });
    });

    it("should not invalidate queries when submission fails", async () => {
      (editItemAction as jest.Mock).mockResolvedValue({
        errors: { form: "Server error" },
      });

      render(<EditItemForm item={item} onSuccess={mockOnSuccess} />);

      // fill in required fields
      await user.click(screen.getByRole("button", { name: "Save changes" }));

      await waitFor(() => {
        expect(editItemAction).toHaveBeenCalled();
        expect(mockInvalidateQueries).not.toHaveBeenCalled();
        expect(mockOnSuccess).not.toHaveBeenCalled();
      });
    });
  });
});
