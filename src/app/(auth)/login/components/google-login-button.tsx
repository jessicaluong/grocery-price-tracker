"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function GoogleLoginButton() {
  return (
    <Button
      className="w-full"
      onClick={() => signIn("google", { callbackUrl: "/groceries" })}
    >
      Continue with Google
    </Button>
  );
}
