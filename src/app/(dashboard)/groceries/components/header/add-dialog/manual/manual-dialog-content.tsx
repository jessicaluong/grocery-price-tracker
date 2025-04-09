import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AddItemForm from "./add-item-form";

type AddItemDialogContentProps = {
  onClose: () => void;
};

export default function AddItemDialogContent({
  onClose,
}: AddItemDialogContentProps) {
  return (
    <DialogContent
      className="sm:max-w-[425px]"
      onInteractOutside={(e) => {
        e.preventDefault();
      }}
      onEscapeKeyDown={(e) => e.preventDefault()}
    >
      <DialogHeader>
        <DialogTitle>Add Item Manually</DialogTitle>
        <DialogDescription>
          Enter details for a single grocery item.
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-3 mt-2">
        <AddItemForm onSuccess={onClose} />
      </div>
    </DialogContent>
  );
}
