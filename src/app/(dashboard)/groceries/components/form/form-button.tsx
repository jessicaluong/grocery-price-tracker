"use client";

import { Loader2 } from "lucide-react";
import { Button } from "../../../../../components/ui/button";

type FormButtonProps = {
  pendingText: string;
  defaultText: string;
  isSubmitting: boolean;
};

export default function FormButton({
  pendingText,
  defaultText,
  isSubmitting,
}: FormButtonProps) {
  return (
    <Button type="submit" disabled={isSubmitting}>
      {isSubmitting ? (
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
