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
          <DialogTitle></DialogTitle>
          <DialogDescription>
            <ItemName name={item.name} />
            <ItemQuantity
              count={item.count}
              amount={item.amount}
              unit={item.unit}
            />
            <ItemBrand brand={item.brand} />
            <p className="capitalize">{item.store}</p>
            <Price isSale={item.isSale} price={item.price} />
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
