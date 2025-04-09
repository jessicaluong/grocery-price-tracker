type LabeledValueProps = {
  label: string;
  value: string | number | null;
  valueClassName?: string;
  required?: boolean;
};

export default function LabeledValue({
  label,
  value,
  valueClassName,
  required,
}: LabeledValueProps) {
  return (
    <div className="flex flex-col">
      <p className="text-xs text-muted-foreground">{label}</p>
      {value ? (
        <p className={valueClassName}>{value}</p>
      ) : (
        <span
          className={`font-semibold text-muted-foreground italic ${
            required ? "text-red-500" : ""
          }`}
        >
          {required ? "required" : "optional"}
        </span>
      )}
    </div>
  );
}
