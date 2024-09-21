import { GroceryItem } from "@/lib/types";
import React from "react";

type ItemDetailsProps = {
  item: GroceryItem;
};

export default function ItemDetails({ item }: ItemDetailsProps) {
  return (
    <>
      <p className="flex items-baseline tracking-tight">
        <span className="truncate font-semibold capitalize">{item.name}</span>
        <span className="shrink-0 ml-2 sm:ml-1 text-sm">
          {item.count !== 1 && `${item.count} x `}
          {item.amount} {item.unit}
        </span>
      </p>
      <div className="h-7">
        {item.brand && <p className="capitalize">{item.brand}</p>}
      </div>
    </>
  );
}
