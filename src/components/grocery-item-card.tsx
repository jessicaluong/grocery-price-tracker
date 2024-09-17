import { Card, CardContent } from "@/components/ui/card";
import { GroceryItem } from "@/lib/types";
import PriceDetails from "./price-details";
import ItemDetails from "./item-details";

type GroceryItemCardProps = {
  item: GroceryItem;
};

export default function GroceryItemCard({ item }: GroceryItemCardProps) {
  return (
    <Card>
      <CardContent className="flex leading-tight">
        <div className="grow mr-4 min-w-0">
          <ItemDetails item={item} />
          <p className="font-light capitalize">{item.store}</p>
        </div>
        <div className="shrink-0 text-right">
          <PriceDetails item={item} />
          <p className="font-light tracking-tighter">{item.date}</p>
        </div>
      </CardContent>
    </Card>
  );
}
