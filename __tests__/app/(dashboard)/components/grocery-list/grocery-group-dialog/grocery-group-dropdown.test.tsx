import { deleteGroupAction } from "@/actions/grocery-actions";
import GroceryGroupDropdown from "@/app/(dashboard)/groceries/components/grocery-list/grocery-group-dialog/grocery-group-dropdown";
import { Unit } from "@/types/grocery";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useToast } from "@/hooks/use-toast";

jest.mock("@/actions/grocery-actions", () => ({
  deleteGroupAction: jest.fn(),
}));

jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(),
}));

describe("GroceryGroupDropDown", () => {
  const user = userEvent.setup();
  const mockGroup = {
    id: "test-group-id",
    name: "oats",
    brand: "Quaker",
    store: "Superstore",
    count: 1,
    amount: 1,
    unit: "kg" as Unit,
    price: 5.99,
  };
  const mockToast = jest.fn();

  beforeEach(() => {
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
  });

  describe("delete group", () => {
    it("should show success toast when group is deleted successfully", async () => {
      (deleteGroupAction as jest.Mock).mockReturnValue({ success: true });

      render(<GroceryGroupDropdown group={mockGroup} />);

      const menuButton = screen.getByRole("button", { name: "Open menu" });
      await user.click(menuButton);
      const deleteOption = screen.getByText("Delete Group");
      await userEvent.click(deleteOption);

      await waitFor(() => {
        expect(deleteGroupAction).toHaveBeenCalledWith(mockGroup.id);
      });

      expect(mockToast).toHaveBeenCalledWith({
        description: "Group deleted.",
      });
    });

    it("should show error toast when deletion fails with error response", async () => {
      (deleteGroupAction as jest.Mock).mockReturnValue({
        error: "Failed to delete group",
      });

      render(<GroceryGroupDropdown group={mockGroup} />);

      const menuButton = screen.getByRole("button", { name: "Open menu" });
      await user.click(menuButton);
      const deleteOption = screen.getByText("Delete Group");
      await userEvent.click(deleteOption);

      await waitFor(() => {
        expect(deleteGroupAction).toHaveBeenCalledWith(mockGroup.id);
      });

      expect(mockToast).toHaveBeenCalledWith({
        variant: "destructive",
        description: "Failed to delete group",
      });
    });

    it("should show error toast when server action throws an exception", async () => {
      (deleteGroupAction as jest.Mock).mockRejectedValue(
        new Error("Unexpected error")
      );

      render(<GroceryGroupDropdown group={mockGroup} />);

      const menuButton = screen.getByRole("button", { name: "Open menu" });
      await user.click(menuButton);
      const deleteOption = screen.getByText("Delete Group");
      await userEvent.click(deleteOption);

      await waitFor(() => {
        expect(deleteGroupAction).toHaveBeenCalledWith(mockGroup.id);
      });

      expect(mockToast).toHaveBeenCalledWith({
        variant: "destructive",
        description: "An error occurred while deleting group",
      });
    });
  });
});
