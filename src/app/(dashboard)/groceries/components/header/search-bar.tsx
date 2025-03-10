"use client";

import { Input } from "@/components/ui/input";
import { useUrlParams } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

type SearchBarProps = {
  className?: string;
};

export function SearchBar({ className }: SearchBarProps) {
  const { getParam, updateParam } = useUrlParams();
  const [inputValue, setInputValue] = useState(getParam("query", ""));

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      updateParam("search", "query", inputValue);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [inputValue, updateParam]);

  return (
    <div className={cn("flex items-center relative", className)}>
      <Search className="absolute left-2 h-4 w-4 text-muted-foreground" />
      <Input
        className="pl-8 w-full sm:flex-1 sm:min-w-[400px] sm:max-w-[500px]"
        type="text"
        placeholder="Search by item name and brand"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
    </div>
  );
}
