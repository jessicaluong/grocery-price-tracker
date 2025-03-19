import { z } from "zod";
import { UnitSchema } from "../lib/types";

export const editGroupSchema = z.object({
  name: z
    .string()
    .min(1, "Item name is required")
    .max(50, "Item name too long")
    .trim(),
  brand: z
    .string()
    .max(50, "Brand name too long")
    .trim()
    .transform((val) => (val === "" ? null : val))
    .nullable(),
  store: z
    .string()
    .min(1, "Store name is required")
    .max(50, "Store name too long")
    .trim(),
  count: z.coerce
    .number({ invalid_type_error: "Count must be a number" })
    .int("Count must be a whole number")
    .positive("Count must be at least 1")
    .default(1),
  amount: z.coerce
    .number({
      invalid_type_error: "Amount must be a number",
    })
    .positive("Amount must be at least 1"),
  unit: UnitSchema,
});

export type TEditGroupSchema = z.infer<typeof editGroupSchema>;
