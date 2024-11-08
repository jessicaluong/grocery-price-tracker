import { Input } from "@/components/ui/input";
import { useFilter } from "@/lib/hooks";
import { cn } from "@/lib/utils";

type SearchBarProps = {
  className?: string;
};

export function SearchBar({ className }: SearchBarProps) {
  const { searchQuery, handleSetSearchQuery } = useFilter();

  // TODO: add buttons to clear text or search? (consider mobile)

  return (
    <Input
      className={cn(
        "w-full sm:flex-1 sm:min-w-[200px] sm:max-w-[300px]",
        className
      )}
      type="search"
      placeholder="Search by item name or brand"
      value={searchQuery}
      onChange={(e) => {
        handleSetSearchQuery(e.target.value);
      }}
    />
  );
}
