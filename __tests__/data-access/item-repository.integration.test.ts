import { addItem } from "@/data-access/item-repository";
import prisma from "@/lib/db";
import { Unit } from "@prisma/client";
import { getServerSession } from "next-auth/next";

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: jest.fn(),
}));

describe("Item Repository integration tests", () => {
  const mockSession = {
    user: { id: "test-user-id", email: "test@example.com" },
  };

  const userId = "test-user-id";

  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: { email: "test@example.com" },
    });

    await prisma.user.create({
      data: {
        id: userId,
        email: "test@example.com",
        hashedPassword: "test-password-hash",
      },
    });
  });

  beforeEach(() => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
  });

  afterAll(async () => {
    const deleteItem = prisma.item.deleteMany({});
    const deleteGroup = prisma.group.deleteMany({});
    const deleteUser = prisma.user.deleteMany({});

    await prisma.$transaction([deleteItem, deleteGroup, deleteUser]);
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    const deleteItem = prisma.item.deleteMany({});
    const deleteGroup = prisma.group.deleteMany({});
    await prisma.$transaction([deleteItem, deleteGroup]);
  });

  describe("addItem", () => {
    const baseItem = {
      name: "test juice",
      brand: "Test Brand",
      store: "Test Store",
      count: 1,
      amount: 100,
      unit: Unit.mL,
      price: 4.99,
      date: new Date("2024-03-01"),
      isSale: true,
      userId,
    };

    it("should create a new group with an item when no matching group exists", async () => {
      await addItem(baseItem);

      const group = await prisma.group.findFirst({
        where: {
          name: baseItem.name,
          brand: baseItem.brand,
          store: baseItem.store,
          userId,
        },
        include: {
          items: true,
        },
      });

      expect(group).toBeDefined();
      expect(group).toHaveProperty("name", baseItem.name);
      expect(group?.name).toBe(baseItem.name);
      expect(group?.brand).toBe(baseItem.brand);
      expect(group?.store).toBe(baseItem.store);
      expect(group?.count).toBe(baseItem.count);
      expect(group?.amount).toBe(baseItem.amount);
      expect(group?.unit).toBe(baseItem.unit);
      expect(group?.userId).toBe(userId);

      expect(group?.items.length).toBe(1);
      expect(group?.items[0].price).toBe(baseItem.price);
      expect(group?.items[0].isSale).toBe(baseItem.isSale);
    });

    it("should add a new item to an existing group", async () => {
      // Create a group
      const firstResult = await addItem(baseItem);
      expect(firstResult).toBeDefined();

      const group = await prisma.group.findFirst({
        where: {
          name: baseItem.name,
          brand: baseItem.brand,
          store: baseItem.store,
          userId,
        },
      });

      expect(group).toBeDefined();
      const groupId = group!.id;

      // Create a second item with a different price
      const secondItem = {
        ...baseItem,
        price: 3.99,
        date: new Date("2024-03-15"),
        isSale: false,
      };

      const secondResult = await addItem(secondItem);
      expect(secondResult).toBeDefined();

      const updatedGroup = await prisma.group.findUnique({
        where: { id: groupId },
        include: {
          items: {
            orderBy: { date: "asc" },
          },
        },
      });

      expect(updatedGroup).toBeDefined();
      expect(updatedGroup?.items.length).toBe(2);

      // First item
      expect(updatedGroup?.items[0].price).toBe(baseItem.price);
      expect(updatedGroup?.items[0].date.toISOString()).toBe(
        baseItem.date.toISOString()
      );
      expect(updatedGroup?.items[0].isSale).toBe(baseItem.isSale);

      // Second item
      expect(updatedGroup?.items[1].price).toBe(secondItem.price);
      expect(updatedGroup?.items[1].date.toISOString()).toBe(
        secondItem.date.toISOString()
      );
      expect(updatedGroup?.items[1].isSale).toBe(secondItem.isSale);
    });

    it("should handle items with null brand correctly", async () => {
      const itemWithNullBrand = {
        ...baseItem,
        brand: null,
      };

      const result = await addItem(itemWithNullBrand);
      expect(result).toBeDefined();

      const group = await prisma.group.findFirst({
        where: {
          name: itemWithNullBrand.name,
          brand: null,
          userId,
        },
      });

      expect(group).toBeDefined();
      expect(group?.brand).toBeNull();
    });

    it("should treat empty string as null for brand", async () => {
      const itemWithNullBrand = {
        ...baseItem,
        brand: null,
      };

      const itemWithEmptyBrand = {
        ...baseItem,
        brand: "",
        price: 5.99, // Different price to distinguish
      };

      await addItem(itemWithNullBrand);
      await addItem(itemWithEmptyBrand);

      const groups = await prisma.group.findMany({
        where: {
          name: baseItem.name,
          store: baseItem.store,
          userId,
        },
        include: {
          items: true,
        },
      });

      expect(groups.length).toBe(1);
      expect(groups[0].brand).toBeNull();
      expect(groups[0].items.length).toBe(2);

      // Sort prices to ensure consistent test results
      const prices = groups[0].items.map((item) => item.price).sort();
      expect(prices).toEqual(
        [itemWithNullBrand.price, itemWithEmptyBrand.price].sort()
      );
    });

    it("should create different groups for different brands", async () => {
      const item1 = { ...baseItem };
      const item2 = {
        ...baseItem,
        brand: "Different Brand",
        price: 1.99,
      };

      await addItem(item1);
      await addItem(item2);

      const groups = await prisma.group.findMany({
        where: {
          name: baseItem.name,
          store: baseItem.store,
          userId,
        },
        include: {
          items: true,
        },
      });

      expect(groups.length).toBe(2);

      const brand1Group = groups.find((g) => g.brand === baseItem.brand);
      const brand2Group = groups.find((g) => g.brand === item2.brand);

      expect(brand1Group).toBeDefined();
      expect(brand2Group).toBeDefined();

      expect(brand1Group?.items[0].price).toBe(item1.price);
      expect(brand2Group?.items[0].price).toBe(item2.price);
    });

    it("should create different groups for different stores", async () => {
      const item1 = { ...baseItem };
      const item2 = {
        ...baseItem,
        store: "Different Store",
        price: 5.99,
      };

      await addItem(item1);
      await addItem(item2);

      const groups = await prisma.group.findMany({
        where: {
          name: baseItem.name,
          brand: baseItem.brand,
          userId,
        },
        include: {
          items: true,
        },
      });

      expect(groups.length).toBe(2);

      const store1Group = groups.find((g) => g.store === baseItem.store);
      const store2Group = groups.find((g) => g.store === item2.store);

      expect(store1Group).toBeDefined();
      expect(store2Group).toBeDefined();

      expect(store1Group?.items[0].price).toBe(item1.price);
      expect(store2Group?.items[0].price).toBe(item2.price);
    });

    it("should create different groups for different amounts", async () => {
      const item1 = { ...baseItem };
      const item2 = {
        ...baseItem,
        amount: 200,
        price: 8.99,
      };

      await addItem(item1);
      await addItem(item2);

      const groups = await prisma.group.findMany({
        where: {
          name: baseItem.name,
          brand: baseItem.brand,
          store: baseItem.store,
          userId,
        },
        include: {
          items: true,
        },
      });

      expect(groups.length).toBe(2);

      const amount1Group = groups.find((g) => g.amount === baseItem.amount);
      const amount2Group = groups.find((g) => g.amount === item2.amount);

      expect(amount1Group).toBeDefined();
      expect(amount2Group).toBeDefined();

      expect(amount1Group?.items[0].price).toBe(item1.price);
      expect(amount2Group?.items[0].price).toBe(item2.price);
    });

    it("should create different groups for different units", async () => {
      const item1 = { ...baseItem };
      const item2 = {
        ...baseItem,
        unit: Unit.L,
        price: 9.99,
      };

      await addItem(item1);
      await addItem(item2);

      const groups = await prisma.group.findMany({
        where: {
          name: baseItem.name,
          brand: baseItem.brand,
          store: baseItem.store,
          userId,
        },
        include: {
          items: true,
        },
      });

      expect(groups.length).toBe(2);

      const unit1Group = groups.find((g) => g.unit === baseItem.unit);
      const unit2Group = groups.find((g) => g.unit === item2.unit);

      expect(unit1Group).toBeDefined();
      expect(unit2Group).toBeDefined();

      expect(unit1Group?.items[0].price).toBe(item1.price);
      expect(unit2Group?.items[0].price).toBe(item2.price);
    });

    it("should create different groups for different count values", async () => {
      const item1 = { ...baseItem };
      const item2 = {
        ...baseItem,
        count: 2,
        price: 7.99,
      };

      await addItem(item1);
      await addItem(item2);

      const groups = await prisma.group.findMany({
        where: {
          name: baseItem.name,
          brand: baseItem.brand,
          store: baseItem.store,
          userId,
        },
        include: {
          items: true,
        },
      });

      expect(groups.length).toBe(2);

      const count1Group = groups.find((g) => g.count === baseItem.count);
      const count2Group = groups.find((g) => g.count === item2.count);

      expect(count1Group).toBeDefined();
      expect(count2Group).toBeDefined();

      expect(count1Group?.items[0].price).toBe(item1.price);
      expect(count2Group?.items[0].price).toBe(item2.price);
    });

    it("should handle case sensitivity in string fields correctly", async () => {
      const lowercaseItem = { ...baseItem, name: "test juice" };
      const uppercaseItem = {
        ...baseItem,
        name: "TEST JUICE",
        price: 6.99,
      };

      await addItem(lowercaseItem);
      await addItem(uppercaseItem);

      const groups = await prisma.group.findMany({
        where: {
          brand: baseItem.brand,
          store: baseItem.store,
          userId,
        },
        include: {
          items: true,
        },
      });

      // "test juice" and "TEST JUICE" should be treated as different items
      expect(groups.length).toBe(2);

      const lowercaseGroup = groups.find((g) => g.name === lowercaseItem.name);
      const uppercaseGroup = groups.find((g) => g.name === uppercaseItem.name);

      expect(lowercaseGroup).toBeDefined();
      expect(uppercaseGroup).toBeDefined();

      expect(lowercaseGroup?.items[0].price).toBe(lowercaseItem.price);
      expect(uppercaseGroup?.items[0].price).toBe(uppercaseItem.price);
    });

    it("should handle floating point numbers in amount accurately", async () => {
      const item1 = { ...baseItem, amount: 1.5, price: 5.99 };
      // prettier-ignore
      const item2 = { ...baseItem, amount: 1.50, price: 6.99 }; // Same value but different representation

      await addItem(item1);
      await addItem(item2);

      const groups = await prisma.group.findMany({
        where: {
          name: baseItem.name,
          brand: baseItem.brand,
          store: baseItem.store,
          userId,
        },
        include: {
          items: true,
        },
      });

      // 1.5 and 1.50 should be treated as the same value
      expect(groups.length).toBe(1);
      expect(groups[0].amount).toBe(1.5);
      expect(groups[0].items.length).toBe(2);

      // Verify both prices are present
      const prices = groups[0].items.map((item) => item.price).sort();
      expect(prices).toEqual([5.99, 6.99].sort());
    });

    it("should isolate items between different users", async () => {
      await addItem(baseItem);

      const otherUserId = "different-user";

      await prisma.user.create({
        data: {
          id: otherUserId,
          email: "different@example.com",
          hashedPassword: "test-password-hash",
        },
      });

      const otherUserItem = {
        ...baseItem,
        userId: otherUserId,
      };

      const otherUserSession = {
        user: { id: otherUserId, email: "different@example.com" },
      };
      (getServerSession as jest.Mock).mockResolvedValueOnce(otherUserSession);
      await addItem(otherUserItem);

      const firstUserGroups = await prisma.group.findMany({
        where: { userId },
        include: { items: true },
      });

      const secondUserGroups = await prisma.group.findMany({
        where: { userId: otherUserId },
        include: { items: true },
      });

      // Verify each user has their own data
      expect(firstUserGroups.length).toBe(1);
      expect(secondUserGroups.length).toBe(1);

      // Verify items exist for each user
      expect(firstUserGroups[0].items.length).toBeGreaterThan(0);
      expect(secondUserGroups[0].items.length).toBeGreaterThan(0);

      // Verify the groups are different despite having the same characteristics
      expect(firstUserGroups[0].id).not.toBe(secondUserGroups[0].id);

      // Verify we can query for both items simultaneously
      const allGroups = await prisma.group.count();
      expect(allGroups).toBe(2);

      // Verify the actual data content
      expect(firstUserGroups[0].name).toBe(baseItem.name);
      expect(secondUserGroups[0].name).toBe(baseItem.name);
    });
  });
});
