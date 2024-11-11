"use client";

import CustomDrawer from "../custom-drawer";
import CustomPopover from "../custom-popover";
import { SearchBar } from "./search-bar";
import { Button } from "../ui/button";
import { PlusCircledIcon } from "@radix-ui/react-icons";

type HeaderProps = {
  onSetSearchQuery: (query: string) => void;
};

export default function Header({ onSetSearchQuery }: HeaderProps) {
  return (
    <header className="flex flex-col gap-2 pb-[10px]">
      <div className="flex gap-1 sm:justify-between w-full">
        {/* <CustomPopover />
        <CustomDrawer /> */}
        <Button variant="outline">
          <PlusCircledIcon className="mr-2" /> Add Item
        </Button>
        <SearchBar
          className="hidden sm:block"
          onSetSearchQuery={onSetSearchQuery}
        />
        <Button size="icon" variant="secondary" className="ml-auto sm:ml-0">
          J
        </Button>
      </div>
      <div className="flex w-full max-w-sm items-center space-x-2 sm:hidden">
        <SearchBar onSetSearchQuery={onSetSearchQuery} />
      </div>
    </header>
  );
}
