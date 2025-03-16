import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontalIcon,
  CopyIcon,
  TrashIcon,
  SquarePenIcon,
} from "lucide-react";
import { useState } from "react";
import { PricePoint } from "@/lib/types";
import DeleteItemDialogContent from "../../../item-dialogs/delete-item/delete-item-dialog-content";
import EditItemDialogContent from "../../../item-dialogs/edit-item/edit-item-dialog-content";
import CopyItemDialogContent from "../../../item-dialogs/copy-item/copy-item-dialog-content";

type DropdownDialogProps = {
  rowData: PricePoint;
};

export default function GroceryItemDropdown({ rowData }: DropdownDialogProps) {
  const [openedDialog, setOpenedDialog] = useState<
    "copy" | "edit" | "delete"
  >();

  return (
    <>
      <Dialog>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-4 w-4 p-0  flex items-center justify-center"
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DialogTrigger
              asChild
              onClick={() => {
                setOpenedDialog("copy");
              }}
            >
              <DropdownMenuItem>
                <CopyIcon /> Copy Item
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogTrigger
              asChild
              onClick={() => {
                setOpenedDialog("edit");
              }}
            >
              <DropdownMenuItem>
                <SquarePenIcon /> Edit Item
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogTrigger
              asChild
              onClick={() => {
                setOpenedDialog("delete");
              }}
            >
              <DropdownMenuItem>
                <TrashIcon /> Delete Item
              </DropdownMenuItem>
            </DialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>
        {openedDialog === "delete" && <DeleteItemDialogContent />}
        {openedDialog === "edit" && <EditItemDialogContent />}
        {openedDialog === "copy" && <CopyItemDialogContent />}
      </Dialog>
    </>
  );
}
