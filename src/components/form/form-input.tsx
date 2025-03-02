import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "../ui/input";
import { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";

type FormInputProps<TFieldValues extends FieldValues> = {
  form: UseFormReturn<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder: string;
  description?: string;
};

export default function FormInput<TFieldValues extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  description,
}: FormInputProps<TFieldValues>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="grid grid-cols-4 items-center gap-4">
            <FormLabel className="text-right">{label}</FormLabel>
            <FormControl className="col-span-3">
              <Input placeholder={placeholder} {...field} />
            </FormControl>
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
