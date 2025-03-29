export type DateRange = {
  start: Date | null;
  end: Date | null;
};

export const TimeFrameValue = {
  ONE_MONTH: "1m",
  THREE_MONTHS: "3m",
  SIX_MONTHS: "6m",
  ONE_YEAR: "1y",
  ALL_TIME: "all",
} as const;

export type TimeFrame = (typeof TimeFrameValue)[keyof typeof TimeFrameValue];

export const TIME_FRAMES = [
  { value: TimeFrameValue.ONE_MONTH, label: "1 Month" },
  { value: TimeFrameValue.THREE_MONTHS, label: "3 Months" },
  { value: TimeFrameValue.SIX_MONTHS, label: "6 Months" },
  { value: TimeFrameValue.ONE_YEAR, label: "Year" },
  { value: TimeFrameValue.ALL_TIME, label: "All Time" },
];
