"use client";

import { addItemAction, editItemAction } from "@/actions/grocery-actions";
import { DialogFooter } from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { PricePoint, ServerErrors } from "@/types/grocery";
import FormButton from "@/components/form/form-button";
import {
  pricePointSchema,
  TPricePointSchema,
} from "@/zod-schemas/grocery-schemas";
import { useState } from "react";
import ErrorCallout from "@/components/form/error-callout";
import { Form } from "@/components/ui/form";
import FormInput from "../shared/item-form/item-form-input";
import FormCheckbox from "../shared/item-form/item-form-checkbox";
import { FormDatePicker } from "../shared/item-form/item-form-date-picker";
import { useToast } from "@/hooks/use-toast";

type EditItemFormProps = {
  item: PricePoint;
  onSuccess: () => void;
};

export default function EditItemForm({ item, onSuccess }: EditItemFormProps) {
  const form = useForm<TPricePointSchema>({
    resolver: zodResolver(pricePointSchema),
    defaultValues: {
      price: item.price,
      date: item.date,
      isSale: item.isSale,
    },
  });

  const [serverErrors, setServerErrors] = useState<ServerErrors>(null);
  const { isSubmitting } = form.formState;
  const { toast } = useToast();

  async function onSubmit(values: TPricePointSchema) {
    try {
      const response = await editItemAction(values, item.id);
      if (response.errors) {
        setServerErrors(response.errors);
      } else if (response.success) {
        toast({
          description: "Item edited.",
        });
        onSuccess();
      }
    } catch (error) {
      setServerErrors({ form: "An error occurred while editing item" });
    }
  }

  return (
    <Form {...form}>
      <ErrorCallout errors={serverErrors} />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormInput form={form} name="price" label="Price" />
        <FormCheckbox form={form} name="isSale" label="Sale Price?" />
        <FormDatePicker form={form} name="date" label="Date" />
        <DialogFooter>
          <FormButton
            isSubmitting={isSubmitting}
            pendingText="Saving..."
            defaultText="Save changes"
          />
        </DialogFooter>
      </form>
    </Form>
  );
}
