import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import { Input } from "../ui/input";
import Link from "next/link";

type FormInputProps<TFieldValues extends FieldValues> = {
  form: UseFormReturn<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder?: string;
  description?: string;
  type?: string;
  showForgotPassword?: boolean;
  forgotPasswordHref?: string;
};

export default function FormInput<TFieldValues extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  description,
  type = "text",
  showForgotPassword = false,
  forgotPasswordHref = "#",
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
          <FormItem>
            <div className="flex items-center justify-between mb-2">
              <FormLabel>{label}</FormLabel>
              {showForgotPassword && (
                <Link
                  href={forgotPasswordHref}
                  className="ml-auto text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </Link>
              )}
            </div>
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
