import { Unit } from "@/types/grocery";

type ItemQuantityProps = {
  count: number;
  amount: number;
  unit: Unit;
  className?: string;
};

export function ItemQuantity({
  count,
  amount,
  unit,
  className,
}: ItemQuantityProps) {
  return (
    <span className={className}>
      {count !== 1 && `${count} x `}
      {amount} {unit}
    </span>
  );
}
