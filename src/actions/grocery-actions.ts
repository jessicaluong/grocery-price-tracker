"use server";

import { addItem } from "@/data-access/item-repository";
import { addItemSchema } from "@/zod-schemas/item-schemas";
import { Unit } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/auth";

export async function addItemAction(values: unknown) {
  const session = await verifySession();
  if (!session) {
    return { errors: { form: "You must be logged in to add an item" } };
  }

  const userId = session.userId;

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
      userId,
    });
    revalidatePath("/groceries");
    return { success: true };
  } catch (error) {
    return { errors: { form: "Failed to add item" } };
  }
}
