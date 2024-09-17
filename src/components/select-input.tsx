"use client";
import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type SelectInputProps = {
  label: string;
  options: string[];
  defaultValue: string;
  onChange: (value: string) => void;
};

export default function SelectInput({
  label,
  options,
  defaultValue,
  onChange,
}: SelectInputProps) {
  const id = useMemo(() => label.toLowerCase().replace(/\s+/g, "-"), [label]);

  return (
    <div className="grid grid-cols-3 items-center gap-4">
      <Label htmlFor={id}>{label}</Label>
      <Select defaultValue={defaultValue} onValueChange={onChange}>
        <SelectTrigger id={id} className="col-span-2 h-8">
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option} value={option} className="capitalize">
                {option}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
