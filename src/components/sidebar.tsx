"use client";

import SelectInput from "./select-input";

const sortOptions = ["lowest", "newest"];
const viewOptions = ["list", "group"];

export default function SideBar() {
  return (
    <div className="flex flex-col gap-2 p-[10px] pt-[60px] w-[250px]">
      <SelectInput
        label="Sort by"
        options={sortOptions}
        defaultValue={sortOptions[0]}
        onChange={(value) => console.log(`Sort changed to: ${value}`)}
      />
      <SelectInput
        label="View"
        options={viewOptions}
        defaultValue={viewOptions[0]}
        onChange={(value) => console.log(`Sort changed to: ${value}`)}
      />
      {/* <SelectInput label="Category" />
      <SelectInput label="Store" />
      <SelectInput label="Brand" /> */}
    </div>
  );
}
