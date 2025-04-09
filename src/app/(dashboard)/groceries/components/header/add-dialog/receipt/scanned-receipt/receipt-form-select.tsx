import FormSelectContent from "@/components/form/form-select-content";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";

type FormSelectProps<
  TFieldValues extends FieldValues,
  TOptions extends readonly string[] = string[]
> = {
  form: UseFormReturn<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder?: string;
  options: TOptions;
  description?: string;
};

export function ReceiptFormSelect<
  TFieldValues extends FieldValues,
  TOptions extends readonly string[] = string[]
>({
  form,
  name,
  label,
  placeholder,
  options,
  description,
}: FormSelectProps<TFieldValues, TOptions>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col space-y-0">
          <FormLabel className="text-xs text-muted-foreground">
            {label}
          </FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl className="col-span-3">
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <FormSelectContent options={options} />
          </Select>
          <FormDescription>{description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
