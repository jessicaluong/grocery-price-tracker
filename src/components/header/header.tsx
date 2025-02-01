"use client";

import CustomDrawer from "../custom-drawer";
import CustomPopover from "../custom-popover";
import { SearchBar } from "./search-bar";
import { Button } from "../ui/button";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import SortAndViewControls from "./sort-and-view-controls";

export default function Header() {
  return (
    <header className="flex flex-col gap-2 pb-[10px]">
      <div className="flex flex-col gap-4 w-full">
        {/* <CustomPopover />
        <CustomDrawer /> */}
        {/* <Button variant="outline">
          <PlusCircledIcon className="mr-2" /> Add Item
        </Button> */}
        <div className="flex justify-end items-center gap-2">
          <Button variant="outline">
            <PlusCircledIcon className="mr-2" /> Add Item
          </Button>
          <Button size="icon" variant="secondary">
            J
          </Button>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:justify-between">
          <SearchBar />
          <SortAndViewControls />
        </div>
      </div>
    </header>
  );
}
