"use client";

import { ReceiptData } from "@/types/receipt";
import {
  receiptHeaderSchema,
  TReceiptHeaderSchema,
} from "@/zod-schemas/receipt-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ReceiptFormInput from "./receipt-form-input";
import { ReceiptFormDatePicker } from "./receipt-form-date-picker";
import { formatDate } from "@/lib/utils";

type ScannedReceiptHeaderFormProps = {
  receiptData: ReceiptData;
  onCloseEdit: () => void;
  onSuccess: (store: string, date: Date) => void;
};

export function ScannedReceiptHeaderForm({
  receiptData,
  onCloseEdit,
  onSuccess,
}: ScannedReceiptHeaderFormProps) {
  const form = useForm<TReceiptHeaderSchema>({
    resolver: zodResolver(receiptHeaderSchema),
    defaultValues: {
      store: receiptData.store ? receiptData.store : "",
      date: receiptData.date
        ? new Date(formatDate(receiptData.date))
        : undefined,
    },
  });

  function onSubmit(values: TReceiptHeaderSchema) {
    onSuccess(values.store, values.date);
    onCloseEdit();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-2">
          <ReceiptFormInput form={form} name="store" label="Store" />
          <ReceiptFormDatePicker form={form} name="date" label="Date" />
        </div>
        <DialogFooter className="pt-2 gap-1 sm:gap-0">
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
      </form>
    </Form>
  );
}
