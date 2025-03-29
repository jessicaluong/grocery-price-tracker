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
import PriceChartDemo from "../price-chart/price-chart-2";
import { PriceChart3 } from "../price-chart/price-chart-3";
import { PriceChart3a } from "../price-chart/price-chart-3a";
import GroceryGroupProvider from "@/contexts/grocery-group-provider";
import { PriceChart } from "../price-chart/price-chart";
import PriceChartProvider from "@/contexts/price-chart-provider";

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
        <DialogContent className="max-w-sm sm:max-w-lg gap-2">
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
              {/* <div className="flex font-light max-w-[70%] sm:max-w-full">
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
            </div> */}
            </DialogTitle>
            <DialogDescription className="text-left text-md text-primary">
              {item.brand && (
                <div className="truncate font-semibold">{item.brand}</div>
              )}
              <div className="truncate">{item.store}</div>
            </DialogDescription>
          </DialogHeader>
          {/* <div className="grid grid-cols-3 gap-4 mb-6 text-center font-light">
        <div className="bg-green-50 p-2 rounded-md">
          <p className="text-xs text-green-700">Lowest</p>
          <p className="font-semibold">{currencyFormat(1)}</p>
        </div>
        <div className="bg-blue-50 p-2 rounded-md">
          <p className="text-xs text-blue-700">Average</p>
          <p className="font-semibold">{currencyFormat(2)}</p>
        </div>
        <div className="bg-red-50 p-2 rounded-md">
          <p className="text-xs text-red-700">Highest</p>
          <p className="font-semibold">{currencyFormat(3)}</p>
        </div>
      </div> */}
          {data && data.length > 0 ? (
            <PriceChartProvider>
              <PriceChart data={data} />
            </PriceChartProvider>
          ) : (
            // <PriceChart3 data={data} />
            <span className="text-center text-muted-foreground pb-4">
              No price history available
            </span>
          )}
          {/* 
          {data && data.length > 0 ? (
            <PriceChart3a data={data} />
          ) : (
            <span className="text-center text-muted-foreground pb-4">
              No price history available
            </span>
          )} */}

          {/* {data && data.length > 0 ? (
          <PriceChart3 data={data} />
        ) : (
          <span className="text-center text-muted-foreground pb-4">
            No price history available
          </span>
        )} */}
          {/* <PriceChartDemo></PriceChartDemo> */}

          {/* <div className="max-w-xs sm:max-w-lg">
            {isLoading && (
              <p className="text-center py-4">Loading price history...</p>
            )}
            {data ? (
              <GroceryGroupTable columns={columns} data={data} />
            ) : !isLoading && !error ? (
              <p className="text-center py-4">No price history available.</p>
            ) : null}
          </div> */}
        </DialogContent>
      </GroceryGroupProvider>
    </Dialog>
  );
}
