export type ReceiptItem = {
  name: string | null;
  price: number | null;
  amount: number | null;
  unit: string | null;
  isSale: boolean;
  brand: string | null; // not extracted from receipt
  count: number | null; // not extracted from receipt
};

export type ReceiptData = {
  store: string | null;
  date: Date | null;
  items: ReceiptItem[];
};
