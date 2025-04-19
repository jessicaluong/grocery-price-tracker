"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CirclePlusIcon,
  MoreHorizontalIcon,
  SquarePenIcon,
  TrashIcon,
} from "lucide-react";
import { useState } from "react";
import { DbGroup } from "@/types/grocery";
import { useToast } from "@/hooks/use-toast";
import { deleteGroupAction } from "@/actions/grocery-actions";
import AddItemToGroupDialogContent from "./add-item-to-group/add-item-to-group-dialog-content";
import EditGroupDialogContent from "./edit-group/edit-group-dialog-content";

type GroceryGroupDropdownProps = {
  group: DbGroup;
};

export default function GroceryGroupDropdown({
  group,
}: GroceryGroupDropdownProps) {
  const [openedDialog, setOpenedDialog] = useState<"add" | "edit">();
  const { toast } = useToast();

  const handleClose = () => {
    setOpenedDialog(undefined);
  };

  const handleDeleteGroup = async () => {
    try {
      const response = await deleteGroupAction(group.id);
      if (response.error) {
        toast({
          variant: "destructive",
          description: response.error,
        });
      } else if (response.success) {
        toast({
          description: "Group deleted.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        description: "An error occurred while deleting group",
      });
    }
  };

  return (
    <Dialog>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-4 w-4 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DialogTrigger
            asChild
            onClick={() => {
              setOpenedDialog("add");
            }}
          >
            <DropdownMenuItem>
              <CirclePlusIcon /> Add Item
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogTrigger
            asChild
            onClick={() => {
              setOpenedDialog("edit");
            }}
          >
            <DropdownMenuItem>
              <SquarePenIcon /> Edit Group
            </DropdownMenuItem>
          </DialogTrigger>
          <DropdownMenuItem onClick={() => handleDeleteGroup()}>
            <TrashIcon /> Delete Group
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {openedDialog === "add" && (
        <AddItemToGroupDialogContent group={group} handleClose={handleClose} />
      )}
      {openedDialog === "edit" && (
        <EditGroupDialogContent group={group} handleClose={handleClose} />
      )}
    </Dialog>
  );
}
