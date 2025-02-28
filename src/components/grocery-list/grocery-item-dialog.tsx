import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ItemWithView } from "@/lib/types";
import { currencyFormat } from "@/lib/utils";
import { ItemQuantity } from "./item-quantity";

type GroceryItemDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemWithView: ItemWithView;
};

export default function GroceryItemDialog({
  open,
  onOpenChange,
  itemWithView: { view, item, groupMap },
}: GroceryItemDialogProps) {
  const group =
    view === "LIST" ? groupMap.get(item.groupId) : groupMap.get(item.id);

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
            <div className="font-light capitalize">
              {group &&
                (group.maxPrice === group.minPrice
                  ? currencyFormat(group.minPrice)
                  : `${currencyFormat(group.minPrice)}-${currencyFormat(
                      group.maxPrice
                    )}`)}
              <span className="text-sm"> @ </span>
              {item.store}
            </div>
          </DialogTitle>
          <DialogDescription className="text-center"></DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
