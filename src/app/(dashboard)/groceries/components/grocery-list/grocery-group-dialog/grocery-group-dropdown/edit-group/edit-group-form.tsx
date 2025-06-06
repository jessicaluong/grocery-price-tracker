"use client";

import ErrorCallout from "@/components/form/error-callout";
import { Form } from "@/components/ui/form";
import { DbGroup, ServerErrors, UnitEnum } from "@/types/grocery";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { DialogFooter } from "@/components/ui/dialog";
import FormButton from "@/components/form/form-button";
import { useState } from "react";
import { groupSchema, TGroupSchema } from "@/zod-schemas/grocery-schemas";
import { editGroupAction } from "@/actions/grocery-actions";
import { useToast } from "@/hooks/use-toast";
import FormInput from "@/components/form/item-form/item-form-input";
import { FormSelect } from "@/components/form/item-form/item-form-select";

type EditGroupFormProps = {
  group: DbGroup;
  onSuccess: () => void;
};

export default function EditGroupForm({
  group,
  onSuccess,
}: EditGroupFormProps) {
  const form = useForm<TGroupSchema>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: group.name,
      brand: group.brand,
      store: group.store,
      count: group.count,
      amount: group.amount,
      unit: group.unit,
    },
  });

  const [serverErrors, setServerErrors] = useState<ServerErrors>(null);
  const { isSubmitting } = form.formState;
  const { toast } = useToast();

  async function onSubmit(values: TGroupSchema) {
    try {
      const response = await editGroupAction(values, group.id);
      if (response.errors) {
        setServerErrors(response.errors);
      } else if (response.success) {
        toast({
          description: "Group edited.",
        });
        onSuccess();
      }
    } catch (error) {
      setServerErrors({ form: "An error occurred while editing group" });
    }
  }

  return (
    <Form {...form}>
      <ErrorCallout errors={serverErrors} />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormInput form={form} name="name" label="Name" />
        <FormInput
          form={form}
          name="brand"
          label="Brand"
          description="Brand is optional."
        />
        <FormInput form={form} name="store" label="Store" />
        <FormInput
          form={form}
          name="count"
          label="Count"
          description="Count is for bulk items."
        />
        <FormInput form={form} name="amount" label="Amount" />
        <FormSelect
          form={form}
          name="unit"
          label="Unit"
          options={Object.values(UnitEnum)}
        />
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
