import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DbGroup } from "@/types/grocery";
import { ItemQuantity } from "../../../item-quantity";
import AddItemToGroupForm from "./add-item-to-group-form";

type AddItemToGroupDialogContentProps = {
  group: DbGroup;
  handleClose: () => void;
};

export default function AddItemToGroupDialogContent({
  group,
  handleClose,
}: AddItemToGroupDialogContentProps) {
  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Add item</DialogTitle>
        <DialogDescription>
          Add an item to{" "}
          <span className="font-bold">
            {group.brand} {group.name} (
            <ItemQuantity
              count={group.count}
              amount={group.amount}
              unit={group.unit}
            ></ItemQuantity>
            ){" "}
          </span>
          from <span className="font-bold">{group.store}</span>.
        </DialogDescription>
      </DialogHeader>
      <AddItemToGroupForm group={group} onSuccess={handleClose} />
    </DialogContent>
  );
}
