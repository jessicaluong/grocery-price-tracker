import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 bg-secondary backdrop-blur-sm flex flex-col items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="mt-4 text-lg font-medium text-muted-foreground">
        Loading...
      </p>
    </div>
  );
}
