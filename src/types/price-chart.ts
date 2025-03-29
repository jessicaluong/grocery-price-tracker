export type DateRange = {
  start: Date | null;
  end: Date | null;
};

// export const TIME_FRAMES = [
//   { value: "1m", label: "1 Month" }, // x-axis is day (time frame is from beginning to end of that month)
//   { value: "3m", label: "3 Months" }, // x-axis is months
//   { value: "6m", label: "6 Months" }, // x-axis is months
//   { value: "1y", label: "Year" }, // x-axis is months (format as letter or number?)
//   { value: "all", label: "All Time" }, // x-axis is year only
// ];

export const TimeFrameValue = {
  ONE_MONTH: "1m",
  THREE_MONTHS: "3m",
  SIX_MONTHS: "6m",
  ONE_YEAR: "y",
  ALL_TIME: "all",
} as const;

export type TimeFrame = (typeof TimeFrameValue)[keyof typeof TimeFrameValue];

export const TIME_FRAMES = [
  { value: TimeFrameValue.ONE_MONTH, label: "1M" },
  { value: TimeFrameValue.THREE_MONTHS, label: "3M" },
  { value: TimeFrameValue.SIX_MONTHS, label: "6M" },
  { value: TimeFrameValue.ONE_YEAR, label: "Y" },
  { value: TimeFrameValue.ALL_TIME, label: "All" },
];
