import prisma from "@/lib/db";

export async function getGroceryItems() {
  const groceryItems = await prisma.groceryItem.findMany();
  return groceryItems || [];
}

export async function updateGroceryItems() {}

export async function deleteGroceryItems() {}
