import { SelectContent, SelectGroup, SelectItem } from "@/components/ui/select";

type FormSelectContentProps<T extends string> = {
  options: readonly T[];
};

export default function FormSelectContent<T extends string>({
  options,
}: FormSelectContentProps<T>) {
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
