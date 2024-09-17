import { SearchBar } from "./search-bar";
import { Button } from "./ui/button";
import { PlusCircledIcon } from "@radix-ui/react-icons";

export default function Header() {
  return (
    <header className="flex flex-col gap-2 pb-[10px]">
      <div className="flex gap-1 sm:justify-between w-full">
        <Button variant="outline">
          <PlusCircledIcon className="mr-2" /> Add Item
        </Button>
        <SearchBar className="hidden sm:block" />
        <Button size="icon" variant="secondary" className="ml-auto sm:ml-0">
          J
        </Button>
      </div>
      <div className="flex w-full max-w-sm items-center space-x-2 sm:hidden">
        <SearchBar />
      </div>
    </header>
  );
}
