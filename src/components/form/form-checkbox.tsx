import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import { Checkbox } from "../ui/checkbox";

type FormCheckboxProps<TFieldValues extends FieldValues> = {
  form: UseFormReturn<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  description?: string;
};

export default function FormCheckbox<TFieldValues extends FieldValues>({
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
        <FormItem>
          <div className="grid grid-cols-4 items-center gap-4">
            <FormLabel className="text-right">{label}</FormLabel>
            <Checkbox
              className="col-span-3"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </div>
          {description && (
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-1" />
              <div className="col-span-3">
                <FormDescription>{description}</FormDescription>
                <FormMessage />
              </div>
            </div>
          )}
        </FormItem>
      )}
    />
  );
}
