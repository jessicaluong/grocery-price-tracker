import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EditGroupForm from "./edit-group-form";
import { DbGroup } from "@/types/grocery";
import { ItemQuantity } from "../../grocery-list/item-quantity";

type EditGroupDialogProps = {
  group: DbGroup;
  handleClose: () => void;
};

export default function EditGroupDialogContent({
  group,
  handleClose,
}: EditGroupDialogProps) {
  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit group</DialogTitle>
        <DialogDescription>
          Make changes to{" "}
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
      <EditGroupForm group={group} onSuccess={handleClose} />
    </DialogContent>
  );
}
