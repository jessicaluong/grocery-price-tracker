import { GroceryItem } from "@/lib/types";
import { comparePriceFormat, currencyFormat } from "@/lib/utils";
import React from "react";

type PriceDetailsProps = {
  item: GroceryItem;
};

export default function PriceDetails({ item }: PriceDetailsProps) {
  return (
    <div>
      <Price isSale={item.isSale} price={item.price} />
      <PriceComparison item={item} />
    </div>
  );
}

function Price({ isSale, price }: Pick<GroceryItem, "price" | "isSale">) {
  return (
    <p className="font-semibold tracking-tight flex items-center justify-end">
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
