import { DbGroup } from "@/lib/types";

type AddItemForGroupDialogProps = {
  group: DbGroup;
  handleClose: () => void;
};

export default function AddItemForGroupDialog({
  group,
  handleClose,
}: AddItemForGroupDialogProps) {
  return <div>add-item-for-group-dialog</div>;
}
