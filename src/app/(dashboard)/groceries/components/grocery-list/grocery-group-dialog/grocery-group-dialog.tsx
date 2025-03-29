"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ItemWithView, PricePoint } from "@/types/grocery";
import { ItemQuantity } from "../item-quantity";
import GroceryGroupTable from "./grocery-group-table/grocery-group-table";
import { columns } from "./grocery-group-table/grocery-group-table-column";
import GroceryGroupDropdown from "./grocery-group-dropdown";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import GroceryGroupProvider from "@/contexts/grocery-group-provider";
import { PriceChart } from "../price-chart/price-chart";

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
      <GroceryGroupProvider groupId={groupId}>
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
            </DialogTitle>
            <DialogDescription className="text-left text-md text-primary">
              {item.brand && (
                <div className="truncate font-semibold">{item.brand}</div>
              )}
              <div className="truncate">{item.store}</div>
            </DialogDescription>
          </DialogHeader>
          {data && data.length > 0 ? (
            <PriceChart data={data} />
          ) : (
            <span className="text-center text-muted-foreground pb-4">
              No price history available
            </span>
          )}
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
      </GroceryGroupProvider>
    </Dialog>
  );
}
