import { GroceryItem, ItemWithView } from "@/lib/types";
import { comparePriceFormat, currencyFormat, cn } from "@/lib/utils";
import React from "react";

type PriceDetailsProps = ItemWithView;

type PriceProps = {
  className?: string;
} & (
  | { view: "LIST"; price: number; isSale: boolean }
  | { view: "GROUP"; priceRange: { min: number; max: number } }
);

export default function PriceDetails({ item, view }: PriceDetailsProps) {
  return (
    <div>
      {view === "LIST" ? (
        <>
          <Price
            isSale={item.isSale}
            price={item.price}
            view="LIST"
            className="justify-end"
          />
          <PriceComparison item={item} />
        </>
      ) : (
        <Price
          priceRange={item.priceRange}
          view="GROUP"
          className="justify-end"
        />
      )}
    </div>
  );
}

export function Price(props: PriceProps) {
  const { className } = props;

  const baseClassName = cn(
    "font-semibold tracking-tight flex items-center",
    className
  );

  if (props.view === "LIST") {
    return (
      <p className={baseClassName}>
        {props.isSale && <SaleIndicator />}
        {currencyFormat(props.price)}
      </p>
    );
  }

  return (
    <p className={baseClassName}>
      {currencyFormat(props.priceRange.min)} -
      {currencyFormat(props.priceRange.max)}
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
