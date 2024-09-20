"use client";

import { Input } from "@/components/ui/input";
import { useSearch } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { useState } from "react";

type SearchBarProps = {
  className?: string;
};

export function SearchBar({ className }: SearchBarProps) {
  const { searchQuery, handleSetSearchQuery } = useSearch();

  return (
    <Input
      className={cn(
        "w-full sm:flex-1 sm:min-w-[200px] sm:max-w-[300px]",
        className
      )}
      type="search"
      placeholder="Search for item"
      value={searchQuery}
      onChange={(e) => {
        handleSetSearchQuery(e.target.value);
      }}
    />
  );
}
