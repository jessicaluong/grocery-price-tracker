import { addItemToGroupAction } from "@/actions/grocery-actions";
import ErrorCallout from "@/components/form/error-callout";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { DbGroup, ServerErrors } from "@/types/grocery";
import {
  pricePointSchema,
  TPricePointSchema,
} from "@/zod-schemas/grocery-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { DialogFooter } from "@/components/ui/dialog";
import FormButton from "@/components/form/form-button";
import { useQueryClient } from "@tanstack/react-query";
import { useGroceryGroupContext } from "@/hooks/use-grocery-group";
import FormInput from "@/components/form/item-form/item-form-input";
import FormCheckbox from "@/components/form/item-form/item-form-checkbox";
import { FormDatePicker } from "@/components/form/item-form/item-form-date-picker";

type AddItemToGroupFormProps = {
  group: DbGroup;
  onSuccess: () => void;
};

export default function AddItemToGroupForm({
  group,
  onSuccess,
}: AddItemToGroupFormProps) {
  const form = useForm<TPricePointSchema>({
    resolver: zodResolver(pricePointSchema),
    defaultValues: {
      isSale: false,
    },
  });

  const [serverErrors, setServerErrors] = useState<ServerErrors>(null);
  const { isSubmitting } = form.formState;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { groupId } = useGroceryGroupContext();

  async function onSubmit(values: TPricePointSchema) {
    try {
      const response = await addItemToGroupAction(values, group.id);
      if (response.errors) {
        setServerErrors(response.errors);
      } else if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["priceHistory", groupId] });
        toast({
          description: "Item added.",
        });
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
        <FormInput form={form} name="price" label="Price" type="number" />
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
