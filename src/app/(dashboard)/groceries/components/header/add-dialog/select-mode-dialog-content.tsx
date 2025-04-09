import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PencilIcon, ReceiptTextIcon } from "lucide-react";

type SelectModeDialogContentProps = {
  onManualClick: () => void;
  onReceiptClick: () => void;
};

export default function SelectModeDialogContent({
  onManualClick,
  onReceiptClick,
}: SelectModeDialogContentProps) {
  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Add to Grocery Tracker</DialogTitle>
        <DialogDescription>
          Add items individually or import items from a receipt.
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-3 mt-2">
        <Button onClick={onManualClick} variant="default">
          <PencilIcon className="mr-2 h-4 w-4" /> Enter Item Manually
        </Button>
        <Button onClick={onReceiptClick} variant="outline">
          <ReceiptTextIcon className="mr-2 h-4 w-4" /> Scan Receipt
        </Button>
      </div>
    </DialogContent>
  );
}
