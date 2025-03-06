import { Unit } from "@/lib/types";

type ItemQuantityProps = {
  count: number;
  amount: number;
  unit: Unit;
};

export function ItemQuantity({ count, amount, unit }: ItemQuantityProps) {
  return (
    <span className="shrink-0 ml-2 sm:ml-1 text-sm">
      {count !== 1 && `${count} x `}
      {amount} {unit}
    </span>
  );
}
