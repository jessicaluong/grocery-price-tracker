import prisma from "@/lib/db";
import { Unit } from "@prisma/client";

export async function getGroceryItems() {
  const items = await prisma.groceryItem.findMany();
  return items || [];
}

export async function getGroups() {
  const groups = prisma.group.findMany({
    include: {
      items: {
        orderBy: { date: "desc" },
      },
    },
  });
  return groups || [];
}

export async function getItems() {
  return await prisma.item.findMany({
    orderBy: { date: "desc" },
    include: {
      group: true,
    },
  });
}

// Test function for server action
export async function addItem() {
  const sampleItem = {
    name: "watermelon juice",
    brand: "Tropicana",
    store: "Walmart",
    count: 1,
    amount: 100,
    unit: Unit.mL,
    price: 22.22,
    date: new Date(),
    isSale: true,
  };

  // First try to find an existing group
  const existingGroup = await prisma.group.findFirst({
    where: {
      name: sampleItem.name,
      brand: sampleItem.brand,
      store: sampleItem.store,
      count: sampleItem.count,
      amount: sampleItem.amount,
      unit: sampleItem.unit,
    },
  });

  if (existingGroup) {
    // Add new price point to existing group
    return await prisma.item.create({
      data: {
        date: sampleItem.date,
        price: sampleItem.price,
        isSale: sampleItem.isSale,
        groupId: existingGroup.id,
      },
    });
  } else {
    // Create new group with initial price point
    return await prisma.group.create({
      data: {
        name: sampleItem.name,
        brand: sampleItem.brand,
        store: sampleItem.store,
        count: sampleItem.count,
        amount: sampleItem.amount,
        unit: sampleItem.unit,
        items: {
          create: {
            date: sampleItem.date,
            price: sampleItem.price,
            isSale: sampleItem.isSale,
          },
        },
      },
    });
  }
}

export async function updateItems() {}

export async function deleteGroceryItems() {}
