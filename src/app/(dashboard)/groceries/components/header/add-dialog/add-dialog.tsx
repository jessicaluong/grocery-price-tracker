"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import SelectModeDialogContent from "./select-mode-dialog-content";
import ReceiptScannerDialogContent from "./receipt/receipt-dialog-content";
import AddItemDialogContent from "./manual/manual-dialog-content";

export default function AddItemDialog() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"selection" | "manual" | "receipt">(
    "selection"
  );

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);

    if (!newOpen) {
      setTimeout(() => setMode("selection"), 300);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => setMode("selection"), 300);
  };

  const handleManualClick = () => {
    setMode("manual");
  };

  const handleReceiptClick = () => {
    setMode("receipt");
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="rounded-3xl">
          <PlusCircledIcon className="mr-2" /> Add
        </Button>
      </DialogTrigger>
      {mode === "selection" && (
        <SelectModeDialogContent
          onManualClick={handleManualClick}
          onReceiptClick={handleReceiptClick}
        />
      )}
      {mode === "manual" && <AddItemDialogContent onClose={handleClose} />}
      {mode === "receipt" && (
        <ReceiptScannerDialogContent onClose={handleClose} />
      )}
    </Dialog>
  );
}
