"use client";
import SelectInput from "../select-input";
import { SORT_OPTIONS, VIEW_OPTIONS } from "@/lib/constants";
import { useFilter } from "@/lib/hooks";
import { SortOptions, ViewOptions } from "@/lib/types";

export default function SortAndViewControls() {
  const { sortBy, handleSetSortBy, viewMode, handleSetViewMode } = useFilter();

  return (
    <div className="flex justify-between sm:gap-2">
      <SelectInput<SortOptions>
        label="Sort"
        options={Object.values(SORT_OPTIONS)}
        value={sortBy}
        onChange={(value) => handleSetSortBy(value)}
      />
      <SelectInput<ViewOptions>
        label="View"
        options={Object.values(VIEW_OPTIONS)}
        value={viewMode}
        onChange={(value) => handleSetViewMode(value)}
      />
    </div>
  );
}
