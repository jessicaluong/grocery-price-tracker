"use client";

import { DialogContent } from "@/components/ui/dialog";
import { ReceiptData } from "@/types/receipt";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ReceiptDialogContentUploadForm from "./receipt-dialog-content-upload-form";
import ReceiptDialogContentScannedReceipt from "./receipt-dialog-content-scanned-receipt";
import { useToast } from "@/hooks/use-toast";

type ReceiptScannerDialogContentProps = {
  onClose: () => void;
};

export default function ReceiptScannerDialogContent({
  onClose,
}: ReceiptScannerDialogContentProps) {
  const { toast } = useToast();

  const [scanResult, setScanResult] = useState<ReceiptData | null>(null);
  const { data, isLoading, error } = useQuery({
    queryKey: ["scanQuota"],
    queryFn: async () => {
      const response = await fetch("/api/scan-quota");
      if (!response.ok) {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          description: errorData.error,
        });
      }
      return response.json();
    },
  });

  const handleSetScanResult = (results: ReceiptData | null) => {
    setScanResult(results);
  };

  return (
    <DialogContent
      className="sm:max-w-[425px]"
      onInteractOutside={(e) => {
        e.preventDefault();
      }}
      onEscapeKeyDown={(e) => e.preventDefault()}
    >
      {scanResult ? (
        <ReceiptDialogContentScannedReceipt
          scanResult={scanResult}
          onClose={onClose}
        />
      ) : (
        <ReceiptDialogContentUploadForm
          handleSetScanResult={handleSetScanResult}
          quotaData={data}
          isQuotaLoading={isLoading}
          quotaError={error}
        />
      )}
    </DialogContent>
  );
}
