import React from "react";
import RegisterForm from "./components/register-form";

export default function RegisterPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <h1 className="text-2xl font-semibold text-center">
          Create an account
        </h1>
        <RegisterForm className="flex flex-col gap-4" />
      </div>
    </div>
  );
}
