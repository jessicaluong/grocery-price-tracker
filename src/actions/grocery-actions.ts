"use server";

import {
  addItem,
  addItemToGroup,
  addReceiptData,
  deleteGroup,
  deleteItem,
  editGroup,
  editItem,
} from "@/data-access/grocery-data";
import { itemSchema, pricePointSchema } from "@/zod-schemas/grocery-schemas";
import { Unit } from "@/types/grocery";
import { revalidatePath } from "next/cache";
import { groupSchema } from "@/zod-schemas/grocery-schemas";
import { verifySession } from "@/lib/auth";
import { AuthorizationError, DuplicateGroupError } from "@/lib/customErrors";
import { receiptSchema } from "@/zod-schemas/receipt-schemas";

export async function addItemAction(values: unknown) {
  const session = await verifySession({ redirect: false });
  if (!session) {
    return { errors: { form: "You must be logged in to add an item" } };
  }

  const validatedFields = itemSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const data = validatedFields.data;
    await addItem(data);
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

  const validatedFields = groupSchema.safeParse(values);

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

export async function addReceiptDataAction(receiptData: unknown) {
  const session = await verifySession({ redirect: false });
  if (!session) {
    return { error: "You must be logged in to add receipt items" };
  }

  const validatedFields = receiptSchema.safeParse(receiptData);
  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const data = validatedFields.data;
    await addReceiptData(data);
    revalidatePath("/groceries");
    return { success: true };
  } catch (error) {
    return { error: "Failed to add receipt items" };
  }
}
