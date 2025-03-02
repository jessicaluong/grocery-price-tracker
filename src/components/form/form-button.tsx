"use client";

import { Button } from "../ui/button";
import { useFormStatus } from "react-dom";

type FormButtonProps = {
  pendingText: string;
  defaultText: string;
};

export default function FormButton({
  pendingText,
  defaultText,
}: FormButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      variant={pending ? "secondary" : "default"}
    >
      {pending ? pendingText : defaultText}
    </Button>
  );
}
