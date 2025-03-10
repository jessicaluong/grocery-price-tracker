import { addItem } from "@/data-access/item-repository";
import { prismaMock } from "../../test/prisma-mock";
import { Unit } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: jest.fn(),
}));

describe("Item Repository", () => {
  const mockSession = {
    user: { id: "test-user-id", email: "test@example.com" },
  };

  beforeEach(() => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
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

    it("should redirect to login when user is not authenticated", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      await addItem(item);

      expect(redirect).toHaveBeenCalledWith("/login");
    });

    it("should throw error when user tries to add item for another user", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: "different-user", email: "different@example.com" },
      });

      await expect(addItem(item)).rejects.toThrow(
        "Unauthorized access to items"
      );

      expect(prismaMock.group.findFirst).not.toHaveBeenCalled();
      expect(prismaMock.group.create).not.toHaveBeenCalled();
      expect(prismaMock.item.create).not.toHaveBeenCalled();
    });

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
});
