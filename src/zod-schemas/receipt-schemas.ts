import { z } from "zod";
import { fields } from "./shared-schemas";

export const receiptHeaderSchema = z.object({
  store: fields.store,
  date: fields.date,
});

export const receiptItemSchema = z.object({
  name: fields.name,
  brand: fields.brand,
  count: fields.count,
  amount: fields.amount,
  unit: fields.unit,
  price: fields.price,
  isSale: fields.isSale,
});

export const receiptSchema = z.object({
  store: fields.store,
  date: fields.date,
  items: z
    .array(
      z.object({
        name: fields.name,
        brand: fields.brand,
        count: fields.count,
        amount: fields.amount,
        unit: fields.unit,
        price: fields.price,
        isSale: fields.isSale,
      })
    )
    .min(1, "At least one item is required"),
});

export type TReceiptHeaderSchema = z.infer<typeof receiptHeaderSchema>;
export type TReceiptItemSchema = z.infer<typeof receiptItemSchema>;
export type TReceiptSchema = z.infer<typeof receiptSchema>;
