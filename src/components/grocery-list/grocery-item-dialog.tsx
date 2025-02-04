import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ItemWithView } from "@/lib/types";
import { PriceChart } from "./price-chart";
import { currencyFormat } from "@/lib/utils";
import { SaleIndicator } from "./sale-indicator";
import { ItemQuantity } from "./item-quantity";

type GroceryItemDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemWithView: ItemWithView;
};

export default function GroceryItemDialog({
  open,
  onOpenChange,
  itemWithView: { item, view },
}: GroceryItemDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <div>
              <span className="truncate font-semibold capitalize">
                {item.name}
              </span>
              <ItemQuantity
                count={item.count}
                amount={item.amount}
                unit={item.unit}
              />
            </div>
            {item.brand && <div className="capitalize h-7">{item.brand}</div>}
            <div className="flex items-center justify-center">
              <span className="font-light capitalize">
                {view === "LIST" && (
                  <span className="font-light tracking-tight">
                    {item.isSale && <SaleIndicator />}
                    {currencyFormat(item.price)}{" "}
                    <span className="text-sm">@</span>{" "}
                  </span>
                )}
                {item.store}
              </span>
            </div>
          </DialogTitle>
          <DialogDescription className="text-center"></DialogDescription>
        </DialogHeader>
        <PriceChart />
        <div className="flex justify-between mt-[10px]">
          <p>Low $2.99</p>
          <p>Average $3.50</p>
          <p>High $5.00</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
