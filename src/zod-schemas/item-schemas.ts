import { z } from "zod";
import { Unit, UnitEnum } from "../lib/types";

const unitSchema = z.enum(Object.values(UnitEnum) as [string, ...string[]]);

export const addItemSchema = z.object({
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
  unit: unitSchema,
  date: z.date(),
  price: z.coerce
    .number({ invalid_type_error: "Price must be a number" })
    .nonnegative("Price cannot be negative")
    .transform((val) => parseFloat(val.toFixed(2))),
  isSale: z.boolean().default(false),
});

export type TAddItemSchema = z.infer<typeof addItemSchema>;

export type AddItemInput = {
  name: string;
  brand: string | null;
  store: string;
  count: number;
  amount: number;
  unit: Unit;
  price: number;
  date: Date;
  isSale: boolean;
};
