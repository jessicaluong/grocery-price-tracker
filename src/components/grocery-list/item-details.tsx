import { GroceryItem, GroupedGroceryItem } from "@/lib/types";
import React from "react";
import { cn } from "@/lib/utils";

type ItemDetailsProps = {
  item: GroceryItem | GroupedGroceryItem;
};

type ItemBrandProps = {
  className?: string;
} & Pick<GroceryItem, "brand">;

export default function ItemDetails({ item }: ItemDetailsProps) {
  return (
    <div>
      <div className="flex items-baseline tracking-tight">
        <ItemName name={item.name} />
        <ItemQuantity
          count={item.count}
          amount={item.amount}
          unit={item.unit}
        />
      </div>
      <ItemBrand brand={item.brand} className="h-7" />
    </div>
  );
}

export function ItemName({ name }: Pick<GroceryItem, "name">) {
  return <span className="truncate font-semibold capitalize">{name}</span>;
}

export function ItemQuantity({
  count,
  amount,
  unit,
}: Pick<GroceryItem, "count" | "amount" | "unit">) {
  return (
    <span className="shrink-0 ml-2 sm:ml-1 text-sm">
      {count !== 1 && `${count} x `} {amount} {unit}
    </span>
  );
}

export function ItemBrand({ className, brand }: ItemBrandProps) {
  if (brand) {
    return <div className={cn("capitalize", className)}>{brand}</div>;
  }
}
