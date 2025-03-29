import { Progress } from "@/components/ui/progress";
import { currencyFormat } from "@/lib/utils";

type TooltipFormatProps = {
  date: string;
  price: number;
  count: number;
  saleCount: number;
  avgSalePrice: number;
  avgRegPrice: number;
};

export default function TooltipFormat({
  date,
  price,
  count,
  saleCount,
  avgSalePrice,
  avgRegPrice,
}: TooltipFormatProps) {
  const percentSale = (saleCount / count) * 100;
  const regCount = count - saleCount;

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="font-medium">{date}</div>
      <div className="flex justify-between items-center">
        <span className="mr-2">Average price:</span>{" "}
        <span className="font-mono font-medium">{currencyFormat(price)}</span>
      </div>

      {saleCount > 0 && (
        <div className="flex flex-col">
          <Progress value={percentSale} />
          <div className="flex justify-between items-center text-sale">
            <span className="mr-2">Percent sale prices:</span>{" "}
            <span className="font-mono font-medium">
              {`${Math.round(percentSale)}%`}
            </span>
          </div>
        </div>
      )}

      {saleCount > 0 && regCount > 0 && (
        <div className="flex flex-col">
          <div className="flex justify-between items-center text-sale">
            <span className="mr-2">Sale average:</span>{" "}
            <span className="font-mono font-medium">
              {currencyFormat(avgSalePrice)}
            </span>
          </div>
          <div
            className="flex justify-between items-center text-sale"
            style={{ color: "var(--color-price)" }}
          >
            <span className="mr-2">Regular average:</span>{" "}
            <span className="font-mono font-medium">
              {currencyFormat(avgRegPrice)}
            </span>
          </div>
        </div>
      )}

      <div className="flex text-muted-foreground">
        {count} {count > 1 ? "items" : "item"} ({saleCount} sale,{" "}
        {count - saleCount} regular)
      </div>
    </div>
  );
}
