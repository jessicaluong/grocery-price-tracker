import { Card, CardContent } from "@/components/ui/card";
import { ItemWithView } from "@/lib/types";
import PriceDetails from "./price-details";
import ItemDetails from "./item-details";
import GroceryItemDialog from "./grocery-item-dialog";
import { useState } from "react";

type GroceryItemCardProps = ItemWithView;

export default function GroceryItemCard({ item, view }: GroceryItemCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const priceDetailsProps = { view, item } as ItemWithView;

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
            <ItemDetails item={item} />
            <p className="font-light capitalize">{item.store}</p>
          </div>
          <div className="shrink-0 text-right">
            <PriceDetails {...priceDetailsProps} />
            <p className="font-light tracking-tighter">
              {view === "LIST" && item.date.toISOString().split("T")[0]}
              {view === "GROUP" &&
                `${item.numberOfItems} ${
                  item.numberOfItems === 1 ? "item" : "items"
                }`}
            </p>
          </div>
        </CardContent>
      </Card>
      {/* <GroceryItemDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        item={item}
      /> */}
    </>
  );
}
