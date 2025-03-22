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
import EditItemDialogContent from "../../../item-dialogs/edit-item/edit-item-dialog-content";
import CopyItemDialogContent from "../../../item-dialogs/copy-item/copy-item-dialog-content";
import { deleteItemAction } from "@/actions/grocery-actions";
import { useToast } from "@/hooks/use-toast";

type DropdownDialogProps = {
  rowData: PricePoint;
};

export default function GroceryItemDropdown({ rowData }: DropdownDialogProps) {
  const [openedDialog, setOpenedDialog] = useState<"copy" | "edit">();
  const { toast } = useToast();

  const handleClose = () => {
    setOpenedDialog(undefined);
  };

  const handleDeleteItem = async () => {
    try {
      const response = await deleteItemAction(rowData.id);
      if (response.error) {
        toast({
          variant: "destructive",
          description: response.error,
        });
      } else if (response.success) {
        toast({
          description: "Item deleted.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        description: "An error occurred while deleting item",
      });
    }
  };

  return (
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
          <DropdownMenuItem onClick={() => handleDeleteItem()}>
            <TrashIcon /> Delete Item
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {openedDialog === "edit" && (
        <EditItemDialogContent item={rowData} handleClose={handleClose} />
      )}
      {openedDialog === "copy" && <CopyItemDialogContent />}
    </Dialog>
  );
}
