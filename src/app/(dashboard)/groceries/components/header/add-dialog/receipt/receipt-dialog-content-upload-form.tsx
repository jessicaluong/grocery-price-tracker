import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import UploadForm from "./upload-form";
import { ReceiptData } from "@/types/receipt";
import ReceiptQuotaDisplay from "./receipt-quota-display";
import { Loader2 } from "lucide-react";

type ReceiptDialogContentUploadFormProps = {
  handleSetScanResult: (results: ReceiptData | null) => void;
  isQuotaLoading: boolean;
  quotaError: Error | null;
  quotaData: { dailyRemaining: number; monthlyRemaining: number } | null;
};
export default function ReceiptDialogContentUploadForm({
  handleSetScanResult,
  isQuotaLoading,
  quotaError,
  quotaData,
}: ReceiptDialogContentUploadFormProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Upload Receipt</DialogTitle>
        <DialogDescription>
          {isQuotaLoading ? (
            <span className="flex items-center justify-center space-x-2 py-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading usage stats...
            </span>
          ) : quotaData ? (
            <ReceiptQuotaDisplay
              dailyRemaining={quotaData.dailyRemaining}
              monthlyRemaining={quotaData.monthlyRemaining}
            />
          ) : quotaError ? (
            <span className="flex items-center justify-center space-x-2 py-2 text-red-500">
              Unable to load usage stats. Please try again later.
            </span>
          ) : null}
        </DialogDescription>
      </DialogHeader>
      <UploadForm
        onScanResult={handleSetScanResult}
        hasScansRemaining={
          quotaData !== null &&
          quotaData?.dailyRemaining > 0 &&
          quotaData?.monthlyRemaining > 0
        }
      />
    </>
  );
}
