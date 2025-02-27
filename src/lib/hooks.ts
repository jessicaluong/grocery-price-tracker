import { GroceryContext } from "@/contexts/grocery-provider";
import { useContext } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { getDisplayFromParam, getParamFromDisplay } from "@/lib/utils";

export function useGrocery() {
  const context = useContext(GroceryContext);
  if (!context) {
    throw new Error("useGrocery must be used within a GroceryProvider");
  }
  return context;
}

export function useUrlParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getParam = (name: string, defaultValue: string) => {
    return searchParams.get(name) || defaultValue;
  };

  const getDisplayValue = (
    type: "sort" | "view",
    paramName: string,
    defaultValue: string
  ) => {
    const param = getParam(paramName, defaultValue);
    return getDisplayFromParam(type, param);
  };

  const updateParam = (
    type: "sort" | "view" | "search",
    paramName: string,
    value: string
  ) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      // For sort and view, convert display value to param value
      if (type === "sort" || type === "view") {
        const paramValue = getParamFromDisplay(type, value);
        params.set(paramName, paramValue);
      } else {
        // For search, use value directly
        params.set(paramName, value);
      }
    } else {
      // If value is empty, remove the parameter
      params.delete(paramName);
    }

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

    router.push(newUrl, { scroll: false });
  };

  return { getParam, getDisplayValue, updateParam };
}
