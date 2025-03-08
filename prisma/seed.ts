import prisma from "../src/lib/db";
import { Prisma } from "@prisma/client";
import * as bcrypt from "bcrypt";

async function createUser(email: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      email: email,
      hashedPassword,
    },
  });
}

type GroupCreateInput = Omit<Prisma.GroupCreateInput, "items" | "user">;
type ItemCreateInput = Omit<Prisma.ItemCreateInput, "group" | "groupId">;

type CreateGroupWithItemsInput = GroupCreateInput & {
  prices: Array<ItemCreateInput>;
};

const groupsWithItems: CreateGroupWithItemsInput[] = [
  {
    name: "oats",
    brand: "Quaker",
    store: "Superstore",
    count: 1,
    amount: 1,
    unit: "kg",
    prices: [
      { price: 4.27, isSale: true, date: new Date("2024-09-14") },
      { price: 5.99, isSale: true, date: new Date("2024-09-16") },
    ],
  },
  {
    name: "oats",
    brand: "Quaker",
    store: "Superstore",
    count: 1,
    amount: 1.5,
    unit: "kg",
    prices: [{ price: 12.99, isSale: true, date: new Date("2024-09-12") }],
  },
  {
    name: "oats",
    brand: "Quaker",
    store: "Walmart",
    count: 1,
    amount: 1,
    unit: "kg",
    prices: [{ price: 6.99, isSale: true, date: new Date("2024-09-17") }],
  },
  {
    name: "organic oats",
    brand: "Quaker",
    store: "T&T",
    count: 1,
    amount: 1,
    unit: "kg",
    prices: [{ price: 25.1, isSale: false, date: new Date("2024-09-12") }],
  },
  {
    name: "orange juice",
    brand: "Tropicana",
    store: "Walmart",
    count: 1,
    amount: 100,
    unit: "mL",
    prices: [
      { price: 4, isSale: true, date: new Date("2024-09-15") },
      { price: 4.99, isSale: false, date: new Date("2024-01-01") },
      { price: 3.99, isSale: true, date: new Date("2024-01-15") },
      { price: 4.99, isSale: false, date: new Date("2024-02-01") },
      { price: 5.49, isSale: false, date: new Date("2024-02-15") },
    ],
  },
  {
    name: "orange juice",
    brand: "simply orange",
    store: "Superstore",
    count: 1,
    amount: 250,
    unit: "mL",
    prices: [{ price: 2.5, isSale: false, date: new Date("2024-09-12") }],
  },
  {
    name: "lemon juice",
    brand: "simply orange",
    store: "Superstore",
    count: 1,
    amount: 1,
    unit: "L",
    prices: [{ price: 5.99, isSale: false, date: new Date("2024-09-12") }],
  },
  {
    name: "milk",
    brand: "Natrel",
    store: "Costco",
    count: 1,
    amount: 3.5,
    unit: "L",
    prices: [{ price: 6.99, isSale: false, date: new Date("2024-09-12") }],
  },
  {
    name: "toothbrushes",
    brand: "Oral-B",
    store: "Costco",
    count: 1,
    amount: 8,
    unit: "units",
    prices: [{ price: 12.99, isSale: true, date: new Date("2024-09-12") }],
  },
  {
    name: "paper towel",
    brand: "Bounty",
    store: "Costco",
    count: 12,
    amount: 86,
    unit: "sheets",
    prices: [{ price: 22.49, isSale: true, date: new Date("2024-09-12") }],
  },
  {
    name: "vitamin D3",
    brand: "Webbers",
    store: "Costco",
    count: 1,
    amount: 300,
    unit: "units",
    prices: [{ price: 22.49, isSale: false, date: new Date("2024-09-12") }],
  },
  {
    name: "laundry detergent",
    brand: "Tide",
    store: "Costco",
    count: 1,
    amount: 89,
    unit: "washloads",
    prices: [{ price: 22.49, isSale: false, date: new Date("2024-09-12") }],
  },
  {
    name: "toothpaste",
    brand: "Crest",
    store: "Costco",
    count: 5,
    amount: 135,
    unit: "mL",
    prices: [{ price: 14.49, isSale: true, date: new Date("2024-09-12") }],
  },
  {
    name: "bok choy",
    brand: null,
    store: "PriceSmart",
    count: 1,
    amount: 1.5,
    unit: "kg",
    prices: [{ price: 5, isSale: true, date: new Date("2024-09-13") }],
  },
  {
    name: "orange juice",
    brand: "Tropicana",
    store: "Costco",
    count: 2,
    amount: 1.89,
    unit: "L",
    prices: [
      { price: 8.99, isSale: false, date: new Date("2024-01-01") },
      { price: 6.99, isSale: true, date: new Date("2024-01-20") },
      { price: 8.99, isSale: false, date: new Date("2024-02-05") },
    ],
  },
  {
    name: "toilet paper",
    brand: "Charmin",
    store: "Walmart",
    count: 12,
    amount: 1,
    unit: "units",
    prices: [
      { price: 14.99, isSale: false, date: new Date("2024-01-01") },
      { price: 12.99, isSale: true, date: new Date("2024-01-25") },
      { price: 14.99, isSale: false, date: new Date("2024-02-10") },
      { price: 15.99, isSale: false, date: new Date("2024-02-20") },
    ],
  },
  {
    name: "bananas",
    brand: null,
    store: "Walmart",
    count: 1,
    amount: 1,
    unit: "kg",
    prices: [
      { price: 1.99, isSale: false, date: new Date("2024-01-05") },
      { price: 1.79, isSale: true, date: new Date("2024-01-20") },
      { price: 1.99, isSale: false, date: new Date("2024-02-05") },
      { price: 2.29, isSale: false, date: new Date("2024-02-25") },
    ],
  },
];

async function createGroupWithItems(
  userId: string,
  { name, brand, store, count, amount, unit, prices }: CreateGroupWithItemsInput
) {
  const group = await prisma.group.create({
    data: {
      name,
      brand,
      store,
      count,
      amount,
      unit,
      userId,
      items: {
        create: prices.map(({ price, isSale, date }) => ({
          price,
          isSale,
          date,
        })),
      },
    },
  });
  return group;
}

async function main() {
  await prisma.item.deleteMany({});
  await prisma.group.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.verificationRequest.deleteMany({});
  await prisma.user.deleteMany({});

  const user = createUser("test@gmail.com", "password123");

  for (const groupData of groupsWithItems) {
    await createGroupWithItems((await user).id, groupData);
  }
  console.log(`Created ${groupsWithItems.length} groups with their items`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
