"use client";

import SelectInput from "./select-input";
import { SORT_OPTIONS, VIEW_OPTIONS } from "@/lib/constants";
import { SortOptions, ViewOptions } from "@/lib/types";

type SideBarProps = {
  sortBy: SortOptions;
  viewMode: ViewOptions;
  onSetSortBy: (mode: SortOptions) => void;
  onSetViewMode: (mode: ViewOptions) => void;
};

export default function SideBar({
  sortBy,
  viewMode,
  onSetSortBy,
  onSetViewMode,
}: SideBarProps) {
  return (
    <div className="flex flex-col gap-2 p-[10px] pt-[60px] w-[250px]">
      <SelectInput<SortOptions>
        label="Sort by"
        options={SORT_OPTIONS}
        value={sortBy}
        onChange={(value) => onSetSortBy(value)}
      />
      <SelectInput<ViewOptions>
        label="View"
        options={VIEW_OPTIONS}
        value={viewMode}
        onChange={(value) => onSetViewMode(value)}
      />
      {/* <SelectInput label="Category" />
      <SelectInput label="Store" />
      <SelectInput label="Brand" /> */}
    </div>
  );
}
