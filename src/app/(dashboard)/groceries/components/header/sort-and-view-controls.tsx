"use client";

import SortAndViewSelect from "./sort-and-view-select";
import { SORT_OPTIONS, VIEW_OPTIONS } from "@/lib/constants";
import { SortDisplayValues, ViewDisplayValues } from "@/types/grocery";
import { useUrlParams } from "@/hooks/use-url-params";

export default function SortAndViewControls() {
  const { getDisplayValue, updateParam } = useUrlParams();

  const sortDisplay = getDisplayValue("sort", "sort", "newest");
  const viewDisplay = getDisplayValue("view", "view", "list");

  return (
    <div className="flex gap-4">
      <SortAndViewSelect<SortDisplayValues>
        label="Sort"
        options={Object.values(SORT_OPTIONS).map((option) => option.display)}
        value={sortDisplay}
        onChange={(value) => updateParam("sort", "sort", value)}
      />
      <SortAndViewSelect<ViewDisplayValues>
        label="View"
        options={Object.values(VIEW_OPTIONS).map((option) => option.display)}
        value={viewDisplay}
        onChange={(value) => updateParam("view", "view", value)}
      />
    </div>
  );
}
