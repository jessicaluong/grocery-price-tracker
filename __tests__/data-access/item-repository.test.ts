import { addItem, editGroup } from "@/data-access/item-repository";
import { prismaMock } from "../../test/prisma-mock";
import { Unit } from "@prisma/client";
import { verifySession } from "@/lib/auth";

jest.mock("@/lib/auth", () => ({
  verifySession: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

describe("Item Repository", () => {
  beforeEach(() => {
    (verifySession as jest.Mock).mockResolvedValue({ userId: "test-user-id" });
  });

  describe("addItem", () => {
    const item = {
      name: "oats",
      brand: "Quaker",
      store: "Superstore",
      count: 1,
      amount: 1,
      unit: Unit.kg,
      price: 5.99,
      date: new Date("2025-03-01"),
      isSale: false,
      userId: "test-user-id",
    };

    it("should add item to existing group", async () => {
      const mockExistingGroup = {
        id: "g1",
        createdAt: new Date("2025-03-01"),
        updatedAt: new Date("2025-03-01"),
        name: "oats",
        brand: "Quaker",
        store: "Superstore",
        count: 1,
        amount: 1,
        unit: Unit.kg,
        userId: "test-user-id",
      };

      const mockNewItem = {
        id: "1",
        createdAt: new Date("2025-03-01"),
        updatedAt: new Date("2025-03-01"),
        date: new Date("2025-03-01"),
        price: 5.99,
        isSale: false,
        groupId: "g1",
      };

      prismaMock.group.findFirst.mockResolvedValue(mockExistingGroup);
      prismaMock.item.create.mockResolvedValue(mockNewItem);

      await expect(addItem(item)).resolves.toEqual({
        id: "1",
        createdAt: new Date("2025-03-01"),
        updatedAt: new Date("2025-03-01"),
        date: new Date("2025-03-01"),
        isSale: false,
        price: 5.99,
        groupId: "g1",
      });

      expect(prismaMock.group.findFirst).toHaveBeenCalledWith({
        where: {
          name: item.name,
          brand: item.brand,
          store: item.store,
          count: item.count,
          amount: item.amount,
          unit: item.unit,
          userId: item.userId,
        },
      });
      expect(prismaMock.item.create).toHaveBeenCalledWith({
        data: {
          date: item.date,
          price: item.price,
          isSale: item.isSale,
          groupId: mockExistingGroup.id,
        },
      });
    });

    it("should create new group when item does not exist", async () => {
      const mockNewGroup = {
        id: "g1",
        createdAt: new Date("2025-03-01"),
        updatedAt: new Date("2025-03-01"),
        name: "oats",
        brand: "Quaker",
        store: "Superstore",
        count: 1,
        amount: 1,
        unit: Unit.kg,
        userId: "test-user-id",
      };

      prismaMock.group.findFirst.mockResolvedValue(null);
      prismaMock.group.create.mockResolvedValue(mockNewGroup);

      await expect(addItem(item)).resolves.toEqual(mockNewGroup);

      expect(prismaMock.group.create).toHaveBeenCalledWith({
        data: {
          name: item.name,
          brand: item.brand,
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
    });

    it("should propagate errors from database operations", async () => {
      prismaMock.group.findFirst.mockRejectedValue(new Error("Database error"));

      await expect(addItem(item)).rejects.toThrow("Database error");
    });

    it("should normalize empty brand string to null", async () => {
      const mockNewGroup = {
        id: "g1",
        createdAt: new Date("2025-03-01"),
        updatedAt: new Date("2025-03-01"),
        name: "oats",
        brand: null,
        store: "Superstore",
        count: 1,
        amount: 1,
        unit: Unit.kg,
        userId: "test-user-id",
      };

      prismaMock.group.findFirst.mockResolvedValue(null);
      prismaMock.group.create.mockResolvedValue(mockNewGroup);

      const itemWithNullBrand = {
        ...item,
        brand: "",
      };

      await addItem(itemWithNullBrand);

      expect(prismaMock.group.create).toHaveBeenCalledWith({
        data: {
          name: item.name,
          brand: null,
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
    });
  });

  describe("editGroup", () => {
    const validGroupData = {
      name: "oats",
      brand: "Quaker",
      store: "Superstore",
      count: 1,
      amount: 1,
      unit: Unit.kg,
    };

    const validGroupId = "test-group-id";

    const mockFoundGroup = {
      id: "test-group-id",
      userId: "test-user-id",
      name: "oats",
      brand: "Quaker",
      store: "Superstore",
      count: 1,
      amount: 1,
      unit: Unit.kg,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should throw error when user doesn't own group (authorization check)", async () => {
      // unauthorized
      prismaMock.group.findFirst.mockResolvedValue(null);

      await expect(editGroup(validGroupData, validGroupId)).rejects.toThrow(
        "You don't have permission to edit this group"
      );
      expect(prismaMock.group.update).not.toHaveBeenCalled();
    });

    it("should update group when user is authorized", async () => {
      // authorized
      prismaMock.group.findFirst.mockResolvedValue(mockFoundGroup);

      await editGroup(validGroupData, validGroupId);

      expect(prismaMock.group.update).toHaveBeenCalledWith({
        where: { id: validGroupId },
        data: {
          name: validGroupData.name,
          brand: validGroupData.brand,
          store: validGroupData.store,
          count: validGroupData.count,
          amount: validGroupData.amount,
          unit: validGroupData.unit,
        },
      });
    });

    it("should propagate errors from database operations", async () => {
      // authorized
      prismaMock.group.findFirst.mockResolvedValue(mockFoundGroup);

      prismaMock.group.update.mockRejectedValue(new Error("Database error"));

      await expect(editGroup(validGroupData, validGroupId)).rejects.toThrow(
        "Database error"
      );
    });

    it("should normalize empty brand string to null", async () => {
      // authorized
      prismaMock.group.findFirst.mockResolvedValue(mockFoundGroup);

      const groupWithNullBrand = {
        ...validGroupData,
        brand: "",
      };

      await editGroup(groupWithNullBrand, validGroupId);

      expect(prismaMock.group.update).toHaveBeenCalledWith({
        where: { id: validGroupId },
        data: {
          name: validGroupData.name,
          brand: null,
          store: validGroupData.store,
          count: validGroupData.count,
          amount: validGroupData.amount,
          unit: validGroupData.unit,
        },
      });
    });
  });
});
