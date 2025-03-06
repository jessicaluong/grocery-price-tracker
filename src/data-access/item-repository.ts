import prisma from "@/lib/db";
import { AddItemInput } from "@/lib/form-types";

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

export async function addItem(item: AddItemInput) {
  const normalizedBrand = item.brand === "" ? null : item.brand;

  const existingGroup = await prisma.group.findFirst({
    where: {
      name: item.name,
      brand: normalizedBrand,
      store: item.store,
      count: item.count,
      amount: item.amount,
      unit: item.unit,
    },
  });

  if (existingGroup) {
    return await prisma.item.create({
      data: {
        date: item.date,
        price: item.price,
        isSale: item.isSale,
        groupId: existingGroup.id,
      },
    });
  } else {
    return await prisma.group.create({
      data: {
        name: item.name,
        brand: normalizedBrand,
        store: item.store,
        count: item.count,
        amount: item.amount,
        unit: item.unit,
        items: {
          create: {
            date: item.date,
            price: item.price,
            isSale: item.isSale,
          },
        },
      },
    });
  }
}

export async function updateItems() {}

export async function deleteGroceryItems() {}
