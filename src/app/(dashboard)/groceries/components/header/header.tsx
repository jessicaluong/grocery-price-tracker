import { SearchBar } from "./search-bar";
import SortAndViewControls from "./sort-and-view-controls";
import AddItemDialog from "../grocery-action-dialogs/add-item/add-item-dialog";
import UserButton from "./user-button";
import { ThemeToggle } from "./theme-toggle";
import { ShoppingBasket } from "lucide-react";

export default function Header() {
  return (
    <header className="my-2">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <ShoppingBasket className="text-brand" />
            <span className="font-semibold text-xl">My Groceries</span>
          </div>
          <div className="flex gap-2">
            <AddItemDialog />
            <ThemeToggle />
            <UserButton />
          </div>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:justify-between">
          <SearchBar />
          <SortAndViewControls />
        </div>
      </div>
    </header>
  );
}
