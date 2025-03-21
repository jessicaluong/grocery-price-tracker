import { addItem, editGroup, editItem } from "@/data-access/item-repository";
import { prismaMock } from "../../test/prisma-mock";
import { Unit } from "@prisma/client";
import { verifySession } from "@/lib/auth";
import { AuthorizationError, DuplicateGroupError } from "@/lib/customErrors";

jest.mock("@/lib/auth", () => ({
  verifySession: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

describe("Item Repository", () => {
  const userId = "test-user-id";

  beforeEach(() => {
    (verifySession as jest.Mock).mockResolvedValue({ userId });
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

  describe("editItem", () => {
    const validItemId = "test-item-id";

    const validItemData = {
      date: new Date("2025-03-01"),
      price: 5.99,
      isSale: true,
    };

    const mockFoundItem = {
      date: new Date("2025-03-01"),
      price: 5.99,
      isSale: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      id: validItemId,
      groupId: "test-group-id",
    };

    it("should throw AuthorizationError when user doesn't own item", async () => {
      prismaMock.item.findFirst.mockResolvedValue(null); // unauthorized

      await expect(editItem(validItemData, validItemId)).rejects.toThrow(
        AuthorizationError
      );
      expect(prismaMock.group.update).not.toHaveBeenCalled();
    });

    it("should update group when user is authorized", async () => {
      prismaMock.item.findFirst.mockResolvedValue(mockFoundItem); // authorized

      await editItem(validItemData, validItemId);

      expect(prismaMock.item.update).toHaveBeenCalledWith({
        where: { id: validItemId },
        data: {
          date: validItemData.date,
          price: validItemData.price,
          isSale: validItemData.isSale,
        },
      });
    });

    it("should propagate errors from database operations", async () => {
      prismaMock.item.findFirst.mockResolvedValue(mockFoundItem); // authorized

      prismaMock.item.update.mockRejectedValue(new Error("Database error"));

      await expect(editItem(validItemData, validItemId)).rejects.toThrow(
        "Database error"
      );
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

    it("should throw AuthorizationError when user doesn't own group", async () => {
      prismaMock.group.findFirst.mockResolvedValue(null); // unauthorized

      await expect(editGroup(validGroupData, validGroupId)).rejects.toThrow(
        AuthorizationError
      );
      expect(prismaMock.group.update).not.toHaveBeenCalled();
    });

    it("should update group when user is authorized", async () => {
      prismaMock.group.findFirst
        .mockResolvedValueOnce(mockFoundGroup) // authorized
        .mockResolvedValueOnce(null); // no duplicate groups

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

    it("should throw DuplicateGroupError when a duplicate group exists", async () => {
      const mockExistingGroup = {
        ...mockFoundGroup,
        id: "test-group-id-2",
      };

      prismaMock.group.findFirst
        .mockResolvedValue(mockFoundGroup) // authorized
        .mockResolvedValue(mockExistingGroup); // duplicate exists

      await expect(editGroup(validGroupData, validGroupId)).rejects.toThrow(
        DuplicateGroupError
      );

      expect(prismaMock.group.update).not.toHaveBeenCalled();
    });

    it("should throw DuplicateGroupError for duplicate groups with null brands", async () => {
      const mockFoundGroupWithNullBrand = {
        ...mockFoundGroup,
        brand: null,
      };

      const mockSecondGroupWithNullBrand = {
        ...mockFoundGroup,
        brand: null,
        id: "test-group-id-2",
      };

      const groupDataNullBrand = {
        ...validGroupData,
        brand: null,
      };

      prismaMock.group.findFirst
        .mockResolvedValue(mockFoundGroupWithNullBrand) // authorization
        .mockResolvedValue(mockSecondGroupWithNullBrand); // duplicate exists

      await expect(editGroup(groupDataNullBrand, validGroupId)).rejects.toThrow(
        DuplicateGroupError
      );

      expect(prismaMock.group.update).not.toHaveBeenCalled();
    });

    it("should propagate errors from database operations", async () => {
      prismaMock.group.findFirst
        .mockResolvedValueOnce(mockFoundGroup) // authorized
        .mockResolvedValueOnce(null); // no duplicate group

      prismaMock.group.update.mockRejectedValue(new Error("Database error"));

      await expect(editGroup(validGroupData, validGroupId)).rejects.toThrow(
        "Database error"
      );
    });

    it("should normalize empty brand string to null", async () => {
      prismaMock.group.findFirst
        .mockResolvedValueOnce(mockFoundGroup) // authorized
        .mockResolvedValueOnce(null); // no duplicate group

      const groupWithEmptyStringBrand = {
        ...validGroupData,
        brand: "",
      };

      await editGroup(groupWithEmptyStringBrand, validGroupId);

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
