import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditGroupForm from "@/app/(dashboard)/groceries/components/group-dialogs/edit-group/edit-group-form";
import { editGroupAction } from "@/actions/grocery-actions";
import { Unit } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

jest.mock("@/actions/grocery-actions", () => ({
  editGroupAction: jest.fn(),
}));

jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(() => ({
    toast: jest.fn(),
  })),
}));

describe("EditGroupForm", () => {
  /**
   * This component uses the same validation as AddItemForm (tested in add-item-form.test.tsx)
   * These tests focus only on EditGroupForm-specific behavior
   */

  const mockOnSuccess = jest.fn();
  const user = userEvent.setup();
  const group = {
    id: "group-id-1",
    name: "orange juice",
    brand: "Tropicana",
    store: "Walmart",
    count: 2,
    amount: 250,
    unit: "mL" as Unit,
  };

  describe("render", () => {
    it("renders the form correctly", () => {
      render(<EditGroupForm group={group} onSuccess={mockOnSuccess} />);

      expect(screen.getByLabelText("Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Brand")).toBeInTheDocument();
      expect(screen.getByLabelText("Store")).toBeInTheDocument();
      expect(screen.getByLabelText("Count")).toBeInTheDocument();
      expect(screen.getByLabelText("Amount")).toBeInTheDocument();
      expect(screen.getByLabelText("Unit")).toBeInTheDocument();

      expect(screen.getByLabelText("Name")).toHaveValue(group.name);
      expect(screen.getByLabelText("Brand")).toHaveValue(group.brand);
      expect(screen.getByLabelText("Store")).toHaveValue(group.store);
      expect(screen.getByLabelText("Count")).toHaveValue(
        group.count.toString()
      );
      expect(screen.getByLabelText("Amount")).toHaveValue(
        group.amount.toString()
      );
      expect(screen.getByRole("combobox", { name: "Unit" })).toHaveTextContent(
        group.unit
      );

      expect(
        screen.getByRole("button", { name: "Save changes" })
      ).toBeInTheDocument();
    });
  });

  describe("successful submission", () => {
    it("calls editGroupAction, toast, and onSuccess when form submission is successful", async () => {
      const mockToast = jest.fn();
      (useToast as jest.Mock).mockReturnValue({ toast: mockToast });

      (editGroupAction as jest.Mock).mockResolvedValue({ success: true });

      render(<EditGroupForm group={group} onSuccess={mockOnSuccess} />);

      await user.click(screen.getByRole("button", { name: "Save changes" }));

      await waitFor(() => {
        expect(editGroupAction).toHaveBeenCalled();
        expect(mockToast).toHaveBeenCalledWith({
          description: "Group edited.",
        });
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it("handles form values correctly", async () => {
      (editGroupAction as jest.Mock).mockResolvedValue({ success: true });

      render(<EditGroupForm group={group} onSuccess={mockOnSuccess} />);

      const nameInput = screen.getByLabelText("Name");
      await user.clear(nameInput);
      await user.type(nameInput, "apple juice");

      const amountInput = screen.getByLabelText("Amount");
      await user.clear(amountInput);
      await user.type(amountInput, "500");

      const countInput = screen.getByLabelText("Count");
      await user.clear(countInput);
      await user.type(countInput, "3");

      await user.click(screen.getByRole("button", { name: "Save changes" }));

      await waitFor(() => {
        expect(editGroupAction).toHaveBeenCalledWith(
          expect.objectContaining({
            name: "apple juice",
            amount: 500,
            count: 3,
          }),
          group.id
        );
      });
    });

    it("shows loading state during submission", async () => {
      let resolveAction: (value: any) => void;
      const actionPromise = new Promise((resolve) => {
        resolveAction = resolve;
      });

      (editGroupAction as jest.Mock).mockReturnValue(actionPromise);

      render(<EditGroupForm group={group} onSuccess={mockOnSuccess} />);

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
      (editGroupAction as jest.Mock).mockResolvedValue({
        errors: serverErrors,
      });

      render(<EditGroupForm group={group} onSuccess={mockOnSuccess} />);

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
      (editGroupAction as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      render(<EditGroupForm group={group} onSuccess={mockOnSuccess} />);

      await user.click(screen.getByRole("button", { name: "Save changes" }));

      await waitFor(() => {
        expect(
          screen.getByText((content) =>
            content.includes("An error occurred while editing group")
          )
        ).toBeInTheDocument();
      });
    });
  });
});
