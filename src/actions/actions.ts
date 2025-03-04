"use server";

import { addItem } from "@/data-access/item-repository";
import { addItemSchema } from "@/lib/form-types";
import { Unit } from "@/lib/types";

export async function addItemAction(values: unknown) {
  const validatedFields = addItemSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  try {
    const data = validatedFields.data;
    await addItem({
      name: data.name,
      brand: data.brand,
      store: data.store,
      count: data.count,
      amount: data.amount,
      unit: data.unit as Unit,
      price: data.price,
      date: data.date,
      isSale: data.isSale,
    });
    return { success: true };
  } catch (error) {
    return { errors: { form: "Failed to add item" } };
  }
}
