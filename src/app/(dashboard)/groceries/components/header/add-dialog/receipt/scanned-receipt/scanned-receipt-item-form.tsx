"use client";

import { ReceiptItem } from "@/types/receipt";
import {
  receiptItemSchema,
  TReceiptItemSchema,
} from "@/zod-schemas/receipt-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ReceiptFormInput from "./receipt-form-input";
import ReceiptFormCheckbox from "./receipt-form-checkbox";
import { ReceiptFormSelect } from "./receipt-form-select";
import { Unit, UnitEnum } from "@/types/grocery";

type ScannedReceiptItemFormProps = {
  index: number;
  item: ReceiptItem;
  onCloseEdit: () => void;
  onSuccess: (index: number, updatedItem: ReceiptItem) => void;
};

export function ScannedReceiptItemForm({
  index,
  item,
  onCloseEdit,
  onSuccess,
}: ScannedReceiptItemFormProps) {
  const isValidUnit = (unit: string | null): unit is Unit => {
    return unit !== null && Object.values(UnitEnum).includes(unit as Unit);
  };

  const form = useForm<TReceiptItemSchema>({
    resolver: zodResolver(receiptItemSchema),
    defaultValues: {
      name: item.name ? item.name : "",
      brand: item.brand ? item.brand : "",
      count: item.count ? item.count : undefined,
      amount: item.amount ? item.amount : undefined,
      price: item.price ? item.price : undefined,
      unit: isValidUnit(item.unit) ? item.unit : UnitEnum.units,
      isSale: item.isSale,
    },
  });

  function onSubmit(values: TReceiptItemSchema) {
    onSuccess(index, values);
    onCloseEdit();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <ReceiptFormInput form={form} name="name" label="Name" />
            <ReceiptFormInput
              form={form}
              name="brand"
              label="Brand"
              placeholder="Optional"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <ReceiptFormInput
              form={form}
              name="count"
              label="Count"
              placeholder="Defaults to 1"
            />
            <ReceiptFormInput
              form={form}
              name="amount"
              label="Amount"
              placeholder="Defaults to 1"
            />
            <ReceiptFormSelect
              form={form}
              name="unit"
              label="Unit"
              options={Object.values(UnitEnum)}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <ReceiptFormInput form={form} name="price" label="Price" />
            <ReceiptFormCheckbox form={form} name="isSale" label="Sale?" />
          </div>
          <DialogFooter className="gap-1 sm:gap-0">
            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={onCloseEdit}
            >
              Cancel
            </Button>
            <Button size="sm" type="submit">
              Save
            </Button>
          </DialogFooter>
        </div>
      </form>
    </Form>
  );
}
