import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ItemWithView } from "@/types/grocery";
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
      <DialogContent className="max-w-sm sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            <div className="flex">
              <span className="truncate font-semibold max-w-[35%] sm:max-w-[60%]">
                {item.name}
              </span>
              <ItemQuantity
                count={item.count}
                amount={item.amount}
                unit={item.unit}
                className="shrink-0 ml-2 mr-2 text-sm"
              />
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
            <div className="flex max-w-[70%] sm:max-w-full">
              {item.brand && <div className="h-7 truncate">{item.brand}</div>}
            </div>
            <div className="flex font-light max-w-[70%] sm:max-w-full">
              <span className="shrink-0">
                {group &&
                  (group.maxPrice === group.minPrice
                    ? currencyFormat(group.minPrice)
                    : `${currencyFormat(group.minPrice)}-${currencyFormat(
                        group.maxPrice
                      )}`)}
              </span>
              <span className="text-sm mx-1 shrink-0"> @ </span>
              <span className="truncate">{item.store}</span>
            </div>
          </DialogTitle>
          <DialogDescription className="text-center"></DialogDescription>
        </DialogHeader>
        <div className="max-w-xs sm:max-w-lg">
          {group && (
            <GroceryGroupTable columns={columns} data={group?.pricePoints} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
