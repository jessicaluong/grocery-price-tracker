import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchBarProps = {
  className?: string;
  onSetSearchQuery: (query: string) => void;
};

export function SearchBar({ className, onSetSearchQuery }: SearchBarProps) {
  // TODO: add buttons to clear text or search? (consider mobile)

  return (
    <Input
      className={cn(
        "w-full sm:flex-1 sm:min-w-[400px] sm:max-w-[500px]",
        className
      )}
      type="search"
      placeholder="Search by item name or brand"
      onChange={(e) => {
        onSetSearchQuery(e.target.value);
      }}
    />
  );
}
