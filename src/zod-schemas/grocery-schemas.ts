import { z } from "zod";
import { fields } from "./shared-schemas";

export const pricePointSchema = z.object({
  date: fields.date,
  price: fields.price,
  isSale: fields.isSale,
});

export const groupSchema = z.object({
  name: fields.name,
  brand: fields.brand,
  store: fields.store,
  count: fields.count,
  amount: fields.amount,
  unit: fields.unit,
});

export const itemSchema = groupSchema.merge(pricePointSchema);

export type TPricePointSchema = z.infer<typeof pricePointSchema>;
export type TGroupSchema = z.infer<typeof groupSchema>;
export type TItemSchema = z.infer<typeof itemSchema>;
