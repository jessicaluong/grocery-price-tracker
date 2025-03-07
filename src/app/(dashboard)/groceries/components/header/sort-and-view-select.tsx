"use client";

import { useMemo } from "react";
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import FormSelectContent from "../../../../../components/form/form-select-content";

type SortAndViewSelectProps<T extends string> = {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
};

export default function SortAndViewSelect<T extends string>({
  label,
  options,
  value,
  onChange,
}: SortAndViewSelectProps<T>) {
  const id = useMemo(() => label.toLowerCase().replace(/\s+/g, "-"), [label]);

  return (
    <div className="grid grid-cols-[auto_1fr] gap-2 items-center">
      <Label htmlFor={id}>{label}</Label>
      <div className="w-32 sm:w-40">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id={id} className="h-8 w-full">
            <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
          </SelectTrigger>
          <FormSelectContent options={options} />
        </Select>
      </div>
    </div>
  );
}
