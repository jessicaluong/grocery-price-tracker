"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ItemWithView } from "@/lib/types";
import GroceryItemDialog from "./grocery-item-dialog";
import { useState } from "react";
import { ItemQuantity } from "./item-quantity";
import {
  comparePriceFormat,
  currencyFormat,
  getConvertedPrice,
} from "@/lib/utils";
import { SaleIndicator } from "./sale-indicator";

type GroceryItemCardProps = ItemWithView;

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
              <div className="flex items-baseline tracking-tight">
                <span className="truncate font-semibold capitalize">
                  {item.name}
                </span>
                <ItemQuantity
                  count={item.count}
                  amount={item.amount}
                  unit={item.unit}
                />
              </div>
              <div className="capitalize h-7">{item.brand && item.brand}</div>
            </div>
            <p className="font-light capitalize">{item.store}</p>
          </div>
          <div className="shrink-0 text-right">
            {view === "LIST" && (
              <>
                <p className="font-semibold tracking-tight flex items-center justify-end">
                  {item.isSale && <SaleIndicator />}
                  {currencyFormat(item.price)}
                </p>
                <p className="text-sm text-muted-foreground tracking-tighter h-7">
                  {comparePriceFormat(
                    item.count,
                    item.price,
                    item.amount,
                    item.unit
                  )}
                </p>
              </>
            )}
            {view === "GROUP" && (
              <>
                <p className="font-semibold tracking-tight flex items-center justify-end">
                  {item.minPrice !== item.maxPrice &&
                    `${currencyFormat(item.minPrice)}-`}
                  {currencyFormat(item.maxPrice)}
                </p>
                <p className="text-sm text-muted-foreground tracking-tighter h-7">
                  {item.minPrice !== item.maxPrice &&
                    `${currencyFormat(
                      getConvertedPrice(
                        item.count,
                        item.minPrice,
                        item.amount,
                        item.unit
                      )
                    )}-`}
                  {comparePriceFormat(
                    item.count,
                    item.maxPrice,
                    item.amount,
                    item.unit
                  )}
                </p>
              </>
            )}
            <p className="font-light tracking-tighter">
              {view === "LIST" && item.date.toISOString().split("T")[0]}
              {view === "GROUP" &&
                `${item.priceHistory.length} ${
                  item.priceHistory.length === 1 ? "item" : "items"
                }`}
            </p>
          </div>
        </CardContent>
      </Card>
      {isDialogOpen && (
        <GroceryItemDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          itemWithView={itemWithView}
        />
      )}
    </>
  );
}
