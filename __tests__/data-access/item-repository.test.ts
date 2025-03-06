import { addItem } from "@/data-access/item-repository";
import { prismaMock } from "../../test/prisma-mock";
import { Unit } from "@prisma/client";

describe("Item Repository", () => {
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
