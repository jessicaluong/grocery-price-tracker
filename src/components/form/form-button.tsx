"use client";

import { Loader2 } from "lucide-react";
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
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {pendingText}
        </>
      ) : (
        defaultText
      )}
    </Button>
  );
}
