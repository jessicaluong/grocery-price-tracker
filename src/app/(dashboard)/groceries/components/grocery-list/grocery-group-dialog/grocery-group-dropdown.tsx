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
import EditGroupDialogContent from "../../group-dialogs/edit-group/edit-group-dialog-content";
import AddItemForGroupDialog from "./add-item-for-group-dialog";
import { DbGroup } from "@/lib/types";

type GroceryGroupDropdownProps = {
  group: DbGroup;
};

export default function GroceryGroupDropdown({
  group,
}: GroceryGroupDropdownProps) {
  const [openedDialog, setOpenedDialog] = useState<"add" | "edit" | "delete">();

  const handleClose = () => {
    setOpenedDialog(undefined);
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
          {/* <DialogTrigger
            asChild
            onClick={() => {
              setOpenedDialog("delete");
            }}
          > */}
          <DropdownMenuItem>
            <TrashIcon /> Delete Group
          </DropdownMenuItem>
          {/* </DialogTrigger> */}
        </DropdownMenuContent>
      </DropdownMenu>
      {openedDialog === "add" && (
        <AddItemForGroupDialog group={group} handleClose={handleClose} />
      )}
      {openedDialog === "edit" && (
        <EditGroupDialogContent group={group} handleClose={handleClose} />
      )}
      {/* {openedDialog === "delete" && <DeleteItemDialogContent />} */}
    </Dialog>
  );
}
