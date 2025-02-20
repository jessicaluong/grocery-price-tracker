import prisma from "@/lib/db";
import { Unit } from "@prisma/client";

export async function getGroups() {
  const groups = await prisma.group.findMany({
    select: {
      id: true,
      name: true,
      brand: true,
      store: true,
      count: true,
      amount: true,
      unit: true,
      minPrice: true,
      maxPrice: true,
      items: {
        select: {
          date: true,
          price: true,
          isSale: true,
        },
        orderBy: {
          date: "desc",
        },
      },
      _count: {
        select: { items: true },
      },
    },
  });

  return groups.map((group) => ({
    id: group.id,
    name: group.name,
    brand: group.brand,
    store: group.store,
    count: group.count,
    amount: group.amount,
    unit: group.unit,
    minPrice: group.minPrice,
    maxPrice: group.maxPrice,
    numberOfItems: group._count.items,
    priceHistory: group.items,
  }));
}

export async function getItems() {
  const items = await prisma.item.findMany({
    orderBy: { date: "desc" },
    select: {
      id: true,
      date: true,
      price: true,
      isSale: true,
      groupId: true,
      group: {
        select: {
          name: true,
          brand: true,
          store: true,
          count: true,
          amount: true,
          unit: true,
        },
      },
    },
  });

  return items.map((item) => ({
    id: item.id,
    name: item.group.name,
    brand: item.group.brand,
    store: item.group.store,
    count: item.group.count,
    amount: item.group.amount,
    unit: item.group.unit,
    price: item.price,
    date: item.date,
    isSale: item.isSale,
    groupId: item.groupId,
  }));
}

// // Test function for server action
// export async function addItem() {
//   const sampleItem = {
//     name: "watermelon juice",
//     brand: "Tropicana",
//     store: "Walmart",
//     count: 1,
//     amount: 100,
//     unit: Unit.mL,
//     price: 22.22,
//     date: new Date(),
//     isSale: true,
//   };

//   // First try to find an existing group
//   const existingGroup = await prisma.group.findFirst({
//     where: {
//       name: sampleItem.name,
//       brand: sampleItem.brand,
//       store: sampleItem.store,
//       count: sampleItem.count,
//       amount: sampleItem.amount,
//       unit: sampleItem.unit,
//     },
//   });

//   if (existingGroup) {
//     // Add new price point to existing group
//     return await prisma.item.create({
//       data: {
//         date: sampleItem.date,
//         price: sampleItem.price,
//         isSale: sampleItem.isSale,
//         groupId: existingGroup.id,
//       },
//     });
//   } else {
//     // Create new group with initial price point
//     return await prisma.group.create({
//       data: {
//         name: sampleItem.name,
//         brand: sampleItem.brand,
//         store: sampleItem.store,
//         count: sampleItem.count,
//         amount: sampleItem.amount,
//         unit: sampleItem.unit,
//         items: {
//           create: {
//             date: sampleItem.date,
//             price: sampleItem.price,
//             isSale: sampleItem.isSale,
//           },
//         },
//       },
//     });
//   }
// }

// Test function for server action
export async function addItem(
  groupId: string,
  itemData: { price: number; date: Date; isSale: boolean }
) {
  return await prisma.$transaction(async (tx) => {
    // 1. Add the new item
    const createdItem = await tx.item.create({
      data: {
        ...itemData,
        groupId,
      },
    });

    // 2. Get current group data including min/max prices
    const group = await tx.group.findUnique({
      where: { id: groupId },
      select: {
        minPrice: true,
        maxPrice: true,
      },
    });

    if (!group) {
      throw new Error(`Group with id ${groupId} not found`);
    }

    // 3. Calculate new min/max prices
    const newMinPrice = Math.min(group.minPrice, itemData.price);
    const newMaxPrice = Math.max(group.maxPrice, itemData.price);

    // 4. Update the group if min/max changed
    if (newMinPrice !== group.minPrice || newMaxPrice !== group.maxPrice) {
      await tx.group.update({
        where: { id: groupId },
        data: {
          minPrice: newMinPrice,
          maxPrice: newMaxPrice,
        },
      });
    }

    return createdItem;
  });
}

export async function updateItems() {}

export async function deleteGroceryItems() {}
