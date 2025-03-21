import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ItemWithView } from "@/lib/types";
import { currencyFormat } from "@/lib/utils";
import { ItemQuantity } from "../item-quantity";
import GroceryGroupTable from "./grocery-group-table/grocery-group-table";
import { columns } from "./grocery-group-table/grocery-group-table-column";
import GroceryGroupDropdown from "./grocery-group-dropdown";

type GroceryItemDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemWithView: ItemWithView;
};

export default function GroceryGroupDialog({
  open,
  onOpenChange,
  itemWithView: { view, item, groupMap },
}: GroceryItemDialogProps) {
  const groupId = view === "LIST" ? item.groupId : item.id;
  const group = groupMap.get(groupId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <div className="flex">
              <span className="truncate font-semibold">{item.name}</span>
              <ItemQuantity
                count={item.count}
                amount={item.amount}
                unit={item.unit}
                className="shrink-0 ml-2 sm:ml-1 text-sm"
              />
              <div className="ml-2">
                {group && (
                  <GroceryGroupDropdown
                    group={{
                      id: groupId,
                      name: group.name,
                      brand: group.brand,
                      store: group.store,
                      count: group.count,
                      amount: group.amount,
                      unit: group.unit,
                    }}
                  />
                )}
              </div>
            </div>
            {item.brand && <div className="h-7">{item.brand}</div>}
            <div className="font-light">
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
        {group && (
          <GroceryGroupTable columns={columns} data={group?.pricePoints} />
        )}
      </DialogContent>
    </Dialog>
  );
}
