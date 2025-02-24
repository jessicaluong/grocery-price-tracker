import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ItemWithView, PriceHistoryData } from "@/lib/types";
import { currencyFormat } from "@/lib/utils";
import { ItemQuantity } from "./item-quantity";
import { useQuery } from "@tanstack/react-query";

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
  const id = view === "LIST" ? item.groupId : item.id;
  const { data, isLoading, error } = useQuery<PriceHistoryData>({
    queryKey: ["priceHistory", id],
    queryFn: () => fetch(`/api/price-history/${id}`).then((res) => res.json()),
    enabled: open && !!id,
  });

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
      </DialogContent>
    </Dialog>
  );
}
