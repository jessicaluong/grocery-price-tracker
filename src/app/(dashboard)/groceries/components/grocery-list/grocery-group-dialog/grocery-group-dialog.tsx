"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ItemWithView, PricePoint } from "@/types/grocery";
import { currencyFormat } from "@/lib/utils";
import { ItemQuantity } from "../item-quantity";
import GroceryGroupTable from "./grocery-group-table/grocery-group-table";
import { columns } from "./grocery-group-table/grocery-group-table-column";
import GroceryGroupDropdown from "./grocery-group-dropdown";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

type GroceryGroupDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemWithView: ItemWithView;
};

export default function GroceryGroupDialog({
  open,
  onOpenChange,
  itemWithView: { view, item, groupMap },
}: GroceryGroupDialogProps) {
  const { toast } = useToast();

  const groupId = view === "LIST" ? item.groupId : item.id;
  const groupInfo = groupMap.get(groupId);

  const { data, isLoading, error } = useQuery<PricePoint[]>({
    queryKey: ["priceHistory", groupId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/price-history/${groupId}`);

        if (!response.ok) {
          const errorData = await response.json();
          toast({
            variant: "destructive",
            description: errorData.error,
          });
        }

        return response.json();
      } catch (error) {
        toast({
          variant: "destructive",
          description: "An error occurred while fetching price history",
        });
      }
    },
    enabled: open && !!groupId,
  });

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
              {groupInfo && (
                <GroceryGroupDropdown
                  group={{
                    id: groupId,
                    name: groupInfo.name,
                    brand: groupInfo.brand,
                    store: groupInfo.store,
                    count: groupInfo.count,
                    amount: groupInfo.amount,
                    unit: groupInfo.unit,
                  }}
                />
              )}
            </div>
            <div className="flex max-w-[70%] sm:max-w-full">
              {item.brand && <div className="h-7 truncate">{item.brand}</div>}
            </div>
            <div className="flex font-light max-w-[70%] sm:max-w-full">
              <span className="shrink-0">
                {groupInfo &&
                  groupInfo.minPrice &&
                  groupInfo.maxPrice &&
                  (groupInfo.maxPrice === groupInfo.minPrice
                    ? currencyFormat(groupInfo.minPrice)
                    : `${currencyFormat(groupInfo.minPrice)}-${currencyFormat(
                        groupInfo.maxPrice
                      )}`)}
              </span>
              <span className="text-sm mx-1 shrink-0"> @ </span>
              <span className="truncate">{item.store}</span>
            </div>
          </DialogTitle>
          <DialogDescription className="text-center"></DialogDescription>
        </DialogHeader>
        <div className="max-w-xs sm:max-w-lg">
          {isLoading && (
            <p className="text-center py-4">Loading price history...</p>
          )}
          {data ? (
            <GroceryGroupTable columns={columns} data={data} />
          ) : !isLoading && !error ? (
            <p className="text-center py-4">No price history available.</p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
