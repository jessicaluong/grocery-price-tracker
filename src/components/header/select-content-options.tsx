import { SelectContent, SelectGroup, SelectItem } from "@/components/ui/select";

type SelectContentOptions<T extends string> = {
  options: readonly T[];
};

export default function SelectContentOptions<T extends string>({
  options,
}: SelectContentOptions<T>) {
  return (
    <SelectContent>
      <SelectGroup>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectGroup>
    </SelectContent>
  );
}
