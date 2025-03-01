"use client";

import { useMemo } from "react";
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import SelectContentOptions from "./select-content-options";

type SelectInputProps<T extends string> = {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
};

export default function SortAndViewSelectInput<T extends string>({
  label,
  options,
  value,
  onChange,
}: SelectInputProps<T>) {
  const id = useMemo(() => label.toLowerCase().replace(/\s+/g, "-"), [label]);

  return (
    <div className="grid grid-cols-[auto_1fr] gap-2 items-center">
      <Label htmlFor={id}>{label}</Label>
      <div className="w-32 sm:w-40">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id={id} className="h-8 w-full">
            <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContentOptions options={options} />
        </Select>
      </div>
    </div>
  );
}
