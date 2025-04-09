import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";

type FormInputProps<TFieldValues extends FieldValues> = {
  form: UseFormReturn<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder?: string;
  description?: string;
  type?: string;
};

export default function ReceiptFormInput<TFieldValues extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  description,
  type = "text",
}: FormInputProps<TFieldValues>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        const displayValue =
          field.value === undefined || field.value === null
            ? ""
            : String(field.value);

        return (
          <FormItem className="flex flex-col space-y-0">
            <FormLabel className="text-xs text-muted-foreground">
              {label}
            </FormLabel>
            <FormControl>
              <Input
                placeholder={placeholder}
                type={type}
                {...field}
                value={displayValue}
                onChange={(e) => {
                  const val = e.target.value;
                  field.onChange(
                    type === "number" && val === "" ? undefined : val
                  );
                }}
              />
            </FormControl>
            <FormDescription>{description}</FormDescription>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
