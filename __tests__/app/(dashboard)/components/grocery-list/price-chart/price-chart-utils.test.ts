import {
  aggregateData,
  checkCanNavigateNext,
  checkCanNavigatePrev,
  generateDailyIntervals,
  generateMonthlyIntervals,
  generateWeeklyIntervals,
  getDateRange,
  getDayKey,
  getEndOfMonth,
  getEndOfWeek,
  getEquivalentDateForTimeFrame,
  getMonthKey,
  getNextDate,
  getPrevDate,
  getStartOfWeek,
  getWeekKey,
  hasDataInRange,
} from "@/app/(dashboard)/groceries/components/grocery-list/price-chart/price-chart-utils";
import { PricePoint } from "@/types/grocery";

describe("PriceChartUtils", () => {
  describe("Key Generation Functions", () => {
    it("getMonthKey should generate correct month keys", () => {
      expect(getMonthKey(new Date("Mar 15, 2024"))).toBe("2024-03");
      expect(getMonthKey(new Date("Dec 1, 2024"))).toBe("2024-12");
      expect(getMonthKey(new Date("Jan 31, 2025"))).toBe("2025-01");
    });

    it("getWeekKey should generate correct week keys", () => {
      // March 15, 2024 is a Friday, so week starts on March 10 (Sunday)
      expect(getWeekKey(new Date("Mar 15, 2024"))).toBe("2024-03-10");

      // April 1, 2024 is a Monday, so week starts on March 31 (Sunday)
      expect(getWeekKey(new Date("Apr 1, 2024"))).toBe("2024-03-31");
    });

    it("getDayKey should generate correct day keys", () => {
      expect(getDayKey(new Date("Mar 15, 2024"))).toBe("2024-03-15");
      expect(getDayKey(new Date("Apr 1, 2024"))).toBe("2024-04-01");
    });
  });

  describe("aggregateData", () => {
    describe("y and all time frame aggregation", () => {
      it("should aggregate data by month for year time frame", () => {
        const data: PricePoint[] = [
          {
            id: "1",
            date: new Date("Apr 10, 2024"),
            price: 10.99,
            isSale: false,
          },
          {
            id: "2",
            date: new Date("Apr 15, 2024"),
            price: 9.99,
            isSale: true,
          },
          {
            id: "3",
            date: new Date("Apr 20, 2024"),
            price: 11.99,
            isSale: false,
          },
          {
            id: "4",
            date: new Date("May 5, 2024"),
            price: 12.99,
            isSale: false,
          },
          {
            id: "5",
            date: new Date("May 10, 2024"),
            price: 8.99,
            isSale: true,
          },
        ];

        const result = aggregateData(data, "y");

        // Should have two entries (Apr and May)
        expect(result.size).toBe(2);

        // April Data
        const aprKey = "2024-04";
        const aprData = result.get(aprKey);
        expect(aprData).toBeDefined();
        expect(aprData.count).toBe(3);
        expect(aprData.saleCount).toBe(1);
        expect(aprData.regCount).toBe(2);
        expect(aprData.avgPrice).toBeCloseTo((10.99 + 9.99 + 11.99) / 3, 2);
        expect(aprData.avgSalePrice).toBeCloseTo(9.99, 2);
        expect(aprData.avgRegPrice).toBeCloseTo((10.99 + 11.99) / 2, 2);

        // May Data
        const mayKey = "2024-05";
        const mayData = result.get(mayKey);
        expect(mayData).toBeDefined();
        expect(mayData.count).toBe(2);
        expect(mayData.saleCount).toBe(1);
        expect(mayData.regCount).toBe(1);
        expect(mayData.avgPrice).toBeCloseTo((12.99 + 8.99) / 2, 2);
        expect(mayData.avgSalePrice).toBeCloseTo(8.99, 2);
        expect(mayData.avgRegPrice).toBeCloseTo(12.99, 2);
      });

      it("should handle all sale items for a month", () => {
        const data: PricePoint[] = [
          { id: "1", date: new Date("Jun 5, 2024"), price: 9.99, isSale: true },
          {
            id: "2",
            date: new Date("Jun 15, 2024"),
            price: 8.99,
            isSale: true,
          },
        ];

        const result = aggregateData(data, "y");

        const junKey = "2024-06";
        const junData = result.get(junKey);
        expect(junData).toBeDefined();
        expect(junData.count).toBe(2);
        expect(junData.saleCount).toBe(2);
        expect(junData.regCount).toBe(0);
        expect(junData.avgPrice).toBeCloseTo((9.99 + 8.99) / 2, 2);
        expect(junData.avgSalePrice).toBeCloseTo((9.99 + 8.99) / 2, 2);
        expect(junData.avgRegPrice).toBe(0);
      });

      it("should handle all regular items for a month", () => {
        const data: PricePoint[] = [
          {
            id: "1",
            date: new Date("Jul 3, 2024"),
            price: 12.99,
            isSale: false,
          },
          {
            id: "2",
            date: new Date("Jul 20, 2024"),
            price: 13.99,
            isSale: false,
          },
        ];

        const result = aggregateData(data, "y");

        const julKey = "2024-07";
        const julData = result.get(julKey);
        expect(julData).toBeDefined();
        expect(julData.count).toBe(2);
        expect(julData.saleCount).toBe(0);
        expect(julData.regCount).toBe(2);
        expect(julData.avgPrice).toBeCloseTo((12.99 + 13.99) / 2, 2);
        expect(julData.avgSalePrice).toBe(0);
        expect(julData.avgRegPrice).toBeCloseTo((12.99 + 13.99) / 2, 2);
      });
    });

    describe("3m time frame aggregation", () => {
      it("should aggregate data by week for 3m time frame", () => {
        // Two entries in week of May 5, 2024 (starts on May 5, Sunday)
        // One entry in week of May 12, 2024 (starts on May 12, Sunday)
        const data: PricePoint[] = [
          {
            id: "1",
            date: new Date("May 6, 2024"), // Monday
            price: 10.99,
            isSale: false,
          },
          {
            id: "2",
            date: new Date("May 8, 2024"), // Wednesday (same week)
            price: 9.99,
            isSale: true,
          },
          {
            id: "3",
            date: new Date("May 15, 2024"), // Wednesday (next week)
            price: 12.99,
            isSale: false,
          },
        ];

        const result = aggregateData(data, "3m");

        // Should have two entries (two weeks)
        expect(result.size).toBe(2);

        // Week starting May 5
        const week1Key = "2024-05-05";
        const week1Data = result.get(week1Key);
        expect(week1Data).toBeDefined();
        expect(week1Data.count).toBe(2);
        expect(week1Data.saleCount).toBe(1);
        expect(week1Data.regCount).toBe(1);
        expect(week1Data.avgPrice).toBeCloseTo((10.99 + 9.99) / 2, 2);
        expect(week1Data.avgSalePrice).toBeCloseTo(9.99, 2);
        expect(week1Data.avgRegPrice).toBeCloseTo(10.99, 2);
        expect(week1Data.date).toEqual(getStartOfWeek(new Date("May 6, 2024")));
        expect(week1Data.endDate).toEqual(
          getEndOfWeek(new Date("May 6, 2024"))
        );

        // Week starting May 12
        const week2Key = "2024-05-12";
        const week2Data = result.get(week2Key);
        expect(week2Data).toBeDefined();
        expect(week2Data.count).toBe(1);
        expect(week2Data.saleCount).toBe(0);
        expect(week2Data.regCount).toBe(1);
        expect(week2Data.avgPrice).toBeCloseTo(12.99, 2);
        expect(week2Data.avgSalePrice).toBe(0);
        expect(week2Data.avgRegPrice).toBeCloseTo(12.99, 2);
        expect(week2Data.date).toEqual(
          getStartOfWeek(new Date("May 15, 2024"))
        );
        expect(week2Data.endDate).toEqual(
          getEndOfWeek(new Date("May 15, 2024"))
        );
      });
    });

    describe("1m time frame aggregation", () => {
      it("should aggregate data by day for 1m time frame", () => {
        const data: PricePoint[] = [
          {
            id: "1",
            date: new Date("Mar 10, 2024"),
            price: 10.99,
            isSale: false,
          },
          {
            id: "2",
            date: new Date("Mar 10, 2024"),
            price: 9.99,
            isSale: true,
          },
          {
            id: "3",
            date: new Date("Mar 15, 2024"),
            price: 12.99,
            isSale: false,
          },
        ];

        const result = aggregateData(data, "1m");

        // Should have two entries (two days)
        expect(result.size).toBe(2);

        // March 10
        const day1Key = "2024-03-10";
        const day1Data = result.get(day1Key);
        expect(day1Data).toBeDefined();
        expect(day1Data.count).toBe(2);
        expect(day1Data.saleCount).toBe(1);
        expect(day1Data.regCount).toBe(1);
        expect(day1Data.avgPrice).toBeCloseTo((10.99 + 9.99) / 2, 2);
        expect(day1Data.avgSalePrice).toBeCloseTo(9.99, 2);
        expect(day1Data.avgRegPrice).toBeCloseTo(10.99, 2);
        expect(day1Data.date).toEqual(new Date("Mar 10, 2024"));

        // March 15
        const day2Key = "2024-03-15";
        const day2Data = result.get(day2Key);
        expect(day2Data).toBeDefined();
        expect(day2Data.count).toBe(1);
        expect(day2Data.saleCount).toBe(0);
        expect(day2Data.regCount).toBe(1);
        expect(day2Data.avgPrice).toBeCloseTo(12.99, 2);
        expect(day2Data.avgSalePrice).toBe(0);
        expect(day2Data.avgRegPrice).toBeCloseTo(12.99, 2);
        expect(day2Data.date).toEqual(new Date("Mar 15, 2024"));
      });

      it("should handle multiple items on the same day", () => {
        const data: PricePoint[] = [
          {
            id: "1",
            date: new Date("Jun 20, 2024"),
            price: 10.99,
            isSale: false,
          },
          {
            id: "2",
            date: new Date("Jun 20, 2024"),
            price: 9.99,
            isSale: true,
          },
          {
            id: "3",
            date: new Date("Jun 20, 2024"),
            price: 8.99,
            isSale: true,
          },

          {
            id: "4",
            date: new Date("Jun 20, 2024"),
            price: 11.99,
            isSale: false,
          },
        ];

        const result = aggregateData(data, "1m");

        // Should have one entry (one day)
        expect(result.size).toBe(1);

        const dayKey = "2024-06-20";
        const dayData = result.get(dayKey);
        expect(dayData).toBeDefined();
        expect(dayData.count).toBe(4);
        expect(dayData.saleCount).toBe(2);
        expect(dayData.regCount).toBe(2);
        expect(dayData.avgPrice).toBeCloseTo(
          (10.99 + 9.99 + 8.99 + 11.99) / 4,
          2
        );
        expect(dayData.avgSalePrice).toBeCloseTo((9.99 + 8.99) / 2, 2);
        expect(dayData.avgRegPrice).toBeCloseTo((10.99 + 11.99) / 2, 2);
        expect(dayData.date).toEqual(new Date("Jun 20, 2024"));
      });
    });

    it("should handle empty data correctly", () => {
      const result = aggregateData([], "y");
      expect(result.size).toBe(0);
    });
  });

  describe("Interval Generation Functions", () => {
    describe("generateMonthlyIntervals", () => {
      it("should generate correct monthly intervals within the same year", () => {
        const startDate = new Date("Mar 15, 2024");
        const endDate = new Date("Jul 20, 2024");

        const { intervals, hasJanuary } = generateMonthlyIntervals(
          startDate,
          endDate
        );

        expect(intervals.length).toBe(5);
        expect(intervals[0]).toEqual(new Date("Mar 1, 2024"));
        expect(intervals[1]).toEqual(new Date("Apr 1, 2024"));
        expect(intervals[2]).toEqual(new Date("May 1, 2024"));
        expect(intervals[3]).toEqual(new Date("Jun 1, 2024"));
        expect(intervals[4]).toEqual(new Date("Jul 1, 2024"));

        expect(hasJanuary).toBe(false);
      });

      it("should generate correct monthly intervals across multiple years", () => {
        const startDate = new Date("Nov 10, 2023");
        const endDate = new Date("Feb 20, 2024");

        const { intervals, hasJanuary } = generateMonthlyIntervals(
          startDate,
          endDate
        );

        expect(intervals.length).toBe(4);
        expect(intervals[0]).toEqual(new Date("Nov 1, 2023"));
        expect(intervals[1]).toEqual(new Date("Dec 1, 2023"));
        expect(intervals[2]).toEqual(new Date("Jan 1, 2024"));
        expect(intervals[3]).toEqual(new Date("Feb 1, 2024"));

        expect(hasJanuary).toBe(true);
      });

      it("should handle case when start and end dates are in the same month", () => {
        const startDate = new Date("May 5, 2024");
        const endDate = new Date("May 25, 2024");

        const { intervals, hasJanuary } = generateMonthlyIntervals(
          startDate,
          endDate
        );

        expect(intervals.length).toBe(1);
        expect(intervals[0]).toEqual(new Date("May 1, 2024"));

        expect(hasJanuary).toBe(false);
      });

      it("should handle case spanning an entire year that includes January", () => {
        const startDate = new Date("Jan 1, 2024");
        const endDate = new Date("Dec 31, 2024");

        const { intervals, hasJanuary } = generateMonthlyIntervals(
          startDate,
          endDate
        );

        expect(intervals.length).toBe(12);
        expect(intervals[0]).toEqual(new Date("Jan 1, 2024"));
        expect(intervals[11]).toEqual(new Date("Dec 1, 2024"));

        expect(hasJanuary).toBe(true);
      });
    });

    describe("generateWeeklyIntervals", () => {
      it("should generate correct weekly intervals within the same month", () => {
        const startDate = new Date("May 5, 2024"); // A Sunday
        const endDate = new Date("May 25, 2024"); // A Saturday

        const { intervals } = generateWeeklyIntervals(startDate, endDate);

        expect(intervals.length).toBe(3);
        expect(intervals[0]).toEqual(new Date("May 5, 2024"));
        expect(intervals[1]).toEqual(new Date("May 12, 2024"));
        expect(intervals[2]).toEqual(new Date("May 19, 2024"));
      });

      it("should handle start dates that are not the beginning of the week", () => {
        const startDate = new Date("May 8, 2024"); // A Wednesday
        const endDate = new Date("May 29, 2024"); // A Wednesday

        const { intervals } = generateWeeklyIntervals(startDate, endDate);

        expect(intervals.length).toBe(4);
        expect(intervals[0]).toEqual(new Date("May 5, 2024"));
        expect(intervals[1]).toEqual(new Date("May 12, 2024"));
        expect(intervals[2]).toEqual(new Date("May 19, 2024"));
        expect(intervals[3]).toEqual(new Date("May 26, 2024"));
      });

      it("should generate correct weekly intervals across months", () => {
        const startDate = new Date("Apr 28, 2024"); // A Sunday
        const endDate = new Date("May 18, 2024"); // A Saturday

        const { intervals } = generateWeeklyIntervals(startDate, endDate);

        expect(intervals.length).toBe(3);
        expect(intervals[0]).toEqual(new Date("Apr 28, 2024"));
        expect(intervals[1]).toEqual(new Date("May 5, 2024"));
        expect(intervals[2]).toEqual(new Date("May 12, 2024"));
      });

      it("should handle case when start and end dates are in the same week", () => {
        const startDate = new Date("May 6, 2024"); // A Monday
        const endDate = new Date("May 9, 2024"); // A Thursday

        const { intervals } = generateWeeklyIntervals(startDate, endDate);

        expect(intervals.length).toBe(1);
        expect(intervals[0]).toEqual(new Date("May 5, 2024")); // Sunday of that week
      });
    });

    describe("generateDailyIntervals", () => {
      it("should generate daily intervals for the entire month", () => {
        const date = new Date("Feb 15, 2024"); // February 2024 (leap year - 29 days)

        const { intervals } = generateDailyIntervals(date);

        expect(intervals.length).toBe(29);
        expect(intervals[0]).toEqual(new Date("Feb 1, 2024"));
        expect(intervals[28]).toEqual(new Date("Feb 29, 2024"));
      });

      it("should handle months with 30 days", () => {
        const date = new Date("Apr 15, 2024"); // April has 30 days

        const { intervals } = generateDailyIntervals(date);

        expect(intervals.length).toBe(30);
        expect(intervals[0]).toEqual(new Date("Apr 1, 2024"));
        expect(intervals[29]).toEqual(new Date("Apr 30, 2024"));
      });

      it("should handle months with 31 days", () => {
        const date = new Date("May 15, 2024"); // May has 31 days

        const { intervals } = generateDailyIntervals(date);

        expect(intervals.length).toBe(31);
        expect(intervals[0]).toEqual(new Date("May 1, 2024"));
        expect(intervals[30]).toEqual(new Date("May 31, 2024"));
      });

      it("should handle February in a non-leap year", () => {
        const date = new Date("Feb 15, 2023"); // February 2023 (non-leap year - 28 days)

        const { intervals } = generateDailyIntervals(date);

        expect(intervals.length).toBe(28);
        expect(intervals[0]).toEqual(new Date("Feb 1, 2023"));
        expect(intervals[27]).toEqual(new Date("Feb 28, 2023"));
      });
    });
  });

  describe("getStartOfWeek", () => {
    it("gets start of week (Sunday) for a given date correctly", () => {
      expect(getStartOfWeek(new Date("Apr 8, 2025"))).toEqual(
        new Date("Apr 6, 2025")
      );
    });
  });

  describe("getEndOfWeek", () => {
    it("gets end of week (Saturday) for a given date correctly", () => {
      expect(getEndOfWeek(new Date("Apr 8, 2025"))).toEqual(
        new Date("Apr 12, 2025")
      );
    });
  });

  describe("getEndOfMonth", () => {
    it("gets date with last day of month correctly", () => {
      expect(getEndOfMonth(new Date("Feb 23, 2025"))).toEqual(
        new Date("Feb 28, 2025")
      );
    });

    it("handles leap year", () => {
      expect(getEndOfMonth(new Date("Feb 23, 2024"))).toEqual(
        new Date("Feb 29, 2024")
      );
    });
  });

  describe("getDateRange", () => {
    const minDate = new Date("Oct 5, 2023");
    const maxDate = new Date("Jan 6, 2025");

    describe("year time frame", () => {
      const timeFrame = "y";

      it("handles targetDate as minDate correctly", () => {
        const targetDate = new Date("Oct 5, 2023");
        const result = getDateRange(minDate, maxDate, timeFrame, targetDate);

        expect(result.start).toEqual(new Date("Jan 1, 2023"));
        expect(result.end).toEqual(new Date("Dec 31, 2023"));
      });

      it("handles targetDate as maxDate correctly", () => {
        const targetDate = new Date("Jan 6, 2025");
        const result = getDateRange(minDate, maxDate, timeFrame, targetDate);

        expect(result.start).toEqual(new Date("Jan 1, 2025"));
        expect(result.end).toEqual(new Date("Dec 31, 2025"));
      });

      it("handles earliest year correctly", () => {
        const targetDate = new Date("Nov 16, 2023");
        const result = getDateRange(minDate, maxDate, timeFrame, targetDate);

        expect(result.start).toEqual(new Date("Jan 1, 2023"));
        expect(result.end).toEqual(new Date("Dec 31, 2023"));
      });

      it("handles middle year correctly", () => {
        const targetDate = new Date("Aug 3, 2024");
        const result = getDateRange(minDate, maxDate, timeFrame, targetDate);

        expect(result.start).toEqual(new Date("Jan 1, 2024"));
        expect(result.end).toEqual(new Date("Dec 31, 2024"));
      });

      it("handles latest year correctly", () => {
        const targetDate = new Date("Jan 3, 2025");
        const result = getDateRange(minDate, maxDate, timeFrame, targetDate);

        expect(result.start).toEqual(new Date("Jan 1, 2025"));
        expect(result.end).toEqual(new Date("Dec 31, 2025"));
      });

      it("caps at max year when targetDate goes above available years", () => {
        const targetDate = new Date("Jan 3, 2026");

        const result = getDateRange(minDate, maxDate, timeFrame, targetDate);

        // Should cap at 2025, not go to 2026
        expect(result.start).toEqual(new Date("Jan 1, 2025"));
        expect(result.end).toEqual(new Date("Dec 31, 2025"));
      });

      it("caps at min year when targetDate goes below available years", () => {
        const targetDate = new Date("Jan 3, 2022");

        const result = getDateRange(minDate, maxDate, timeFrame, targetDate);

        // Should cap at 2023, not go to 2022
        expect(result.start).toEqual(new Date("Jan 1, 2023"));
        expect(result.end).toEqual(new Date("Dec 31, 2023"));
      });

      it("handles data within a single year correctly", () => {
        const minDate = new Date("Jan 5, 2024");
        const maxDate = new Date("Nov 6, 2024");
        const targetDate = new Date("Aug 20, 2024");
        const result = getDateRange(minDate, maxDate, timeFrame, targetDate);

        expect(result.start).toEqual(new Date("Jan 1, 2024"));
        expect(result.end).toEqual(new Date("Dec 31, 2024"));
      });
    });

    describe("3 month time frame", () => {
      const timeFrame = "3m";

      it("handles targetDate as minDate correctly", () => {
        const targetDate = new Date("Oct 5, 2023");
        const result = getDateRange(minDate, maxDate, timeFrame, targetDate);

        expect(result.start).toEqual(new Date("Oct 1, 2023"));
        expect(result.end).toEqual(new Date("Dec 31, 2023"));
      });

      it("handles targetDate as maxDate correctly", () => {
        const targetDate = new Date("Jan 6, 2025");
        const result = getDateRange(minDate, maxDate, timeFrame, targetDate);

        expect(result.start).toEqual(new Date("Jan 1, 2025"));
        expect(result.end).toEqual(new Date("Mar 31, 2025"));
      });

      it("handles earliest quarter correctly", () => {
        const targetDate = new Date("Nov 16, 2023");
        const result = getDateRange(minDate, maxDate, timeFrame, targetDate);

        expect(result.start).toEqual(new Date("Oct 1, 2023"));
        expect(result.end).toEqual(new Date("Dec 31, 2023"));
      });

      it("handles a middle quarter correctly", () => {
        const targetDate = new Date("Aug 3, 2024");
        const result = getDateRange(minDate, maxDate, timeFrame, targetDate);

        expect(result.start).toEqual(new Date("Jul 1, 2024"));
        expect(result.end).toEqual(new Date("Sep 30, 2024"));
      });

      it("handles latest quarter correctly", () => {
        const targetDate = new Date("Jan 3, 2025");
        const result = getDateRange(minDate, maxDate, timeFrame, targetDate);

        expect(result.start).toEqual(new Date("Jan 1, 2025"));
        expect(result.end).toEqual(new Date("Mar 31, 2025"));
      });

      it("caps at max quarter when targetDate goes above available quarters", () => {
        const targetDate = new Date("May 15, 2025");

        const result = getDateRange(minDate, maxDate, timeFrame, targetDate);

        // Should cap at Jan-Mar 2025, not go to Apr-Jun 2025
        expect(result.start).toEqual(new Date("Jan 1, 2025"));
        expect(result.end).toEqual(new Date("Mar 31, 2025"));
      });

      it("caps at min quarter when targetDate goes below available quarters", () => {
        const targetDate = new Date("Aug 3, 2023");

        const result = getDateRange(minDate, maxDate, timeFrame, targetDate);

        // Should cap at Oct-Dec 2023, not go to Jul-Sep 2023
        expect(result.start).toEqual(new Date("Oct 1, 2023"));
        expect(result.end).toEqual(new Date("Dec 31, 2023"));
      });

      it("handles data within a single quarter correctly", () => {
        const minDate = new Date("Oct 15, 2024");
        const maxDate = new Date("Nov 6, 2024");
        const targetDate = new Date("Oct 25, 2024");
        const result = getDateRange(minDate, maxDate, timeFrame, targetDate);

        expect(result.start).toEqual(new Date("Oct 1, 2024"));
        expect(result.end).toEqual(new Date("Dec 31, 2024"));
      });
    });

    describe("1 month time frame", () => {
      const timeFrame = "1m";

      it("handles targetDate as minDate correctly", () => {
        const targetDate = new Date("Oct 5, 2023");
        const result = getDateRange(minDate, maxDate, timeFrame, targetDate);

        expect(result.start).toEqual(new Date("Oct 1, 2023"));
        expect(result.end).toEqual(new Date("Oct 31, 2023"));
      });

      it("handles targetDate as maxDate correctly", () => {
        const targetDate = new Date("Jan 6, 2025");
        const result = getDateRange(minDate, maxDate, timeFrame, targetDate);

        expect(result.start).toEqual(new Date("Jan 1, 2025"));
        expect(result.end).toEqual(new Date("Jan 31, 2025"));
      });

      it("handles earliest month correctly", () => {
        const targetDate = new Date("Oct 20, 2023");
        const result = getDateRange(minDate, maxDate, timeFrame, targetDate);

        expect(result.start).toEqual(new Date("Oct 1, 2023"));
        expect(result.end).toEqual(new Date("Oct 31, 2023"));
      });

      it("handles a middle month correctly", () => {
        const targetDate = new Date("Nov 22, 2024");
        const result = getDateRange(minDate, maxDate, timeFrame, targetDate);

        expect(result.start).toEqual(new Date("Nov 1, 2024"));
        expect(result.end).toEqual(new Date("Nov 30, 2024"));
      });

      it("handles latest month correct", () => {
        const targetDate = new Date("Jan 3, 2025");
        const result = getDateRange(minDate, maxDate, timeFrame, targetDate);

        expect(result.start).toEqual(new Date("Jan 1, 2025"));
        expect(result.end).toEqual(new Date("Jan 31, 2025"));
      });

      it("caps at max month when targetDate goes above available months", () => {
        const targetDate = new Date("Feb 6, 2025");
        const result = getDateRange(minDate, maxDate, timeFrame, targetDate);

        // Should cap at Jan 2025, not go to Feb 2025
        expect(result.start).toEqual(new Date("Jan 1, 2025"));
        expect(result.end).toEqual(new Date("Jan 31, 2025"));
      });

      it("caps at min month when targetDate goes below available months", () => {
        const targetDate = new Date("Sep 15, 2023");
        const result = getDateRange(minDate, maxDate, timeFrame, targetDate);

        // Should cap at Oct 2023, not go to Sep 2023
        expect(result.start).toEqual(new Date("Oct 1, 2023"));
        expect(result.end).toEqual(new Date("Oct 31, 2023"));
      });

      it("handles data within a single month correctly", () => {
        const minDate = new Date("Jan 5, 2025");
        const maxDate = new Date("Jan 23, 2025");
        const targetDate = new Date("Jan 15, 2025");
        const result = getDateRange(minDate, maxDate, timeFrame, targetDate);

        expect(result.start).toEqual(new Date("Jan 1, 2025"));
        expect(result.end).toEqual(new Date("Jan 31, 2025"));
      });
    });
  });

  describe("getEquivalentDateForTimeFrame", () => {
    const minDate = new Date("Oct 5, 2023");
    const maxDate = new Date("Jan 6, 2025");

    describe("moving to 'all' timeframe", () => {
      it("should maintain the same date when switching to 'all' timeframe", () => {
        const date = new Date("Apr 10, 2024");
        const result = getEquivalentDateForTimeFrame(
          date,
          "1m",
          "all",
          minDate,
          maxDate
        );

        expect(result).toEqual(date);
      });
    });

    describe("moving from 'all' timeframe", () => {
      it("should use the max date when switching from 'all' to any timeframe", () => {
        const date = new Date("Apr 10, 2024");

        const resultToYear = getEquivalentDateForTimeFrame(
          date,
          "all",
          "y",
          minDate,
          maxDate
        );
        expect(resultToYear).toEqual(maxDate);

        const resultToQuarter = getEquivalentDateForTimeFrame(
          date,
          "all",
          "3m",
          minDate,
          maxDate
        );
        expect(resultToQuarter).toEqual(maxDate);

        const resultToMonth = getEquivalentDateForTimeFrame(
          date,
          "all",
          "1m",
          minDate,
          maxDate
        );
        expect(resultToMonth).toEqual(maxDate);
      });
    });

    describe("moving from wider to narrower timeframe", () => {
      it("should go to the latest month when switching from year to month", () => {
        const date = new Date("Apr 10, 2024"); // 2024
        const result = getEquivalentDateForTimeFrame(
          date,
          "y",
          "1m",
          minDate,
          maxDate
        );

        expect(result).toEqual(new Date("Dec 1, 2024")); // Dec 2024
      });

      it("should go to the latest quarter when switching from year to quarter", () => {
        const date = new Date("Apr 10, 2024"); // 2024
        const result = getEquivalentDateForTimeFrame(
          date,
          "y",
          "3m",
          minDate,
          maxDate
        );

        expect(result).toEqual(new Date("Oct 1, 2024")); // Oct-Dec 2024
      });

      it("should go to the latest month when switching from quarter to month", () => {
        const date = new Date("Apr 10, 2024"); // Apr-Jun 2024
        const result = getEquivalentDateForTimeFrame(
          date,
          "3m",
          "1m",
          minDate,
          maxDate
        );

        expect(result).toEqual(new Date("Jun 1, 2024")); // Jun 2024
      });

      it("should be capped at max date when determining the latest date", () => {
        const date = new Date("Oct 15, 2025");

        const result = getEquivalentDateForTimeFrame(
          date,
          "y",
          "1m",
          minDate,
          maxDate
        );

        expect(result).toEqual(new Date("Jan 1, 2025"));
      });
    });

    describe("moving from narrower to wider timeframe", () => {
      it("should go to the containing year when switching from month to year", () => {
        const date = new Date("May 15, 2024"); // May 2024
        const result = getEquivalentDateForTimeFrame(
          date,
          "1m",
          "y",
          minDate,
          maxDate
        );

        expect(result).toEqual(new Date("Jan 1, 2024")); // 2024
      });

      it("should go to the containing quarter when switching from month to quarter", () => {
        const date = new Date("May 15, 2024"); // May 2024
        const result = getEquivalentDateForTimeFrame(
          date,
          "1m",
          "3m",
          minDate,
          maxDate
        );

        expect(result).toEqual(new Date("Apr 1, 2024")); // Apr-Jun 2024
      });

      it("should go to the containing year when switching from quarter to year", () => {
        const date = new Date("May 15, 2024"); // Apr-Jun 2024
        const result = getEquivalentDateForTimeFrame(
          date,
          "3m",
          "y",
          minDate,
          maxDate
        );

        expect(result).toEqual(new Date("Jan 1, 2024")); // 2024
      });
    });

    describe("edge cases", () => {
      it("should handle the same from and to timeframe", () => {
        const date = new Date("May 15, 2024");
        const result = getEquivalentDateForTimeFrame(
          date,
          "1m",
          "1m",
          minDate,
          maxDate
        );

        expect(result).toEqual(date);
      });

      it("should handle cases where the date is before minDate", () => {
        const date = new Date("May 15, 2022");
        const result = getEquivalentDateForTimeFrame(
          date,
          "1m",
          "y",
          minDate,
          maxDate
        );

        // Should still work and convert to the corresponding year
        expect(result).toEqual(new Date("Jan 1, 2022"));
      });

      it("should handle cases where the date is after maxDate", () => {
        const date = new Date("May 15, 2026");
        const result = getEquivalentDateForTimeFrame(
          date,
          "1m",
          "y",
          minDate,
          maxDate
        );

        // Should still work and convert to the corresponding year
        expect(result).toEqual(new Date("Jan 1, 2026")); // 2024
      });
    });
  });

  describe("getNextDate", () => {
    it("gets correct date for time frame year", () => {
      const nextDate = getNextDate(new Date("Apr 11, 2025"), "y");
      expect(nextDate).toEqual(new Date("Apr 1, 2026"));
    });

    it("gets correct date for time frame year for leap years", () => {
      const nextDate = getNextDate(new Date("Feb 29, 2024"), "y");
      expect(nextDate).toEqual(new Date("Feb 1, 2025"));
    });

    it("gets correct date for time frame 3m", () => {
      const nextDate = getNextDate(new Date("Apr 11, 2025"), "3m");
      expect(nextDate).toEqual(new Date("Jul 1, 2025"));
    });

    it("gets correct date for time frame 3m for different end day ", () => {
      const nextDate = getNextDate(new Date("Jan 31, 2025"), "3m");
      expect(nextDate).toEqual(new Date("Apr 1, 2025"));
    });

    it("gets correct date for time frame 1m", () => {
      const nextDate = getNextDate(new Date("Apr 11, 2025"), "1m");
      expect(nextDate).toEqual(new Date("May 1, 2025"));
    });

    it("gets correct date for time frame 1m for different end day", () => {
      const nextDate = getNextDate(new Date("Mar 31, 2025"), "1m");
      expect(nextDate).toEqual(new Date("Apr 1, 2025"));
    });
  });

  describe("getPrevDate", () => {
    it("gets correct date for time frame year", () => {
      const nextDate = getPrevDate(new Date("Apr 11, 2025"), "y");
      expect(nextDate).toEqual(new Date("Apr 1, 2024"));
    });

    it("gets correct date for time frame year for leap years", () => {
      const nextDate = getPrevDate(new Date("Feb 28, 2025"), "y");
      expect(nextDate).toEqual(new Date("Feb 1, 2024"));
    });

    it("gets correct date for time frame 3m", () => {
      const nextDate = getPrevDate(new Date("Apr 11, 2025"), "3m");
      expect(nextDate).toEqual(new Date("Jan 1, 2025"));
    });

    it("gets correct date for time frame 3m for different end day ", () => {
      const nextDate = getPrevDate(new Date("Apr 30, 2025"), "3m");
      expect(nextDate).toEqual(new Date("Jan 1, 2025"));
    });

    it("gets correct date for time frame 1m", () => {
      const nextDate = getPrevDate(new Date("Apr 11, 2025"), "1m");
      expect(nextDate).toEqual(new Date("Mar 1, 2025"));
    });

    it("gets correct date for time frame 1m for different end day", () => {
      const nextDate = getPrevDate(new Date("May 31, 2025"), "1m");
      expect(nextDate).toEqual(new Date("Apr 1, 2025"));
    });
  });

  describe("checkCanNavigateNext", () => {
    describe("year time frame", () => {
      it("handles able to navigate correctly", () => {
        const date = new Date("Mar 9, 2024");
        const maxDate = new Date("Apr 9, 2025");
        const canNavigateNext = checkCanNavigateNext("y", date, maxDate);

        expect(canNavigateNext).toEqual(true); // can go to 2025
      });

      it("handles unable to navigate correctly", () => {
        const date = new Date("Mar 9, 2025");
        const maxDate = new Date("Apr 9, 2025");
        const canNavigateNext = checkCanNavigateNext("y", date, maxDate);

        expect(canNavigateNext).toEqual(false); // cannot go to 2026
      });
    });

    describe("3 month time frame", () => {
      it("handles able to navigate correctly", () => {
        const date = new Date("Mar 9, 2025");
        const maxDate = new Date("Apr 9, 2025");
        const canNavigateNext = checkCanNavigateNext("3m", date, maxDate);

        expect(canNavigateNext).toEqual(true); // can go to Apr-Jun 2025
      });

      it("handles unable to navigate correctly", () => {
        const date = new Date("Apr 3, 2025");
        const maxDate = new Date("Apr 9, 2025");
        const canNavigateNext = checkCanNavigateNext("3m", date, maxDate);

        expect(canNavigateNext).toEqual(false); // cannot go to Jul-Sep 2025
      });
    });

    describe("1 month time frame", () => {
      it("handles able to navigate correctly", () => {
        const date = new Date("Mar 20, 2025");
        const maxDate = new Date("Apr 9, 2025");
        const canNavigateNext = checkCanNavigateNext("1m", date, maxDate);

        expect(canNavigateNext).toEqual(true); // can go to Apr 2025
      });

      it("handles unable to navigate correctly", () => {
        const date = new Date("Apr 2, 2025");
        const maxDate = new Date("Apr 9, 2025");
        const canNavigateNext = checkCanNavigateNext("1m", date, maxDate);

        expect(canNavigateNext).toEqual(false); // cannot go to May 2025
      });
    });
  });

  describe("checkCanNavigatePrev", () => {
    describe("year time frame", () => {
      it("handles able to navigate correctly", () => {
        const date = new Date("Apr 9, 2025");
        const minDate = new Date("Sep 12, 2024");
        const canNavigatePrev = checkCanNavigatePrev("y", date, minDate);

        expect(canNavigatePrev).toEqual(true); // can go to 2024
      });

      it("handles unable to navigate correctly", () => {
        const date = new Date("Dec 9, 2023");
        const minDate = new Date("Sep 12, 2024");
        const canNavigatePrev = checkCanNavigatePrev("y", date, minDate);

        expect(canNavigatePrev).toEqual(false); // cannot go to 2023
      });
    });

    describe("3 month time frame", () => {
      it("handles able to navigate correctly", () => {
        const date = new Date("Nov 12, 2024");
        const minDate = new Date("Sep 12, 2024");
        const canNavigatePrev = checkCanNavigatePrev("3m", date, minDate);

        expect(canNavigatePrev).toEqual(true); // can go to Jul-Sep 2024
      });

      it("handles unable to navigate correctly", () => {
        const date = new Date("Sep 25, 2024");
        const minDate = new Date("Sep 12, 2024");
        const canNavigatePrev = checkCanNavigatePrev("3m", date, minDate);

        expect(canNavigatePrev).toEqual(false); // cannot go to Apr-Jun 2024
      });
    });

    describe("1 month time frame", () => {
      it("handles able to navigate correctly", () => {
        const date = new Date("Oct 25, 2024");
        const minDate = new Date("Sep 12, 2024");
        const canNavigatePrev = checkCanNavigatePrev("1m", date, minDate);

        expect(canNavigatePrev).toEqual(true); // can go to Sep 2024
      });

      it("handles unable to navigate correctly", () => {
        const date = new Date("Sep 25, 2024");
        const minDate = new Date("Sep 12, 2024");
        const canNavigatePrev = checkCanNavigatePrev("1m", date, minDate);

        expect(canNavigatePrev).toEqual(false); // cannot go to Aug 2024
      });
    });
  });

  describe("hasDataInRange", () => {
    const sampleData = [
      { id: "1", date: new Date("Mar 1, 2024"), price: 10.99, isSale: false },
      { id: "2", date: new Date("Mar 1, 2024"), price: 8.99, isSale: true },
      { id: "3", date: new Date("Mar 15, 2024"), price: 10.99, isSale: false },
      { id: "4", date: new Date("Apr 4, 2024"), price: 9.99, isSale: true },
      { id: "5", date: new Date("Apr 13, 2024"), price: 10.99, isSale: false },
      { id: "6", date: new Date("May 5, 2024"), price: 11.99, isSale: false },
    ];

    it("should return true when data exists within range", () => {
      const start = new Date("Mar 1, 2024");
      const end = new Date("Mar 31, 2024");

      expect(hasDataInRange(sampleData, start, end)).toBe(true);
    });

    it("should return false when no data exists within range", () => {
      const start = new Date("2024-01-01");
      const end = new Date("2024-02-29");

      expect(hasDataInRange(sampleData, start, end)).toBe(false);
    });

    it("should return false for empty data array", () => {
      const start = new Date("2024-01-01");
      const end = new Date("2024-12-31");

      expect(hasDataInRange([], start, end)).toBe(false);
    });
  });
});
