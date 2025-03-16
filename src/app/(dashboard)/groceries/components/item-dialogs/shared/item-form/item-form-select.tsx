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

export function FormSelect<
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
        <FormItem>
          <div className="grid grid-cols-4 items-center gap-4">
            <FormLabel className="text-right">{label}</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl className="col-span-3">
                <SelectTrigger>
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
              </FormControl>
              <FormSelectContent options={options} />
            </Select>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-1" />
            <div className="col-span-3">
              <FormDescription>{description}</FormDescription>
              <FormMessage />
            </div>
          </div>
        </FormItem>
      )}
    />
  );
}
