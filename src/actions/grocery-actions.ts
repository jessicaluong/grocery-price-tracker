"use server";

import {
  addItem,
  addItemToGroup,
  deleteGroup,
  deleteItem,
  editGroup,
  editItem,
} from "@/data-access/grocery-data";
import { addItemSchema, pricePointSchema } from "@/zod-schemas/item-schemas";
import { Unit } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { editGroupSchema } from "@/zod-schemas/group-schemas";
import { verifySession } from "@/lib/auth";
import { AuthorizationError, DuplicateGroupError } from "@/lib/customErrors";

export async function addItemAction(values: unknown) {
  const session = await verifySession({ redirect: false });
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

export async function editItemAction(values: unknown, itemId: string) {
  const session = await verifySession({ redirect: false });
  if (!session) {
    return { errors: { form: "You must be logged in to edit an item" } };
  }

  const validatedFields = pricePointSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const data = validatedFields.data;
    await editItem(data, itemId);
    revalidatePath("/groceries");
    return { success: true };
  } catch (error) {
    return { errors: { form: "Failed to edit item" } };
  }
}

export async function deleteItemAction(itemId: string) {
  const session = await verifySession({ redirect: false });
  if (!session) {
    return { error: "You must be logged in to delete an item" };
  }

  try {
    await deleteItem(itemId);
    revalidatePath("/groceries");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete item" };
  }
}

export async function addItemToGroupAction(values: unknown, groupId: string) {
  const session = await verifySession({ redirect: false });
  if (!session) {
    return { errors: { form: "You must be logged in to add an item" } };
  }

  const validatedFields = pricePointSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const data = validatedFields.data;
    await addItemToGroup(data, groupId);
    revalidatePath("/groceries");
    return { success: true };
  } catch (error) {
    return { errors: { form: "Failed to add item" } };
  }
}

export async function editGroupAction(values: unknown, groupId: string) {
  const session = await verifySession({ redirect: false });
  if (!session) {
    return { errors: { form: "You must be logged in to edit the group" } };
  }

  const validatedFields = editGroupSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const data = validatedFields.data;
    await editGroup(
      {
        name: data.name,
        brand: data.brand,
        store: data.store,
        count: data.count,
        amount: data.amount,
        unit: data.unit as Unit,
      },
      groupId
    );
    revalidatePath("/groceries");
    return { success: true };
  } catch (error) {
    if (error instanceof DuplicateGroupError) {
      return { errors: { form: error.message } };
    } else if (error instanceof AuthorizationError) {
      return { errors: { form: error.message } };
    }
    return { errors: { form: "Failed to edit group" } };
  }
}

export async function deleteGroupAction(groupId: string) {
  const session = await verifySession({ redirect: false });
  if (!session) {
    return { error: "You must be logged in to delete a group" };
  }

  try {
    await deleteGroup(groupId);
    revalidatePath("/groceries");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete group" };
  }
}
