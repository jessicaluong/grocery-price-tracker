"use client";

import { Input } from "@/components/ui/input";
import { useUrlParams } from "@/lib/hooks";
import { cn } from "@/lib/utils";
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
    <Input
      className={cn(
        "w-full sm:flex-1 sm:min-w-[400px] sm:max-w-[500px]",
        className
      )}
      type="search"
      placeholder="Search by item name and brand"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
    />
  );
}
