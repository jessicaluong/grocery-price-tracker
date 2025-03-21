import { SearchBar } from "./search-bar";
import SortAndViewControls from "./sort-and-view-controls";
import AddItemDialog from "../item-dialogs/add-item/add-item-dialog";
import UserButton from "./user-profile-dialog";

export default function Header() {
  return (
    <header className="flex flex-col gap-2 pb-[10px]">
      <div className="flex flex-col gap-4 w-full">
        <div className="flex justify-end items-center gap-2">
          <AddItemDialog />
          <UserButton />
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:justify-between">
          <SearchBar />
          <SortAndViewControls />
        </div>
      </div>
    </header>
  );
}
