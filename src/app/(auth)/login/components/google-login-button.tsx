"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function GoogleLoginButton() {
  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={() => signIn("google")}
    >
      Continue with Google
    </Button>
  );
}
