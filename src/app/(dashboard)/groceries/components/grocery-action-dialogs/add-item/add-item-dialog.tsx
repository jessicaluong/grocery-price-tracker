"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import AddItemForm from "./add-item-form";

export default function AddItemDialog() {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-3xl">
          <PlusCircledIcon className="mr-2" /> Add item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add item</DialogTitle>
          <DialogDescription>
            This will add a new grocery item.
          </DialogDescription>
        </DialogHeader>
        <AddItemForm onSuccess={handleClose} />
      </DialogContent>
    </Dialog>
  );
}
