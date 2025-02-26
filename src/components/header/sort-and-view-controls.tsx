"use client";

import SelectInput from "./select-input";
import { SORT_OPTIONS, VIEW_OPTIONS } from "@/lib/constants";
import { SortDisplayValues, ViewDisplayValues } from "@/lib/types";
import { useUrlParams } from "@/lib/hooks";

export default function SortAndViewControls() {
  const { getDisplayValue, updateParam } = useUrlParams();

  const sortDisplay = getDisplayValue("sort", "sort", "newest");
  const viewDisplay = getDisplayValue("view", "view", "list");

  return (
    <div className="flex justify-between sm:gap-2">
      <SelectInput<SortDisplayValues>
        label="Sort"
        options={Object.values(SORT_OPTIONS).map((option) => option.display)}
        value={sortDisplay}
        onChange={(value) => updateParam("sort", "sort", value)}
      />
      <SelectInput<ViewDisplayValues>
        label="View"
        options={Object.values(VIEW_OPTIONS).map((option) => option.display)}
        value={viewDisplay}
        onChange={(value) => updateParam("view", "view", value)}
      />
    </div>
  );
}
