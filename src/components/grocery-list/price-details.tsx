import { GroceryItem } from "@/lib/types";
import { comparePriceFormat, currencyFormat, cn } from "@/lib/utils";
import React from "react";

type PriceDetailsProps = {
  item: GroceryItem;
};

type PriceProps = {
  className?: string;
} & Pick<GroceryItem, "price" | "isSale">;

export default function PriceDetails({ item }: PriceDetailsProps) {
  return (
    <div>
      <Price isSale={item.isSale} price={item.price} className="justify-end" />
      <PriceComparison item={item} />
    </div>
  );
}

export function Price({ className, isSale, price }: PriceProps) {
  return (
    <p
      className={cn(
        "font-semibold tracking-tight flex items-center",
        className
      )}
    >
      {isSale && <SaleIndicator />}
      {currencyFormat(price)}
    </p>
  );
}

function SaleIndicator() {
  return (
    <span className="mr-1 bg-red-500 w-[8px] h-[8px] rounded-[2px] inline-block"></span>
  );
}

function PriceComparison({ item }: { item: GroceryItem }) {
  return (
    <p className="text-sm text-muted-foreground tracking-tighter h-7">
      {comparePriceFormat(item.count, item.price, item.amount, item.unit)}
    </p>
  );
}
