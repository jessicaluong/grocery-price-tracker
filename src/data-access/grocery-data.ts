import prisma from "@/lib/db";
import { TItemSchema, TPricePointSchema } from "@/zod-schemas/grocery-schemas";
import { TGroupSchema } from "@/zod-schemas/grocery-schemas";
import { verifySession } from "@/lib/auth";
import { AuthorizationError, DuplicateGroupError } from "@/lib/customErrors";
import { getGroupsWithPriceStats } from "@prisma/client/sql";
import { PrismaClient } from "@prisma/client";
import { TReceiptSchema } from "@/zod-schemas/receipt-schemas";

export async function getGroups() {
  const session = await verifySession();
  if (!session) return [];

  const groups = await prisma.$queryRawTyped(
    getGroupsWithPriceStats(session.userId)
  );

  return groups;
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
    return [];
  }
}

export async function getPriceHistory(groupId: string) {
  const session = await verifySession();
  if (!session) return null;

  // authorization
  const foundGroup = await prisma.group.findFirst({
    where: { id: groupId, userId: session.userId },
  });

  if (!foundGroup) {
    throw new AuthorizationError();
  }

  try {
    const result = await prisma.item.findMany({
      where: { groupId },
      select: { id: true, date: true, price: true, isSale: true },
      orderBy: { date: "asc" },
    });

    return result;
  } catch (error) {
    console.log("Failed to fetch price history");
    return null;
  }
}

type PrismaClientOrTransaction = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

async function _addItemImplementation(
  item: TItemSchema,
  userId: string,
  db: PrismaClientOrTransaction = prisma
) {
  const normalizedBrand = item.brand === "" ? null : item.brand;

  const existingGroup = await db.group.findFirst({
    where: {
      name: item.name,
      brand: normalizedBrand,
      store: item.store,
      count: item.count,
      amount: item.amount,
      unit: item.unit,
      userId,
    },
  });

  if (existingGroup) {
    await db.item.create({
      data: {
        date: item.date,
        price: item.price,
        isSale: item.isSale,
        groupId: existingGroup.id,
      },
    });
  } else {
    await db.group.create({
      data: {
        name: item.name,
        brand: normalizedBrand,
        store: item.store,
        count: item.count,
        amount: item.amount,
        unit: item.unit,
        userId,
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

export async function addItem(item: TItemSchema) {
  const session = await verifySession();
  if (!session) return null;

  return _addItemImplementation(item, session.userId);
}

export async function addReceiptData(data: TReceiptSchema) {
  const session = await verifySession();
  if (!session) return null;

  return await prisma.$transaction(async (tx) => {
    for (const item of data.items) {
      const itemData = {
        store: data.store,
        date: data.date,
        name: item.name,
        brand: item.brand,
        count: item.count,
        amount: item.amount,
        unit: item.unit,
        price: item.price,
        isSale: item.isSale,
      };

      await _addItemImplementation(itemData, session.userId, tx);
    }
  });
}

export async function editItem(itemData: TPricePointSchema, itemId: string) {
  const session = await verifySession();
  if (!session) return null;

  // authorization
  const currentItem = await prisma.item.findFirst({
    where: { id: itemId, group: { userId: session.userId } },
  });

  if (!currentItem) {
    throw new AuthorizationError();
  }

  await prisma.item.update({
    where: { id: itemId },
    data: {
      date: itemData.date,
      price: itemData.price,
      isSale: itemData.isSale,
    },
  });
}

export async function deleteItem(itemId: string) {
  const session = await verifySession();
  if (!session) return null;

  // authorization
  const currentItem = await prisma.item.findFirst({
    where: { id: itemId, group: { userId: session.userId } },
  });

  if (!currentItem) {
    throw new AuthorizationError();
  }

  await prisma.item.delete({
    where: { id: itemId },
  });
}

export async function addItemToGroup(
  itemData: TPricePointSchema,
  groupId: string
) {
  const session = await verifySession();
  if (!session) return null;

  // authorization
  const foundGroup = await prisma.group.findFirst({
    where: { id: groupId, userId: session.userId },
  });

  if (!foundGroup) {
    throw new AuthorizationError();
  }

  await prisma.item.create({
    data: {
      date: itemData.date,
      price: itemData.price,
      isSale: itemData.isSale,
      groupId: groupId,
    },
  });
}

export async function editGroup(groupData: TGroupSchema, groupId: string) {
  const session = await verifySession();
  if (!session) return null;

  // authorization
  const foundGroup = await prisma.group.findFirst({
    where: { id: groupId, userId: session.userId },
  });

  if (!foundGroup) {
    throw new AuthorizationError();
  }

  const normalizedBrand = groupData.brand === "" ? null : groupData.brand;

  // check if duplicate group exists
  const existingGroup = await prisma.group.findFirst({
    where: {
      userId: session.userId,
      name: groupData.name,
      brand: normalizedBrand,
      store: groupData.store,
      count: groupData.count,
      amount: groupData.amount,
      unit: groupData.unit,
      id: { not: groupId },
    },
  });

  if (existingGroup) {
    throw new DuplicateGroupError();
  }

  await prisma.group.update({
    where: { id: groupId },
    data: {
      name: groupData.name,
      brand: normalizedBrand,
      store: groupData.store,
      count: groupData.count,
      amount: groupData.amount,
      unit: groupData.unit,
    },
  });
}

export async function deleteGroup(groupId: string) {
  const session = await verifySession();
  if (!session) return null;

  // authorization
  const foundGroup = await prisma.group.findFirst({
    where: { id: groupId, userId: session.userId },
  });

  if (!foundGroup) {
    throw new AuthorizationError();
  }

  await prisma.group.delete({
    where: { id: groupId },
  });
}
