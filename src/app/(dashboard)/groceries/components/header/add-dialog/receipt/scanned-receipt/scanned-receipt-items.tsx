"use client";

import { Button } from "@/components/ui/button";
import { ReceiptData, ReceiptItem } from "@/types/receipt";
import { SquarePenIcon, TrashIcon } from "lucide-react";
import LabeledValue from "./labeled-value";
import { ScannedReceiptItemForm } from "./scanned-receipt-item-form";
import { SaleIndicator } from "@/components/sale-indicator";

type ScannedReceiptItemsProps = {
  receiptData: ReceiptData;
  handleSubmitItem: (index: number, updatedItem: ReceiptItem) => void;
  handleDeleteItem: (index: number) => void;
  onEditClick: (index: number) => void;
  onCancelEdit: () => void;
  editItemIndex: number | null;
  disabled: boolean;
  itemsWithErrors: Set<number>;
};

export default function ScannedReceiptItems({
  receiptData,
  handleSubmitItem,
  handleDeleteItem,
  onEditClick,
  onCancelEdit,
  editItemIndex,
  disabled,
  itemsWithErrors,
}: ScannedReceiptItemsProps) {
  return (
    <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
      {receiptData.items.map((item, index) => (
        <div
          key={index}
          data-testid={`item-${index}-container`}
          className={`border rounded p-2 pr-1 ${
            itemsWithErrors.has(index)
              ? "border-red-500 bg-red-100 dark:bg-red-950"
              : ""
          }`}
        >
          {editItemIndex === index ? (
            <ScannedReceiptItemForm
              index={editItemIndex}
              item={receiptData.items[index]}
              onCloseEdit={onCancelEdit}
              onSuccess={handleSubmitItem}
            />
          ) : (
            <>
              <div className="flex justify-between mb-2">
                <div className="grid grid-cols-2 gap-4">
                  <LabeledValue label="Name" value={item.name} required />
                  <LabeledValue label="Brand" value={item.brand} />
                  <p className="font-semibold"></p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditClick(index)}
                    disabled={disabled}
                  >
                    <SquarePenIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteItem(index)}
                    disabled={disabled}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-4">
                <LabeledValue label="Count" value={item.count} />
                <LabeledValue label="Amount" value={item.amount} />
                <LabeledValue label="Unit" value={item.unit} />
                <div className="flex gap-1">
                  <LabeledValue label="Price" value={item.price} required />
                  {item.isSale && (
                    <div>
                      <SaleIndicator />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
