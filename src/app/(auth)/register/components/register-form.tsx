"use client";

import { cn } from "@/lib/utils";
import FormButton from "@/components/form/form-button";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import FormInput from "@/components/form/form-input";
import { registerSchema, TRegisterSchema } from "../lib/auth-types";
import { registerUserAction } from "@/actions/auth-actions";
import { useState } from "react";
import ErrorCallout from "@/components/form/error-callout";
import { ServerErrors } from "@/lib/types";
import { useRouter } from "next/navigation";

type RegisterFormProps = {
  className?: string;
};

export default function RegisterForm({ className }: RegisterFormProps) {
  const form = useForm<TRegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [serverErrors, setServerErrors] = useState<ServerErrors>(null);
  const { isSubmitting } = form.formState;

  const router = useRouter();

  async function onSubmit(values: TRegisterSchema) {
    try {
      const response = await registerUserAction(values);
      if (response.errors) {
        setServerErrors(response.errors);
      } else if (response.success) {
        router.push("/");
      }
    } catch (error) {
      setServerErrors({ form: "An error occurred during registration" });
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
          type="password"
        ></FormInput>
        <FormButton
          className="w-full"
          isSubmitting={isSubmitting}
          pendingText="Registering..."
          defaultText="Register"
        />
      </form>
    </Form>
  );
}
