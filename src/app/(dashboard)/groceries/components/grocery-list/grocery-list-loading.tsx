import { Loader2 } from "lucide-react";

export default function GroceryListLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-[400px] w-full">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="mt-4 text-lg text-muted-foreground">Fetching items...</p>
    </div>
  );
}
