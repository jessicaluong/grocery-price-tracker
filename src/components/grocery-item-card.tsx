import { Card, CardContent } from "@/components/ui/card";
import { GroceryItem } from "@/lib/types";
import { comparePriceFormat, currencyFormat } from "@/lib/utils";

type GroceryItemCardProps = {
  item: GroceryItem;
};

export default function GroceryItemCard({ item }: GroceryItemCardProps) {
  return (
    <Card>
      <CardContent className="flex leading-tight">
        <div className="grow mr-4 min-w-0">
          <p className="flex items-baseline tracking-tight">
            <span className="truncate font-semibold capitalize">
              {item.name}
            </span>
            <span className="shrink-0 ml-2 sm:ml-1 text-sm">
              {item.count !== 1 && `${item.count} x `}
              {item.amount} {item.unit}
            </span>
          </p>
          <div className="h-7">
            {item.brand && <p className="capitalize">{item.brand}</p>}
          </div>
          <p className="font-light capitalize">{item.store}</p>
        </div>

        <div className="shrink-0 text-right">
          <p className="font-semibold tracking-tight flex items-center justify-end">
            {item.isSale && (
              <span className="mr-1 bg-red-500 w-[8px] h-[8px] rounded-[2px] inline-block"></span>
            )}
            {currencyFormat(item.price)}
          </p>
          <p className="text-sm text-muted-foreground tracking-tighter h-7">
            {comparePriceFormat(item.count, item.price, item.amount, item.unit)}
          </p>
          <p className="font-light tracking-tighter">{item.date}</p>
        </div>
      </CardContent>
    </Card>
  );
}
