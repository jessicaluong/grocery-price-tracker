"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";

type FormButtonProps = {
  pendingText: string;
  defaultText: string;
  isSubmitting: boolean;
  className?: string;
};

export default function FormButton({
  pendingText,
  defaultText,
  isSubmitting,
  className,
}: FormButtonProps) {
  return (
    <Button type="submit" disabled={isSubmitting} className={cn(className)}>
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
