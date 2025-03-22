import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PricePoint } from "@/lib/types";
import EditItemForm from "./edit-item-form";

type EditItemDialogContentProps = {
  item: PricePoint;
  handleClose: () => void;
};

export default function EditItemDialogContent({
  item,
  handleClose,
}: EditItemDialogContentProps) {
  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit item</DialogTitle>
        <DialogDescription>Make changes to this price point.</DialogDescription>
      </DialogHeader>
      <EditItemForm item={item} onSuccess={handleClose} />
    </DialogContent>
  );
}
