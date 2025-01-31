import { Input } from "@/components/ui/input";
import { useFilter } from "@/lib/hooks";
import { cn } from "@/lib/utils";

type SearchBarProps = {
  className?: string;
};

export function SearchBar({ className }: SearchBarProps) {
  const { handleSetSearchQuery } = useFilter();
  // TODO: add buttons to clear text or search? (consider mobile)

  return (
    <Input
      className={cn(
        "w-full sm:flex-1 sm:min-w-[400px] sm:max-w-[500px]",
        className
      )}
      type="search"
      placeholder="Search by item name and brand"
      onChange={(e) => {
        handleSetSearchQuery(e.target.value);
      }}
    />
  );
}
