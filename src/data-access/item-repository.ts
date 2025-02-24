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

export async function getPriceHistoryByGroupId(id: string) {
  const items = await prisma.group.findUnique({
    where: { id },
    select: {
      items: {
        select: { id: true, date: true, price: true, isSale: true },
        orderBy: { date: "asc" },
      },
    },
  });

  const priceHistory = items?.items ?? [];
  return {
    priceHistory,
    minPrice:
      priceHistory.length > 0
        ? Math.min(...priceHistory.map((pricePoint) => pricePoint.price))
        : 0,
    maxPrice:
      priceHistory.length > 0
        ? Math.max(...priceHistory.map((pricePoint) => pricePoint.price))
        : 0,
  };
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
