import { Checkbox } from "@/components/ui/checkbox";
import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";

type FormCheckboxProps<TFieldValues extends FieldValues> = {
  form: UseFormReturn<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  description?: string;
};

export default function ReceiptFormCheckbox<TFieldValues extends FieldValues>({
  form,
  name,
  label,
  description,
}: FormCheckboxProps<TFieldValues>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col space-y-0">
          <div className="flex flex-col gap-2">
            <FormLabel className="text-xs text-muted-foreground">
              {label}
            </FormLabel>
            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
          </div>
          <FormDescription>{description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
