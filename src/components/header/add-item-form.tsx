"use client";

import { addItemAction } from "@/actions/actions";
import { DialogFooter } from "../ui/dialog";
import { useActionState } from "react";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { UnitEnum } from "@/lib/types";
import FormInput from "../form/form-input";
import { FormSelect } from "../form/form-select";
import FormCheckbox from "../form/form-checkbox";
import { FormDatePicker } from "../form/form-date-picker";
import FormButton from "../form/form-button";

const unitSchema = z.enum(Object.values(UnitEnum) as [string, ...string[]]);

const addItemSchema = z.object({
  name: z
    .string()
    .min(1, "Item name is required")
    .max(50, "Item name too long")
    .trim(),
  brand: z.string().nullable(),
  store: z
    .string()
    .min(1, "Store name is required")
    .max(50, "Store name too long")
    .trim(),
  count: z.number().int().positive("Count must be at least 1"),
  amount: z.number().positive("Amount must be greater than 0"),
  unit: unitSchema,
  date: z.date(),
  price: z
    .number()
    .positive("Price must be greater than 0")
    .transform((val) => parseFloat(val.toFixed(2))),
  isSale: z.boolean().default(false).optional(),
});

type TAddItemSchema = z.infer<typeof addItemSchema>;

// const initialState = {
//   name: "",
// };

export default function AddItemForm() {
  const form = useForm<TAddItemSchema>({
    resolver: zodResolver(addItemSchema),
    defaultValues: {
      name: "",
      brand: null,
      store: "",
      // count: 1,
      // amount: 1,
      unit: UnitEnum.units,
      date: new Date(),
      // price: 0,
      isSale: false,
    },
  });
  // const [state, formAction, pending] = useActionState(
  //   initialState,
  //   addItemAction
  // );

  return (
    // <form action={addItemAction}>

    <Form {...form}>
      <form className="space-y-4">
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
          placeholder="1"
          description="This is for bulk items."
        />
        <FormInput form={form} name="amount" label="Amount" placeholder="100" />
        <FormSelect
          form={form}
          name="unit"
          label="Unit"
          options={Object.values(UnitEnum)}
        />
        <FormInput form={form} name="price" label="Price" placeholder="4.99" />
        <FormCheckbox form={form} name="isSale" label="Sale Price?" />
        <FormDatePicker form={form} name="date" label="Date" />
        <DialogFooter>
          <FormButton pendingText="Adding..." defaultText="Submit" />
        </DialogFooter>
      </form>
    </Form>
  );
}
