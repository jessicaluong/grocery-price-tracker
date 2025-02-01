import prisma from "@/lib/db";
import { Unit } from "@/lib/types";

export async function getGroceryItems() {
  const items = await prisma.groceryItem.findMany();
  return (
    items.map((item) => ({
      ...item,
      unit: item.unit as Unit,
    })) || []
  );
}

export async function updateGroceryItems() {

}

export async function deleteGroceryItems() {

  
}
