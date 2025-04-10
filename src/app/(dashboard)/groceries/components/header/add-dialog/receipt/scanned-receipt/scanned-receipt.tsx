"use client";

import { ReceiptData, ReceiptItem } from "@/types/receipt";
import ScannedReceiptHeader from "./scanned-receipt-header";
import ScannedReceiptItems from "./scanned-receipt-items";
import { useState } from "react";
import { receiptSchema } from "@/zod-schemas/receipt-schemas";
import { useToast } from "@/hooks/use-toast";
import FormButton from "@/components/form/form-button";
import { addReceiptDataAction } from "@/actions/grocery-actions";
import { Unit, UnitEnum } from "@/types/grocery";

type ScannedReceiptProps = {
  data: ReceiptData;
  onSuccess: () => void;
};

export default function ScannedReceipt({
  data,
  onSuccess,
}: ScannedReceiptProps) {
  const [receiptData, setReceiptData] = useState<ReceiptData>({
    store: data.store,
    date: data.date,
    items: [...data.items],
  });
  const [editMode, setEditMode] = useState<"header" | "item" | null>(null);
  const [editItemIndex, setEditItemIndex] = useState<number | null>(null);

  const handleSubmitHeader = (store: string, date: Date) => {
    setReceiptData({
      ...receiptData,
      date: date,
      store: store,
    });
    setEditMode(null);
  };

  const handleSubmitItem = (
    index: number,
    updatedItem: Partial<ReceiptItem>
  ) => {
    const updatedItems = [...receiptData.items];
    updatedItems[index] = { ...updatedItems[index], ...updatedItem };

    setReceiptData({
      ...receiptData,
      items: updatedItems,
    });
    setEditMode(null);
    setEditItemIndex(null);
  };

  const handleDeleteItem = (index: number) => {
    const updatedItems = [...receiptData.items];
    updatedItems.splice(index, 1);

    setReceiptData({
      ...receiptData,
      items: updatedItems,
    });
  };

  const handleEditHeader = () => {
    setEditMode("header");
    setHasHeaderErrors(false);
  };

  const handleEditItem = (index: number) => {
    setEditMode("item");
    setEditItemIndex(index);

    const newErrors = new Set(itemsWithErrors);
    newErrors.delete(index);
    setItemsWithErrors(newErrors);
  };

  const handleCancelEdit = () => {
    setEditMode(null);
    setEditItemIndex(null);
  };

  const [hasHeaderErrors, setHasHeaderErrors] = useState(false);
  const [itemsWithErrors, setItemsWithErrors] = useState<Set<number>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const isValidUnit = (unit: string | null): unit is Unit => {
    return unit !== null && Object.values(UnitEnum).includes(unit as Unit);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setHasHeaderErrors(false);
    setItemsWithErrors(new Set());

    const processedData = {
      ...receiptData,
      items: receiptData.items.map((item) => ({
        ...item,
        count: item.count ?? 1,
        amount: item.amount ?? 1,
        unit: isValidUnit(item.unit) ? item.unit : UnitEnum.units,
      })),
    };

    try {
      // client-side validation
      const validatedFields = receiptSchema.safeParse(processedData);

      if (!validatedFields.success) {
        const errorFields = new Set(
          validatedFields.error.errors.map((err) => err.path[0])
        );

        setHasHeaderErrors(errorFields.has("store") || errorFields.has("date"));

        if (errorFields.has("items")) {
          const itemsWithErrors = validatedFields.error.errors
            .filter((err) => err.path[0] === "items")
            .map((err) => Number(err.path[1]));
          setItemsWithErrors(new Set(itemsWithErrors));
        }

        toast({
          variant: "destructive",
          description: `Please fill in required fields.`,
        });
        return;
      }

      // server action
      const response = await addReceiptDataAction(processedData);
      if (response.error && typeof response.error === "object") {
        const errorMessages = Object.entries(response.error)
          .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
          .join("\n");

        toast({
          variant: "destructive",
          description: `Please fill in required fields: ${errorMessages}`,
        });
      } else if (response.error) {
        toast({
          variant: "destructive",
          description: response.error,
        });
      } else if (response.success) {
        toast({
          description: "Receipt saved.",
        });
        onSuccess();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to save receipt. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 text-sm">
      {receiptData.items.length > 0 ? (
        <>
          <ScannedReceiptHeader
            receiptData={receiptData}
            handleSubmitHeader={handleSubmitHeader}
            onEditClick={handleEditHeader}
            onCancelEdit={handleCancelEdit}
            editMode={editMode}
            disabled={editMode !== null && editMode !== "header"}
            hasErrors={hasHeaderErrors}
          />
          <ScannedReceiptItems
            receiptData={receiptData}
            handleSubmitItem={handleSubmitItem}
            handleDeleteItem={handleDeleteItem}
            onEditClick={handleEditItem}
            onCancelEdit={handleCancelEdit}
            editItemIndex={editItemIndex}
            disabled={editMode !== null && editMode !== "item"}
            itemsWithErrors={itemsWithErrors}
          />
          <FormButton
            isSubmitting={isLoading}
            disabled={editMode !== null}
            pendingText="Processing ..."
            defaultText={`Add ${receiptData.items.length} ${
              receiptData.items.length === 1 ? "item" : "items"
            }`}
            className="w-full"
            onClick={handleSubmit}
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
          <p>No items found on this receipt. </p>
          <p className="text-sm mt-2">
            Try scanning a different receipt or add items manually.
          </p>
        </div>
      )}
    </div>
  );
}
