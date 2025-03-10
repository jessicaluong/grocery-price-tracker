"use server";

import { registerSchema } from "@/app/(auth)/register/lib/auth-types";
import { registerUser } from "@/data-access/user-repository";

export async function registerUserAction(values: unknown) {
  const validatedFields = registerSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const { email, password } = validatedFields.data;
    const result = await registerUser({ email, password });
    if (result?.error) {
      return { errors: result.error };
    }

    return { success: true };
  } catch (error) {
    return { errors: { form: "Failed to register user" } };
  }
}
