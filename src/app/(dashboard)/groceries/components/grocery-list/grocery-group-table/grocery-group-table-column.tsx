import { PricePoint } from "@/lib/types";
import { currencyFormat, formatDate } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { SaleIndicator } from "../sale-indicator";
import { CopyIcon, Pencil2Icon, TrashIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import EditItemDialogContent from "../../item-dialogs/edit-item/edit-item-dialog-content";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import DeleteItemDialogContent from "../../item-dialogs/delete-item/delete-item-dialog-content";
import CopyItemDialogContent from "../../item-dialogs/copy-item/copy-item-dialog-content";

export const columns: ColumnDef<PricePoint>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const date = row.getValue("date") as string;
      let formattedDate = formatDate(date);
      return <div className="font-medium">{formattedDate}</div>;
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"));
      const formatted = currencyFormat(price);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "isSale",
    header: "Sale?",
    cell: ({ row }) => {
      const isSale = Boolean(row.getValue("isSale"));
      return <div className="flex">{isSale && <SaleIndicator />}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
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
                  <MoreHorizontal />
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
                    <CopyIcon /> Copy
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogTrigger
                  asChild
                  onClick={() => {
                    setOpenedDialog("edit");
                  }}
                >
                  <DropdownMenuItem>
                    <Pencil2Icon /> Edit
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogTrigger
                  asChild
                  onClick={() => {
                    setOpenedDialog("delete");
                  }}
                >
                  <DropdownMenuItem>
                    <TrashIcon /> Delete
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
    },
  },
];
