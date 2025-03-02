import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import AddItemForm from "./add-item-form";

export default function AddItemDialog() {
  // const handleSubmit = async () => {
  //   setLoading(true);
  //   try {
  //     const result = await addItemAction();
  //     if (result.success) {
  //       onOpenChange(false);
  //     }
  //   } catch (error) {
  //     console.error("Error adding item:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-3xl">
          <PlusCircledIcon className="mr-2" /> Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Item</DialogTitle>
          <DialogDescription>
            This will add a sample orange juice item.
          </DialogDescription>
        </DialogHeader>
        <AddItemForm />
      </DialogContent>
    </Dialog>
  );
}
