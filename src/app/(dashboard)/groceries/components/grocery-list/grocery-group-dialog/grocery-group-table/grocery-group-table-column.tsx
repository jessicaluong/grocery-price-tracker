import { PricePoint } from "@/types/grocery";
import { currencyFormat, formatDate } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { SaleIndicator } from "../../sale-indicator";
import GroceryItemDropdown from "./grocery-item-dropdown";

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
      const pricePoint = row.original;
      return <GroceryItemDropdown rowData={pricePoint} />;
    },
  },
];
