export type DateRange = {
  start: Date | null;
  end: Date | null;
};

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
