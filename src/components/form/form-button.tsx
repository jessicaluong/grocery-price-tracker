"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";

type FormButtonProps = {
  pendingText: string;
  defaultText: string;
  isSubmitting: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
};

export default function FormButton({
  pendingText,
  defaultText,
  isSubmitting,
  disabled,
  className,
  onClick,
}: FormButtonProps) {
  return (
    <Button
      type="submit"
      disabled={isSubmitting || disabled}
      className={cn(className)}
      onClick={onClick}
    >
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
