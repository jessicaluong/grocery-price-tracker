import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { deleteItemAction } from "@/actions/grocery-actions";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useGroceryGroupContext } from "@/hooks/use-grocery-group";
import GroceryItemDropdown from "@/app/(dashboard)/groceries/components/grocery-list/grocery-group-dialog/grocery-group-table/grocery-item-dropdown/grocery-item-dropdown";

jest.mock("@/actions/grocery-actions", () => ({
  deleteItemAction: jest.fn(),
}));

jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(),
}));

jest.mock("@tanstack/react-query", () => ({
  useQueryClient: jest.fn(),
}));

jest.mock("@/hooks/use-grocery-group", () => ({
  useGroceryGroupContext: jest.fn(),
}));

describe("GroceryItemDropDown", () => {
  const user = userEvent.setup();
  const mockRowData = {
    id: "test-item-id",
    date: new Date(),
    price: 2.99,
    isSale: true,
  };
  const mockToast = jest.fn();
  const mockInvalidateQueries = jest.fn();
  const mockGroupId = "test-group-id";

  beforeEach(() => {
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    (useQueryClient as jest.Mock).mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    });
    (useGroceryGroupContext as jest.Mock).mockReturnValue({
      groupId: mockGroupId,
    });
  });

  describe("delete item", () => {
    it("should invalidate queries and show success toast when item is deleted successfully", async () => {
      (deleteItemAction as jest.Mock).mockReturnValue({ success: true });

      render(<GroceryItemDropdown rowData={mockRowData} />);

      const menuButton = screen.getByRole("button", { name: "Open menu" });
      await user.click(menuButton);
      const deleteOption = screen.getByText("Delete Item");
      await userEvent.click(deleteOption);

      await waitFor(() => {
        expect(deleteItemAction).toHaveBeenCalledWith(mockRowData.id);
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
          queryKey: ["priceHistory", mockGroupId],
        });
      });

      expect(mockToast).toHaveBeenCalledWith({
        description: "Item deleted.",
      });
    });

    it("should show error toast when deletion fails with error response", async () => {
      (deleteItemAction as jest.Mock).mockReturnValue({
        error: "Failed to delete item",
      });

      render(<GroceryItemDropdown rowData={mockRowData} />);

      const menuButton = screen.getByRole("button", { name: "Open menu" });
      await user.click(menuButton);
      const deleteOption = screen.getByText("Delete Item");
      await userEvent.click(deleteOption);

      await waitFor(() => {
        expect(deleteItemAction).toHaveBeenCalledWith(mockRowData.id);
      });

      expect(mockToast).toHaveBeenCalledWith({
        variant: "destructive",
        description: "Failed to delete item",
      });
    });

    it("should show error toast when server action throws an exception", async () => {
      (deleteItemAction as jest.Mock).mockRejectedValue(
        new Error("Unexpected error")
      );

      render(<GroceryItemDropdown rowData={mockRowData} />);

      const menuButton = screen.getByRole("button", { name: "Open menu" });
      await user.click(menuButton);
      const deleteOption = screen.getByText("Delete Item");
      await userEvent.click(deleteOption);

      await waitFor(() => {
        expect(deleteItemAction).toHaveBeenCalledWith(mockRowData.id);
      });

      expect(mockToast).toHaveBeenCalledWith({
        variant: "destructive",
        description: "An error occurred while deleting item",
      });
    });

    it("should not invalidate queries when submission fails", async () => {
      (deleteItemAction as jest.Mock).mockResolvedValue({
        errors: { form: "Server error" },
      });

      render(<GroceryItemDropdown rowData={mockRowData} />);

      const menuButton = screen.getByRole("button", { name: "Open menu" });
      await user.click(menuButton);
      const deleteOption = screen.getByText("Delete Item");
      await userEvent.click(deleteOption);

      await waitFor(() => {
        expect(deleteItemAction).toHaveBeenCalled();
        expect(mockInvalidateQueries).not.toHaveBeenCalled();
      });
    });
  });
});
