"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ItemWithView, Unit } from "@/types/grocery";
import GroceryGroupDialog from "./grocery-group-dialog/grocery-group-dialog";
import { useState } from "react";
import { ItemQuantity } from "./item-quantity";
import {
  comparePriceFormat,
  currencyFormat,
  formatDate,
  getConvertedPrice,
} from "@/lib/utils";
import { SaleIndicator } from "@/components/sale-indicator";

type GroceryItemCardProps = ItemWithView;

type ItemPriceProps = {
  price: number;
  isSale: boolean;
  count: number;
  amount: number;
  unit: Unit;
};

function ItemPrice({ price, isSale, count, amount, unit }: ItemPriceProps) {
  return (
    <>
      <p className="font-semibold tracking-tight flex items-center justify-end gap-1">
        {isSale && <SaleIndicator />}
        {currencyFormat(price)}
      </p>
      <p className="text-sm text-themed tracking-tighter h-7">
        {comparePriceFormat(count, price, amount, unit)}
      </p>
    </>
  );
}

type GroupPriceRangeProps = {
  minPrice: number | null;
  maxPrice: number | null;
  count: number;
  amount: number;
  unit: Unit;
};

function GroupPriceRange({
  minPrice,
  maxPrice,
  count,
  amount,
  unit,
}: GroupPriceRangeProps) {
  if (!maxPrice) {
    return (
      <>
        <p className="font-semibold tracking-tight flex items-center justify-end">
          &nbsp;
        </p>
        <p className="text-sm text-themed tracking-tighter h-7"></p>
      </>
    );
  }

  return (
    <>
      <p className="font-semibold tracking-tight flex items-center justify-end">
        {minPrice && minPrice !== maxPrice && `${currencyFormat(minPrice)}-`}
        {currencyFormat(maxPrice)}
      </p>
      <p className="text-sm text-themed tracking-tighter h-7">
        {minPrice &&
          minPrice !== maxPrice &&
          `${currencyFormat(
            getConvertedPrice(count, minPrice, amount, unit)
          )}-`}
        {comparePriceFormat(count, maxPrice, amount, unit)}
      </p>
    </>
  );
}

export default function GroceryItemCard({
  view,
  item,
  groupMap,
}: GroceryItemCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const itemWithView = { view, item, groupMap } as ItemWithView;

  return (
    <>
      <Card
        onClick={() => {
          setIsDialogOpen(true);
        }}
        className="cursor-pointer"
      >
        <CardContent className="flex leading-tight">
          <div className="grow mr-4 min-w-0">
            <div>
              <div className="flex tracking-tight">
                <span className="truncate font-semibold">{item.name}</span>
                <ItemQuantity
                  count={item.count}
                  amount={item.amount}
                  unit={item.unit}
                  className="shrink-0 ml-2 sm:ml-1 text-sm"
                />
              </div>
              <div className="flex">
                <span className="truncate h-7 font-semibold tracking-tight">
                  {item.brand && item.brand}
                </span>
              </div>
            </div>
            <div className="flex">
              <p className="truncate">{item.store}</p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            {view === "LIST" && (
              <ItemPrice
                price={item.price}
                isSale={item.isSale}
                count={item.count}
                amount={item.amount}
                unit={item.unit}
              ></ItemPrice>
            )}
            {view === "GROUP" && (
              <GroupPriceRange
                minPrice={item.minPrice}
                maxPrice={item.maxPrice}
                count={item.count}
                amount={item.amount}
                unit={item.unit}
              ></GroupPriceRange>
            )}
            <p className="font-light tracking-tight">
              {view === "LIST" && formatDate(item.date)}
              {view === "GROUP" &&
                `${item.itemCount} ${
                  Number(item.itemCount) === 1 ? "item" : "items"
                }`}
            </p>
          </div>
        </CardContent>
      </Card>
      {isDialogOpen && (
        <GroceryGroupDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          itemWithView={itemWithView}
        />
      )}
    </>
  );
}
