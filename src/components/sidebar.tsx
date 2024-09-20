"use client";

import { useFilter } from "@/lib/hooks";
import SelectInput from "./select-input";
import { SORT_OPTIONS, VIEW_OPTIONS } from "@/lib/constants";

export default function SideBar() {
  const { sortBy, viewMode, handleSetSortBy, handleSetViewMode } = useFilter();

  return (
    <div className="flex flex-col gap-2 p-[10px] pt-[60px] w-[250px]">
      <SelectInput
        label="Sort by"
        options={SORT_OPTIONS}
        value={sortBy}
        onChange={(value) => handleSetSortBy(value)}
      />
      <SelectInput
        label="View"
        options={VIEW_OPTIONS}
        value={viewMode}
        onChange={(value) => handleSetViewMode(value)}
      />
      {/* <SelectInput label="Category" />
      <SelectInput label="Store" />
      <SelectInput label="Brand" /> */}
    </div>
  );
}
