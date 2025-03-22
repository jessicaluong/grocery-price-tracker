"use client";

import { cn } from "@/lib/utils";
import FormButton from "@/components/form/form-button";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import FormInput from "@/components/form/form-input";
import { signIn } from "next-auth/react";
import ErrorCallout from "@/components/form/error-callout";
import { ServerErrors } from "@/types/grocery";
import { useState } from "react";
import { useRouter } from "next/navigation";

type LoginFormProps = {
  className?: string;
};

const formSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginForm({ className }: LoginFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [serverErrors, setServerErrors] = useState<ServerErrors>(null);
  const { isSubmitting } = form.formState;

  const router = useRouter();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await signIn("credentials", {
        ...values,
        redirect: false,
      });
      if (response?.error) {
        setServerErrors({ form: "Invalid email or password" });
      } else if (response?.ok) {
        router.push("/groceries");
      }
    } catch (error) {
      setServerErrors({ form: "An error occurred during login" });
    }
  }

  return (
    <Form {...form}>
      <ErrorCallout errors={serverErrors} />
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn(className)}>
        <FormInput
          form={form}
          name="email"
          label="Email"
          placeholder="m@example.com"
        />
        <FormInput
          form={form}
          name="password"
          label="Password"
          showForgotPassword
          type="password"
        ></FormInput>
        <FormButton
          className="w-full"
          isSubmitting={isSubmitting}
          pendingText="Logging in..."
          defaultText="Login"
        />
      </form>
    </Form>
  );
}
