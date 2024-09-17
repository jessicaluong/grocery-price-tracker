import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchBarProps = {
  className?: string;
};

export function SearchBar({ className }: SearchBarProps) {
  return (
    <Input
      className={cn(
        "w-full sm:flex-1 sm:min-w-[200px] sm:max-w-[300px]",
        className
      )}
      type="search"
      placeholder="Search for item name"
    />
  );
}
