"use client";

import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReceiptData } from "@/types/receipt";
import { useState } from "react";
import UploadForm from "./upload-form";
import ScannedReceipt from "./scanned-receipt/scanned-receipt";

type ReceiptScannerDialogContentProps = {
  onClose: () => void;
};

export default function ReceiptScannerDialogContent({
  onClose,
}: ReceiptScannerDialogContentProps) {
  const [scanResult, setScanResult] = useState<ReceiptData | null>(null);

  const handleSetScanResult = (results: ReceiptData) => {
    setScanResult(results);
  };

  const getDescriptionText = () => {
    if (!scanResult) {
      return "Upload an image of your receipt to add multiple items.";
    } else if (scanResult.items.length > 0) {
      return "Edit your scanned receipt before adding the items to your grocery tracker.";
    } else {
      return null; // No description for empty items
    }
  };

  const descriptionText = getDescriptionText();

  return (
    <DialogContent
      className="sm:max-w-[425px]"
      onInteractOutside={(e) => {
        e.preventDefault();
      }}
      onEscapeKeyDown={(e) => e.preventDefault()}
    >
      <DialogHeader>
        <DialogTitle>
          {!scanResult ? "Upload Receipt " : "Receipt Details"}
        </DialogTitle>
        {descriptionText && (
          <DialogDescription>{descriptionText}</DialogDescription>
        )}
      </DialogHeader>
      {!scanResult ? (
        <UploadForm onScanResult={handleSetScanResult} />
      ) : (
        <>
          <ScannedReceipt data={scanResult} onSuccess={onClose} />
        </>
      )}
    </DialogContent>
  );
}
