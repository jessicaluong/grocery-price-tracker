import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { addItemAction } from "@/actions/grocery-actions";
import React from "react";
import AddItemForm from "@/app/(dashboard)/groceries/components/grocery-action-dialogs/add-item/add-item-form";
import { useToast } from "@/hooks/use-toast";

jest.mock("@/actions/grocery-actions", () => ({
  addItemAction: jest.fn(),
}));

jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(() => ({
    toast: jest.fn(),
  })),
}));

describe("AddItemForm", () => {
  const mockOnSuccess = jest.fn();
  const user = userEvent.setup();

  describe("render", () => {
    it("renders the form correctly", () => {
      render(<AddItemForm onSuccess={mockOnSuccess} />);

      expect(screen.getByLabelText("Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Brand")).toBeInTheDocument();
      expect(screen.getByLabelText("Store")).toBeInTheDocument();
      expect(screen.getByLabelText("Count")).toBeInTheDocument();
      expect(screen.getByLabelText("Amount")).toBeInTheDocument();
      expect(screen.getByLabelText("Unit")).toBeInTheDocument();
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

  describe("validation", () => {
    describe("string field", () => {
      it("shows correct error messages for non-nullable empty field", async () => {
        render(<AddItemForm onSuccess={mockOnSuccess} />);

        await user.click(screen.getByRole("button", { name: "Submit" }));

        await waitFor(() => {
          expect(screen.getByText("Item name is required")).toBeInTheDocument();
          expect(
            screen.getByText("Store name is required")
          ).toBeInTheDocument();
        });
      });

      it("shows correct error messages for wrong length", async () => {
        render(<AddItemForm onSuccess={mockOnSuccess} />);

        const nameInput = screen.getByLabelText("Name");
        const tooLongName = "a".repeat(51);

        await user.type(nameInput, tooLongName);
        await user.click(screen.getByRole("button", { name: "Submit" }));

        await waitFor(() => {
          expect(screen.getByText("Item name too long")).toBeInTheDocument();
        });
      });
    });

    describe("number field", () => {
      it("shows correct error messages for empty field or non-numeric input", async () => {
        const user = userEvent.setup();
        render(<AddItemForm onSuccess={mockOnSuccess} />);

        await user.click(screen.getByRole("button", { name: "Submit" }));

        await waitFor(() => {
          expect(
            screen.getByText("Amount must be a number")
          ).toBeInTheDocument();
          expect(
            screen.getByText("Price must be a number")
          ).toBeInTheDocument();
        });
      });

      it("shows correct error messages for nonpositive number", async () => {
        const user = userEvent.setup();
        render(<AddItemForm onSuccess={mockOnSuccess} />);

        const amountInput = screen.getByLabelText("Amount");
        const priceInput = screen.getByLabelText("Price");
        const countInput = screen.getByLabelText("Count");
        await user.clear(countInput);

        const negativeNumber = "-1";
        await user.type(amountInput, negativeNumber);
        await user.type(priceInput, negativeNumber);
        await user.type(countInput, negativeNumber);
        await user.click(screen.getByRole("button", { name: "Submit" }));

        await waitFor(() => {
          expect(
            screen.getByText("Amount must be at least 1")
          ).toBeInTheDocument();
          expect(
            screen.getByText("Count must be at least 1")
          ).toBeInTheDocument();
          expect(
            screen.getByText("Price cannot be negative")
          ).toBeInTheDocument();
        });
      });

      it("shows no error messages for zero as price input", async () => {
        const user = userEvent.setup();
        render(<AddItemForm onSuccess={mockOnSuccess} />);

        const priceInput = screen.getByLabelText("Price");
        await user.type(priceInput, "0");
        await user.click(screen.getByRole("button", { name: "Submit" }));

        await waitFor(
          () => {
            expect(
              screen.queryByText("Price cannot be negative")
            ).not.toBeInTheDocument();
          },
          { timeout: 2000 }
        );
      });

      it("shows correct error messages non-whole number", async () => {
        const user = userEvent.setup();
        render(<AddItemForm onSuccess={mockOnSuccess} />);

        const countInput = screen.getByLabelText("Count");
        await user.clear(countInput);

        const decimalNumber = "1.99";
        await user.type(countInput, decimalNumber);
        await user.click(screen.getByRole("button", { name: "Submit" }));

        await waitFor(() => {
          expect(
            screen.getByText("Count must be a whole number")
          ).toBeInTheDocument();
        });
      });
    });
  });

  describe("successful submission", () => {
    it("calls addItemAction, toast, and onSuccess when form submission is successful", async () => {
      const mockToast = jest.fn();
      (useToast as jest.Mock).mockReturnValue({ toast: mockToast });

      (addItemAction as jest.Mock).mockResolvedValue({ success: true });

      render(<AddItemForm onSuccess={mockOnSuccess} />);

      // Fill in required fields
      await user.type(screen.getByLabelText("Name"), "orange juice");
      await user.type(screen.getByLabelText("Brand"), "Tropicana");
      await user.type(screen.getByLabelText("Store"), "Walmart");
      await user.type(screen.getByLabelText("Amount"), "100");
      await user.type(screen.getByLabelText("Price"), "4.99");

      await user.click(screen.getByRole("button", { name: "Submit" }));

      await waitFor(() => {
        expect(addItemAction).toHaveBeenCalled();
        expect(mockToast).toHaveBeenCalledWith({
          description: "Item added.",
        });
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it("handles form values correctly", async () => {
      (addItemAction as jest.Mock).mockResolvedValue({ success: true });

      render(<AddItemForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText("Name"), "Orange Juice");
      await user.type(screen.getByLabelText("Brand"), "Tropicana");
      await user.type(screen.getByLabelText("Store"), "Walmart");
      await user.type(screen.getByLabelText("Amount"), "100");
      await user.type(screen.getByLabelText("Price"), "4.99");
      const countInput = screen.getByLabelText("Count");
      await user.clear(countInput);
      await user.type(screen.getByLabelText("Count"), "2");

      await user.click(screen.getByRole("button", { name: "Submit" }));

      await waitFor(() => {
        expect(addItemAction).toHaveBeenCalledWith({
          name: "Orange Juice",
          brand: "Tropicana",
          store: "Walmart",
          count: 2,
          amount: 100,
          unit: "g",
          price: 4.99,
          isSale: false,
          date: expect.any(Date),
        });
      });
    });

    it("shows loading state during submission", async () => {
      let resolveAction: (value: any) => void;
      const actionPromise = new Promise((resolve) => {
        resolveAction = resolve;
      });

      (addItemAction as jest.Mock).mockReturnValue(actionPromise);

      render(<AddItemForm onSuccess={mockOnSuccess} />);

      // Fill in required fields
      await user.type(screen.getByLabelText("Name"), "Orange Juice");
      await user.type(screen.getByLabelText("Brand"), "Tropicana");
      await user.type(screen.getByLabelText("Store"), "Walmart");
      await user.type(screen.getByLabelText("Amount"), "100");
      await user.type(screen.getByLabelText("Price"), "4.99");

      await user.click(screen.getByRole("button", { name: "Submit" }));

      expect(screen.getByText("Adding...")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Adding..." })).toBeDisabled();

      // Resolve the promise to complete the submission
      resolveAction!({ success: true });

      await waitFor(() => {
        expect(screen.queryByText("Adding...")).not.toBeInTheDocument();
      });
    });
  });

  describe("error handling", () => {
    it("displays server-side errors", async () => {
      const serverErrors = { name: ["Server validation error"] };
      (addItemAction as jest.Mock).mockResolvedValue({ errors: serverErrors });

      render(<AddItemForm onSuccess={mockOnSuccess} />);

      // Fill in required fields
      await user.type(screen.getByLabelText("Name"), "Orange Juice");
      await user.type(screen.getByLabelText("Brand"), "Tropicana");
      await user.type(screen.getByLabelText("Store"), "Walmart");
      await user.type(screen.getByLabelText("Amount"), "100");
      await user.type(screen.getByLabelText("Price"), "4.99");

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
      (addItemAction as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      render(<AddItemForm onSuccess={mockOnSuccess} />);

      // Fill in required fields
      await user.type(screen.getByLabelText("Name"), "Orange Juice");
      await user.type(screen.getByLabelText("Brand"), "Tropicana");
      await user.type(screen.getByLabelText("Store"), "Walmart");
      await user.type(screen.getByLabelText("Amount"), "100");
      await user.type(screen.getByLabelText("Price"), "4.99");

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
