import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ScannedReceipt from "./scanned-receipt/scanned-receipt";
import { ReceiptData } from "@/types/receipt";

type ReceiptDialogContentScannedReceiptProps = {
  scanResult: ReceiptData;
  onClose: () => void;
};

export default function ReceiptDialogContentScannedReceipt({
  scanResult,
  onClose,
}: ReceiptDialogContentScannedReceiptProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Receipt Details</DialogTitle>
        <DialogDescription>
          {scanResult.items.length > 0
            ? "Edit your scanned receipt before adding the items to your grocery tracker."
            : ""}
        </DialogDescription>
      </DialogHeader>
      {scanResult.items.length > 0 ? (
        <ScannedReceipt data={scanResult} onSuccess={onClose} />
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
          <p>No items found on this receipt. </p>
          <p className="text-sm mt-2">
            Try scanning a different receipt or add items manually.
          </p>
        </div>
      )}
    </>
  );
}
