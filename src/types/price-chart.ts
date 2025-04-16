export const TimeFrameValue = {
  ONE_MONTH: "1m",
  THREE_MONTHS: "3m",
  ONE_YEAR: "y",
  ALL_TIME: "all",
} as const;

export type TimeFrame = (typeof TimeFrameValue)[keyof typeof TimeFrameValue];

export const TIME_FRAMES = [
  { value: TimeFrameValue.ONE_MONTH, label: "1M" },
  { value: TimeFrameValue.THREE_MONTHS, label: "3M" },
  { value: TimeFrameValue.ONE_YEAR, label: "Y" },
  { value: TimeFrameValue.ALL_TIME, label: "All" },
];

export type ChartDataPoint = {
  date: string;
  dateEnd?: string;
  xAxisLabel: string | number;
  price: number | null;
  saleCount: number | null;
  count: number | null;
  avgSalePrice: number | null;
  avgRegPrice: number | null;
};

export type AggregateEntry = {
  date?: Date;
  endDate?: Date;
  totalPrice: number;
  totalSalePrice: number;
  totalRegPrice: number;
  count: number;
  saleCount: number;
  regCount: number;
};

export type AggregationResult = {
  date?: Date;
  endDate?: Date;
  avgPrice: number;
  count: number;
  saleCount: number;
  regCount: number;
  avgSalePrice: number;
  avgRegPrice: number;
};
