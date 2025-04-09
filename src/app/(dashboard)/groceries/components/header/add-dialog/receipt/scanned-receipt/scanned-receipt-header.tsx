"use client";

import { Button } from "@/components/ui/button";
import { ReceiptData } from "@/types/receipt";
import { SquarePenIcon } from "lucide-react";
import { ScannedReceiptHeaderForm } from "./scanned-receipt-header-form";
import LabeledValue from "./labeled-value";
import { formatDate } from "@/lib/utils";

type ScannedReceiptHeaderProps = {
  receiptData: ReceiptData;
  handleSubmitHeader: (store: string, date: Date) => void;
  onEditClick: () => void;
  onCancelEdit: () => void;
  editMode: "header" | "item" | null;
  disabled: boolean;
  hasErrors: boolean;
};

export default function ScannedReceiptHeader({
  receiptData,
  handleSubmitHeader,
  onEditClick,
  onCancelEdit,
  editMode,
  disabled,
  hasErrors,
}: ScannedReceiptHeaderProps) {
  return editMode === "header" ? (
    <div className="flex border rounded p-2 items-center justify-between">
      <ScannedReceiptHeaderForm
        receiptData={receiptData}
        onCloseEdit={onCancelEdit}
        onSuccess={handleSubmitHeader}
      />
    </div>
  ) : (
    <div
      data-testid="header-container"
      className={`flex border ${
        hasErrors ? "border-red-500 bg-red-100" : ""
      } rounded p-2 pr-1 items-center justify-between`}
    >
      <div className="grid grid-cols-2 gap-4">
        <LabeledValue
          label="Store"
          value={receiptData.store}
          valueClassName="font-semibold"
          required
        />
        <LabeledValue
          label="Date"
          value={receiptData.date ? formatDate(receiptData.date) : null}
          valueClassName="font-semibold"
          required
        />
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onEditClick}
        disabled={disabled}
      >
        <SquarePenIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}
