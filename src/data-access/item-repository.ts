import prisma from "@/lib/db";
import { AddItemInput } from "@/zod-schemas/item-schemas";
import { verifySession } from "@/lib/auth";

export async function getGroups() {
  const session = await verifySession();
  if (!session) return [];

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
  const session = await verifySession();
  if (!session) return [];

  try {
    const items = await prisma.item.findMany({
      where: {
        group: {
          userId: session.userId,
        },
      },
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
  } catch (error) {
    console.log("Failed to fetch items");
    return [];
  }
}

export async function getPriceHistoryByGroupId(id: string) {
  const session = await verifySession();
  if (!session) return null;

  const group = await prisma.group.findUnique({
    where: { id: id },
    select: { userId: true },
  });

  if (!group || group.userId !== session.userId) {
    throw new Error("Unauthorized access to price history");
  }

  try {
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
  } catch (error) {
    console.log("Failed to fetch price history");
    return null;
  }
}

export async function addItem(item: AddItemInput & { userId: string }) {
  const session = await verifySession();
  if (!session) return null;

  const normalizedBrand = item.brand === "" ? null : item.brand;

  const existingGroup = await prisma.group.findFirst({
    where: {
      name: item.name,
      brand: normalizedBrand,
      store: item.store,
      count: item.count,
      amount: item.amount,
      unit: item.unit,
      userId: item.userId,
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
        userId: item.userId,
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
