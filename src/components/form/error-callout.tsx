import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ServerErrors } from "@/lib/types";

type ErrorCalloutProps = {
  errors: ServerErrors;
};

export default function ErrorCallout({ errors }: ErrorCalloutProps) {
  if (!errors) return null;
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        <ul className="text-sm list-none">
          {Object.entries(errors).map(([field, errorList]) => (
            <li key={field}>
              {Array.isArray(errorList) ? errorList.join(", ") : errorList}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
