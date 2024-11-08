import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GroceryItem } from "@/lib/types";
import { ItemName, ItemQuantity, ItemBrand } from "./item-details";
import { Price } from "./price-details";
import { PriceChart } from "./price-chart";

type GroceryItemDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: GroceryItem;
};

export default function GroceryItemDialog({
  open,
  onOpenChange,
  item,
}: GroceryItemDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <ItemName name={item.name} />
            <ItemQuantity
              count={item.count}
              amount={item.amount}
              unit={item.unit}
            />
            <ItemBrand brand={item.brand} className="font-semibold" />
          </DialogTitle>
          <DialogDescription className="text-center"></DialogDescription>
        </DialogHeader>
        <p className="capitalize leading-10">{item.store}</p>
        <Price isSale={item.isSale} price={item.price} />
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
