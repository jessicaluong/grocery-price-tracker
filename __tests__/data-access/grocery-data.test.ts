import {
  addItem,
  addItemToGroup,
  addReceiptData,
  deleteGroup,
  deleteItem,
  editGroup,
  editItem,
} from "@/data-access/grocery-data";
import { prismaMock } from "../../test/prisma-mock";
import { verifySession } from "@/lib/auth";
import { AuthorizationError, DuplicateGroupError } from "@/lib/customErrors";
import { UnitEnum } from "@/types/grocery";

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
      unit: UnitEnum.kg,
      price: 5.99,
      date: new Date("2025-03-01"),
      isSale: false,
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
        unit: UnitEnum.kg,
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

      await addItem(item);

      expect(prismaMock.group.findFirst).toHaveBeenCalledWith({
        where: {
          name: item.name,
          brand: item.brand,
          store: item.store,
          count: item.count,
          amount: item.amount,
          unit: item.unit,
          userId,
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
        unit: UnitEnum.kg,
        userId: "test-user-id",
      };

      prismaMock.group.findFirst.mockResolvedValue(null);
      prismaMock.group.create.mockResolvedValue(mockNewGroup);

      await addItem(item);

      expect(prismaMock.group.create).toHaveBeenCalledWith({
        data: {
          name: item.name,
          brand: item.brand,
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
        unit: UnitEnum.kg,
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
    });
  });

  describe("addReceiptData", () => {
    const mockReceiptData = {
      store: "Superstore",
      date: new Date("2025-03-01"),
      items: [
        {
          name: "Oats",
          brand: "Quaker",
          count: 1,
          amount: 1,
          unit: UnitEnum.kg,
          price: 5.99,
          isSale: false,
        },
        {
          name: "Yogurt",
          brand: "Danone",
          count: 1,
          amount: 2,
          unit: UnitEnum.kg,
          price: 8.99,
          isSale: false,
        },
        {
          name: "Milk",
          brand: "Dairyland",
          count: 2,
          amount: 2,
          unit: UnitEnum.L,
          price: 11,
          isSale: true,
        },
      ],
    };

    const mockTxClient = {
      group: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({}),
      },
      item: {
        create: jest.fn().mockResolvedValue({}),
      },
    };

    beforeEach(() => {
      prismaMock.$transaction.mockImplementation((callback: any) =>
        callback(mockTxClient)
      );
    });

    it("should use a transaction for all database operations", async () => {
      await addReceiptData(mockReceiptData);

      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    });

    it("should process each item in the receipt", async () => {
      await addReceiptData(mockReceiptData);

      expect(mockTxClient.group.findFirst).toHaveBeenCalledTimes(
        mockReceiptData.items.length
      );
    });

    it("should add items to existing groups when they match", async () => {
      // mock all groups exist
      (mockTxClient.group.findFirst as jest.Mock).mockResolvedValue({
        id: "existing-group-id",
      });

      await addReceiptData(mockReceiptData);

      // should create item for each receipt item
      expect(mockTxClient.item.create).toHaveBeenCalledTimes(
        mockReceiptData.items.length
      );
      expect(mockTxClient.group.create).not.toHaveBeenCalled();

      // check one of the calls
      expect(mockTxClient.item.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            groupId: "existing-group-id",
          }),
        })
      );
    });

    it("should create new groups with items when no match is found", async () => {
      // mock no groups exist
      (mockTxClient.group.findFirst as jest.Mock).mockResolvedValue(null);

      await addReceiptData(mockReceiptData);

      // should create a group for each receipt item
      expect(mockTxClient.group.create).toHaveBeenCalledTimes(
        mockReceiptData.items.length
      );
      expect(mockTxClient.item.create).not.toHaveBeenCalled();

      // check one of the calls
      expect(mockTxClient.group.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: expect.any(String),
            store: mockReceiptData.store,
            userId: userId,
            items: expect.objectContaining({
              create: expect.objectContaining({
                date: expect.any(Date),
              }),
            }),
          }),
        })
      );
    });

    it("should handle a mix of existing and new groups", async () => {
      // mock first item has group
      (mockTxClient.group.findFirst as jest.Mock)
        .mockResolvedValueOnce({ id: "existing-group-id" })
        .mockResolvedValue(null);

      await addReceiptData(mockReceiptData);

      expect(mockTxClient.item.create).toHaveBeenCalledTimes(1);
      expect(mockTxClient.group.create).toHaveBeenCalledTimes(2);
    });

    it("should normalize empty brand strings to null", async () => {
      (mockTxClient.group.findFirst as jest.Mock).mockResolvedValue(null);

      const emptyBrandReceiptData = {
        store: "Superstore",
        date: new Date("2025-03-01"),
        items: [
          {
            name: "Apples",
            brand: "",
            count: 1,
            amount: 2,
            unit: UnitEnum.kg,
            price: 8.99,
            isSale: false,
          },
        ],
        total: 1.99,
      };

      await addReceiptData(emptyBrandReceiptData);

      expect(mockTxClient.group.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            brand: null,
          }),
        })
      );
    });

    it("should propagate database errors", async () => {
      const mockError = new Error("Database error");
      (mockTxClient.group.findFirst as jest.Mock).mockRejectedValue(mockError);

      await expect(addReceiptData(mockReceiptData)).rejects.toThrow(
        "Database error"
      );
    });

    it("should abort the transaction if any operation fails", async () => {
      const mockError = new Error("Operation failed");

      (mockTxClient.group.findFirst as jest.Mock)
        .mockResolvedValueOnce({ id: "existing-group-id" })
        .mockRejectedValueOnce(mockError);

      (prismaMock.$transaction as jest.Mock).mockImplementation(
        async (callback) => {
          try {
            return await callback(mockTxClient);
          } catch (error) {
            throw error;
          }
        }
      );

      await expect(addReceiptData(mockReceiptData)).rejects.toThrow(
        "Operation failed"
      );
    });
  });

  describe("deleteItem", () => {
    const validItemId = "test-item-id";

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

      await expect(deleteItem(validItemId)).rejects.toThrow(AuthorizationError);
      expect(prismaMock.item.delete).not.toHaveBeenCalled();
    });

    it("should delete item when user is authorized", async () => {
      prismaMock.item.findFirst.mockResolvedValue(mockFoundItem); // authorized

      await deleteItem(validItemId);

      expect(prismaMock.item.delete).toHaveBeenCalledWith({
        where: { id: validItemId },
      });
    });

    it("should propagate errors from database operations", async () => {
      prismaMock.item.findFirst.mockResolvedValue(mockFoundItem); // authorized

      prismaMock.item.delete.mockRejectedValue(new Error("Database error"));

      await expect(deleteItem(validItemId)).rejects.toThrow("Database error");
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

  describe("addItemToGroup", () => {
    const validGroupId = "test-group-id";

    const validItemData = {
      date: new Date("2025-03-01"),
      price: 5.99,
      isSale: true,
    };

    const mockFoundGroup = {
      id: "test-group-id",
      userId: "test-user-id",
      name: "oats",
      brand: "Quaker",
      store: "Superstore",
      count: 1,
      amount: 1,
      unit: UnitEnum.kg,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should throw AuthorizationError when user doesn't own group", async () => {
      prismaMock.group.findFirst.mockResolvedValue(null); // unauthorized

      await expect(addItemToGroup(validItemData, validGroupId)).rejects.toThrow(
        AuthorizationError
      );

      expect(prismaMock.item.create).not.toHaveBeenCalled();
    });

    it("should add item to group when user is authorized", async () => {
      prismaMock.group.findFirst.mockResolvedValue(mockFoundGroup); // authorized

      await addItemToGroup(validItemData, validGroupId);

      expect(prismaMock.item.create).toHaveBeenCalledWith({
        data: {
          date: validItemData.date,
          price: validItemData.price,
          isSale: validItemData.isSale,
          groupId: validGroupId,
        },
      });
    });

    it("should propagate errors from database operations", async () => {
      prismaMock.group.findFirst.mockResolvedValue(mockFoundGroup); // authorized

      prismaMock.item.create.mockRejectedValue(new Error("Database error"));

      await expect(addItemToGroup(validItemData, validGroupId)).rejects.toThrow(
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
      unit: UnitEnum.kg,
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
      unit: UnitEnum.kg,
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

  describe("deleteGroup", () => {
    const validGroupId = "test-group-id";

    const mockFoundGroup = {
      id: "test-group-id",
      userId: "test-user-id",
      name: "oats",
      brand: "Quaker",
      store: "Superstore",
      count: 1,
      amount: 1,
      unit: UnitEnum.kg,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should throw AuthorizationError when user doesn't own group", async () => {
      prismaMock.group.findFirst.mockResolvedValue(null); // unauthorized

      await expect(deleteGroup(validGroupId)).rejects.toThrow(
        AuthorizationError
      );
      expect(prismaMock.group.delete).not.toHaveBeenCalled();
    });

    it("should delete item when user is authorized", async () => {
      prismaMock.group.findFirst.mockResolvedValue(mockFoundGroup); // authorized

      await deleteGroup(validGroupId);

      expect(prismaMock.group.delete).toHaveBeenCalledWith({
        where: { id: validGroupId },
      });
    });

    it("should propagate errors from database operations", async () => {
      prismaMock.group.findFirst.mockResolvedValue(mockFoundGroup); // authorized

      prismaMock.group.delete.mockRejectedValue(new Error("Database error"));

      await expect(deleteGroup(validGroupId)).rejects.toThrow("Database error");
    });
  });
});
