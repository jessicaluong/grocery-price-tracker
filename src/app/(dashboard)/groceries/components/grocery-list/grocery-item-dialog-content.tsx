import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ItemWithView, PriceHistoryData } from "@/lib/types";
import { PriceChart } from "./price-chart";
import { currencyFormat } from "@/lib/utils";
import { SaleIndicator } from "./sale-indicator";
import { ItemQuantity } from "./item-quantity";
import { useQuery } from "@tanstack/react-query";

type GroceryItemDialogContentProps = ItemWithView;

export function GroceryItemDialogContent({
  item,
  view,
}: GroceryItemDialogContentProps) {
  const testGroupId = "cm7e1plrc0009fctnl47mmj88";
  const id = view === "LIST" ? item.groupId : item.id;
  const { data, isLoading, error } = useQuery<PriceHistoryData>({
    queryKey: ["priceHistory", id],
    queryFn: () => fetch(`/api/price-history/${id}`).then((res) => res.json()),
    // enabled: open && !!id, // Only fetch when dialog is open and we have a groupId
  });

  console.log(data);
  return (
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
            {data &&
              (data.maxPrice === data.minPrice
                ? currencyFormat(data.minPrice)
                : `${currencyFormat(data.minPrice)}-${currencyFormat(
                    data.maxPrice
                  )}`)}
            <span className="text-sm"> @ </span>
            {item.store}
          </div>
        </DialogTitle>
        <DialogDescription className="text-center"></DialogDescription>
      </DialogHeader>
      {data && <PriceChart priceHistory={data.priceHistory} />}
      {/* <div className="flex justify-between mt-[10px]">
        <p>Low {view === "GROUP" && `${currencyFormat(item.minPrice)}`}</p>
        <p>Average $3.50</p>
        <p>High {view === "GROUP" && `${currencyFormat(item.maxPrice)}`}</p>
      </div> */}
    </DialogContent>
  );
}
