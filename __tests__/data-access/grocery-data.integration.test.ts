import {
  addItem,
  addItemToGroup,
  addReceiptData,
  deleteGroup,
  deleteItem,
  editGroup,
  editItem,
} from "@/data-access/grocery-data";
import prisma from "@/lib/db";
import { verifySession } from "@/lib/auth";
import { AuthorizationError, DuplicateGroupError } from "@/lib/customErrors";
import { UnitEnum } from "@/types/grocery";

jest.mock("@/lib/auth", () => ({
  verifySession: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

describe("Item Repository integration tests", () => {
  const userId = "test-user-id";
  const otherUserId = "other-user-id";

  beforeAll(async () => {
    await prisma.user.create({
      data: {
        id: userId,
        email: "test@example.com",
      },
    });
  });

  beforeEach(() => {
    (verifySession as jest.Mock).mockResolvedValue({ userId });
  });

  afterAll(async () => {
    const deleteItem = prisma.item.deleteMany({});
    const deleteGroup = prisma.group.deleteMany({});
    const deleteUser = prisma.user.deleteMany({});

    await prisma.$transaction([deleteItem, deleteGroup, deleteUser]);
    await prisma.$disconnect();
  });

  describe("addItem", () => {
    afterEach(async () => {
      const deleteItem = prisma.item.deleteMany({});
      const deleteGroup = prisma.group.deleteMany({});
      await prisma.$transaction([deleteItem, deleteGroup]);
    });

    const baseItem = {
      name: "test juice",
      brand: "Test Brand",
      store: "Test Store",
      count: 1,
      amount: 100,
      unit: UnitEnum.mL,
      price: 4.99,
      date: new Date("2024-03-01"),
      isSale: true,
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
      await addItem(baseItem);

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

      await addItem(secondItem);

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

      await addItem(itemWithNullBrand);

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
        unit: UnitEnum.L,
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

      await prisma.user.create({
        data: {
          id: otherUserId,
          email: "different@example.com",
          hashedPassword: "test-password-hash",
        },
      });
      const otherUserItem = {
        ...baseItem,
      };

      (verifySession as jest.Mock).mockResolvedValue({ userId: otherUserId });

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

  describe("addReceiptData", () => {
    afterEach(async () => {
      const deleteItem = prisma.item.deleteMany({});
      const deleteGroup = prisma.group.deleteMany({});
      await prisma.$transaction([deleteItem, deleteGroup]);
    });

    const receiptData = {
      store: "Superstore",
      date: new Date("2025-03-27"),
      items: [
        {
          name: "Milk",
          brand: "Dairyland",
          count: 1,
          amount: 1,
          unit: UnitEnum.L,
          price: 3.99,
          isSale: false,
        },
        {
          name: "Bread",
          brand: "Silver Hills",
          count: 1,
          amount: 675,
          unit: UnitEnum.g,
          price: 2.49,
          isSale: true,
        },
        {
          name: "Eggs",
          brand: null,
          count: 1,
          amount: 12,
          unit: UnitEnum.units,
          price: 4.29,
          isSale: false,
        },
      ],
    };

    it("should add multiple items from a receipt in a single transaction", async () => {
      await addReceiptData(receiptData);

      const groups = await prisma.group.findMany({
        where: { userId },
        include: { items: true },
      });

      expect(groups.length).toBe(3);

      for (const group of groups) {
        expect(group.store).toBe("Superstore");
        expect(group.items[0].date.toISOString()).toBe(
          receiptData.date.toISOString()
        );
      }

      // check one item for verification
      const eggsGroup = groups.find(
        (g) => g.name === "Eggs" && g.brand === null
      );
      expect(eggsGroup).toBeDefined();
      expect(eggsGroup?.count).toBe(1);
      expect(eggsGroup?.amount).toBe(12);
      expect(eggsGroup?.unit).toBe(UnitEnum.units);
      expect(eggsGroup?.items.length).toBe(1);
      expect(eggsGroup?.items[0].price).toBe(4.29);
      expect(eggsGroup?.items[0].isSale).toBe(false);
    });

    it("should add to existing groups when matching items exist in receipt", async () => {
      const existingItem = {
        name: "Milk",
        brand: "Dairyland",
        store: "Superstore",
        count: 1,
        amount: 1,
        unit: UnitEnum.L,
        price: 4.99,
        date: new Date("2025-03-01"),
        isSale: false,
      };

      await addItem(existingItem);

      await addReceiptData(receiptData);

      const groups = await prisma.group.findMany({
        where: { userId },
        include: {
          items: {
            orderBy: { date: "asc" },
          },
        },
      });

      expect(groups.length).toBe(3);

      const milkGroup = groups.find((g) => g.name === "Milk");
      expect(milkGroup).toBeDefined();
      expect(milkGroup?.items.length).toBe(2);

      const prices = milkGroup?.items.map((item) => item.price).sort();
      expect(prices).toEqual([3.99, 4.99]);
    });

    it("should prevent unauthorized users from adding receipt data", async () => {
      (verifySession as jest.Mock).mockResolvedValue({ userId: otherUserId });

      await addReceiptData(receiptData);

      // verify no items were added
      const groups = await prisma.group.findMany({
        where: { userId },
      });

      expect(groups.length).toBe(0);
    });

    it("should handle a large receipt with many items", async () => {
      const items = Array.from({ length: 20 }, (_, i) => ({
        name: `Item ${i + 1}`,
        brand: i % 2 === 0 ? `Brand ${i + 1}` : null,
        count: 1,
        amount: i + 1,
        unit: UnitEnum.units,
        price: (i + 1) * 0.99,
        isSale: i % 3 === 0,
      }));

      const receiptData = {
        store: "Superstore",
        date: new Date("2025-03-27"),
        items,
      };

      await addReceiptData(receiptData);

      const groups = await prisma.group.findMany({
        where: { userId },
      });

      expect(groups.length).toBe(20);

      const allSameStore = groups.every((g) => g.store === "Superstore");
      expect(allSameStore).toBe(true);
    });
  });

  describe("editItem", () => {
    const existingGroupData = {
      name: "Original Name",
      brand: "Original Brand",
      store: "Original Store",
      count: 1,
      amount: 1,
      unit: UnitEnum.kg,
      userId,
    };
    const existingItemData = {
      price: 4.99,
      date: new Date("2025-03-15"),
      isSale: true,
    };
    const updateItemData = {
      price: 1.99,
      date: new Date("2025-03-18"),
      isSale: false,
    };
    let existingItemId: string;

    beforeEach(async () => {
      // create an existing item to edit later
      const existingGroup = await prisma.group.create({
        data: {
          ...existingGroupData,
          items: {
            create: existingItemData,
          },
        },
      });
      const existingGroupId = existingGroup.id;
      const existingItem = await prisma.item.findFirst({
        where: { groupId: existingGroupId },
      });

      if (!existingItem) {
        throw new Error("Failed to create test item");
      }

      existingItemId = existingItem.id;
    });

    afterEach(async () => {
      const deleteItem = prisma.item.deleteMany({});
      const deleteGroup = prisma.group.deleteMany({});
      await prisma.$transaction([deleteItem, deleteGroup]);
    });

    it("should update an item successfully", async () => {
      const itemBeforeUpdate = await prisma.item.findUnique({
        where: { id: existingItemId },
      });
      expect(itemBeforeUpdate).toMatchObject(existingItemData);

      await editItem(updateItemData, existingItemId);

      const itemAfterUpdate = await prisma.item.findUnique({
        where: { id: existingItemId },
      });
      expect(itemAfterUpdate).toMatchObject(updateItemData);
    });

    it("should prevent updates from unauthorized users", async () => {
      (verifySession as jest.Mock).mockResolvedValue({ userId: otherUserId });

      const itemBeforeAttempt = await prisma.item.findUnique({
        where: { id: existingItemId },
      });
      expect(itemBeforeAttempt).toMatchObject(existingItemData);

      await expect(editItem(updateItemData, existingItemId)).rejects.toThrow(
        AuthorizationError
      );

      const itemAfterAttempt = await prisma.item.findUnique({
        where: { id: existingItemId },
      });
      expect(itemAfterAttempt).toMatchObject(existingItemData);
    });
  });

  describe("deleteItem", () => {
    const existingGroupData = {
      name: "Original Name",
      brand: "Original Brand",
      store: "Original Store",
      count: 1,
      amount: 1,
      unit: UnitEnum.kg,
      userId,
    };
    const existingItemData = {
      price: 4.99,
      date: new Date("2025-03-15"),
      isSale: true,
    };
    let existingItemId: string;

    beforeEach(async () => {
      // create an existing item to delete later
      const existingGroup = await prisma.group.create({
        data: {
          ...existingGroupData,
          items: {
            create: existingItemData,
          },
        },
      });
      const existingGroupId = existingGroup.id;
      const existingItem = await prisma.item.findFirst({
        where: { groupId: existingGroupId },
      });

      if (!existingItem) {
        throw new Error("Failed to create test item");
      }

      existingItemId = existingItem.id;
    });

    afterEach(async () => {
      const deleteItem = prisma.item.deleteMany({});
      const deleteGroup = prisma.group.deleteMany({});
      await prisma.$transaction([deleteItem, deleteGroup]);
    });

    it("should delete an item successfully", async () => {
      const itemBeforeDeletion = await prisma.item.findUnique({
        where: { id: existingItemId },
      });
      expect(itemBeforeDeletion).not.toBeNull();

      await deleteItem(existingItemId);

      const itemAfterDeletion = await prisma.item.findUnique({
        where: { id: existingItemId },
      });
      expect(itemAfterDeletion).toBeNull();
    });

    it("should prevent delete from unauthorized users", async () => {
      const itemBeforeAttempt = await prisma.item.findUnique({
        where: { id: existingItemId },
      });
      expect(itemBeforeAttempt).not.toBeNull();

      (verifySession as jest.Mock).mockResolvedValue({ userId: otherUserId });

      await expect(deleteItem(existingItemId)).rejects.toThrow(
        AuthorizationError
      );

      const itemAfterAttempt = await prisma.item.findUnique({
        where: { id: existingItemId },
      });
      expect(itemAfterAttempt).not.toBeNull();
    });
  });

  describe("addItemToGroup", () => {
    const newItemData = {
      price: 4.99,
      date: new Date("2025-03-15"),
      isSale: true,
    };

    const existingGroupData = {
      name: "Original Name",
      brand: "Original Brand",
      store: "Original Store",
      count: 1,
      amount: 1,
      unit: UnitEnum.kg,
      userId,
    };

    let existingGroupId: string;

    beforeAll(async () => {
      const existingGroup = await prisma.group.create({
        data: existingGroupData,
      });
      existingGroupId = existingGroup.id;
    });

    afterEach(async () => {
      await prisma.item.deleteMany({});
    });

    afterAll(async () => {
      const deleteItem = prisma.item.deleteMany({});
      const deleteGroup = prisma.group.deleteMany({});
      await prisma.$transaction([deleteItem, deleteGroup]);
    });

    it("should add an item to group successfully", async () => {
      const groupBeforeAdd = await prisma.group.findUnique({
        where: { id: existingGroupId },
        include: { items: true },
      });
      expect(groupBeforeAdd?.items.length).toBe(0);

      await addItemToGroup(newItemData, existingGroupId);

      const groupAfterAdd = await prisma.group.findUnique({
        where: { id: existingGroupId },
        include: { items: true },
      });
      expect(groupAfterAdd?.items.length).toBe(1);

      const addedItem = groupAfterAdd?.items[0];
      expect(addedItem?.price).toBe(newItemData.price);
      expect(addedItem?.isSale).toBe(newItemData.isSale);
      expect(addedItem?.date.toISOString()).toBe(
        newItemData.date.toISOString()
      );
      expect(addedItem?.groupId).toBe(existingGroupId);
    });

    it("should prevent add from unauthorized users", async () => {
      const groupBeforeAttempt = await prisma.group.findUnique({
        where: { id: existingGroupId },
        include: { items: true },
      });
      expect(groupBeforeAttempt?.items.length).toBe(0);

      (verifySession as jest.Mock).mockResolvedValue({ userId: otherUserId });

      await expect(
        addItemToGroup(newItemData, existingGroupId)
      ).rejects.toThrow(AuthorizationError);

      const groupAfterAttempt = await prisma.group.findUnique({
        where: { id: existingGroupId },
        include: { items: true },
      });
      expect(groupAfterAttempt?.items.length).toBe(0);
    });
  });

  describe("editGroup", () => {
    const existingGroupData = {
      name: "Original Name",
      brand: "Original Brand",
      store: "Original Store",
      count: 1,
      amount: 1,
      unit: UnitEnum.kg,
      userId,
    };

    let existingGroupId: string;

    const updateGroupData = {
      name: "Updated Name",
      brand: "Updated Brand",
      store: "Updated Store",
      count: 2,
      amount: 200,
      unit: UnitEnum.mL,
    };

    beforeEach(async () => {
      const existingGroup = await prisma.group.create({
        data: existingGroupData,
      });
      existingGroupId = existingGroup.id;
    });

    afterEach(async () => {
      await prisma.group.deleteMany({});
    });

    it("should update a group successfully", async () => {
      const groupBeforeUpdate = await prisma.group.findUnique({
        where: { id: existingGroupId },
      });
      expect(groupBeforeUpdate).toMatchObject(existingGroupData);

      await editGroup(updateGroupData, existingGroupId);

      const groupAfterUpdate = await prisma.group.findUnique({
        where: { id: existingGroupId },
      });
      expect(groupAfterUpdate).toMatchObject(updateGroupData);
    });

    it("should prevent updates from unauthorized users", async () => {
      (verifySession as jest.Mock).mockResolvedValue({ userId: otherUserId });

      const groupBeforeUpdate = await prisma.group.findUnique({
        where: { id: existingGroupId },
      });
      expect(groupBeforeUpdate).toMatchObject(existingGroupData);

      await expect(editGroup(updateGroupData, existingGroupId)).rejects.toThrow(
        AuthorizationError
      );

      const groupAfterUpdate = await prisma.group.findUnique({
        where: { id: existingGroupId },
      });
      expect(groupAfterUpdate).toMatchObject(existingGroupData);
    });

    it("should not be able to create a duplicate group (non-null brand) by editing existing group", async () => {
      const groupWithDifferentName = {
        ...existingGroupData,
        name: "different name",
      };

      const secondGroup = await prisma.group.create({
        data: groupWithDifferentName,
      });

      // try to update second group to match the first
      const duplicateData = {
        name: existingGroupData.name,
        brand: existingGroupData.brand,
        store: existingGroupData.store,
        count: existingGroupData.count,
        amount: existingGroupData.amount,
        unit: existingGroupData.unit,
      };

      await expect(editGroup(duplicateData, secondGroup.id)).rejects.toThrow(
        DuplicateGroupError
      );
    });

    it("should not be able to create a duplicate group (null brand) by editing existing group", async () => {
      const groupWithDifferentNameNullBrand = {
        ...existingGroupData,
        name: "different name",
        brand: null,
      };

      await prisma.group.create({ data: groupWithDifferentNameNullBrand });

      // try to update first group to match the second
      const duplicateData = {
        name: "different name",
        brand: null,
        store: existingGroupData.store,
        count: existingGroupData.count,
        amount: existingGroupData.amount,
        unit: existingGroupData.unit,
      };

      await expect(editGroup(duplicateData, existingGroupId)).rejects.toThrow(
        DuplicateGroupError
      );
    });
  });

  describe("deleteGroup", () => {
    const existingGroupData = {
      name: "Original Name",
      brand: "Original Brand",
      store: "Original Store",
      count: 1,
      amount: 1,
      unit: UnitEnum.kg,
      userId,
    };
    let existingGroupId: string;

    beforeEach(async () => {
      const existingGroup = await prisma.group.create({
        data: existingGroupData,
      });
      existingGroupId = existingGroup.id;
    });

    afterEach(async () => {
      await prisma.group.deleteMany({});
    });

    it("should delete a group successfully", async () => {
      const groupBeforeDeletion = await prisma.group.findUnique({
        where: { id: existingGroupId },
      });
      expect(groupBeforeDeletion).not.toBeNull();

      await deleteGroup(existingGroupId);

      const groupAfterDeletion = await prisma.group.findUnique({
        where: { id: existingGroupId },
      });
      expect(groupAfterDeletion).toBeNull();
    });

    it("should prevent delete from unauthorized users", async () => {
      const groupBeforeAttempt = await prisma.group.findUnique({
        where: { id: existingGroupId },
      });
      expect(groupBeforeAttempt).not.toBeNull();

      (verifySession as jest.Mock).mockResolvedValue({ userId: otherUserId });

      await expect(deleteGroup(existingGroupId)).rejects.toThrow(
        AuthorizationError
      );

      const groupAfterAttempt = await prisma.group.findUnique({
        where: { id: existingGroupId },
      });
      expect(groupAfterAttempt).not.toBeNull();
    });
  });
});
