import { AddItemServerErrors } from "@/lib/form-types";

type ErrorCalloutProps = { errors: AddItemServerErrors };

export default function ErrorCallout({ errors }: ErrorCalloutProps) {
  if (!errors) return null;
  return (
    <div className="rounded-md border border-destructive p-3 bg-destructive/10 mb-4">
      <h3 className="text-sm font-medium text-destructive mb-1">
        There were problems with your submission
      </h3>
      <ul className="text-sm list-disc pl-5">
        {Object.entries(errors).map(([field, errorList]) => (
          <li key={field}>
            <span className="capitalize">{field}</span>:{" "}
            {Array.isArray(errorList) ? errorList.join(", ") : errorList}
          </li>
        ))}
      </ul>
    </div>
  );
}
