"use client";

import { addItemAction } from "@/actions/grocery-actions";
import { DialogFooter } from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ServerErrors, UnitEnum } from "@/lib/types";
import FormButton from "@/components/form/form-button";
import { addItemSchema, TAddItemSchema } from "@/zod-schemas/item-schemas";
import { useState } from "react";
import ErrorCallout from "@/components/form/error-callout";
import { Form } from "@/components/ui/form";
import FormInput from "../shared/item-form/item-form-input";
import { FormSelect } from "../shared/item-form/item-form-select";
import FormCheckbox from "../shared/item-form/item-form-checkbox";
import { FormDatePicker } from "../shared/item-form/item-form-date-picker";

type AddItemFormProps = {
  onSuccess: () => void;
};

export default function AddItemForm({ onSuccess }: AddItemFormProps) {
  const form = useForm<TAddItemSchema>({
    resolver: zodResolver(addItemSchema),
    defaultValues: {
      name: "",
      brand: "",
      store: "",
      count: 1,
      unit: UnitEnum.g,
      date: new Date(),
      isSale: false,
    },
  });

  const [serverErrors, setServerErrors] = useState<ServerErrors>(null);
  const { isSubmitting } = form.formState;

  async function onSubmit(values: TAddItemSchema) {
    try {
      const response = await addItemAction(values);
      if (response.errors) {
        setServerErrors(response.errors);
      } else if (response.success) {
        form.reset();
        onSuccess();
      }
    } catch (error) {
      setServerErrors({ form: "An error occurred while adding item" });
    }
  }

  return (
    <Form {...form}>
      <ErrorCallout errors={serverErrors} />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormInput
          form={form}
          name="name"
          label="Name"
          placeholder="Orange Juice"
        />
        <FormInput
          form={form}
          name="brand"
          label="Brand"
          placeholder="Tropicana"
          description="Brand is optional."
        />
        <FormInput
          form={form}
          name="store"
          label="Store"
          placeholder="Walmart"
        />
        <FormInput
          form={form}
          name="count"
          label="Count"
          description="Count is for bulk items."
        />
        <FormInput
          form={form}
          name="amount"
          label="Amount"
          placeholder="100"
          type="number"
        />
        <FormSelect
          form={form}
          name="unit"
          label="Unit"
          placeholder={UnitEnum.g}
          options={Object.values(UnitEnum)}
        />
        <FormInput
          form={form}
          name="price"
          label="Price"
          placeholder="4.99"
          type="number"
        />
        <FormCheckbox form={form} name="isSale" label="Sale Price?" />
        <FormDatePicker form={form} name="date" label="Date" />
        <DialogFooter>
          <FormButton
            isSubmitting={isSubmitting}
            pendingText="Adding..."
            defaultText="Submit"
          />
        </DialogFooter>
      </form>
    </Form>
  );
}
