import {
  calculateDateRange,
  getEndOfMonth,
  getSunday,
} from "@/app/(dashboard)/groceries/components/grocery-list/price-chart/price-chart-utils";

describe("PriceChartUtils", () => {
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

  describe("getSunday", () => {
    it("gets Sunday for that week correctly", () => {
      expect(getSunday(new Date("Oct 5, 2024"))).toEqual(
        new Date("Sep 29, 2024")
      );
    });
  });

  describe("calculateDateRange", () => {
    describe("year time frame", () => {
      const minDate = new Date("Oct 5, 2023");
      const maxDate = new Date("Jan 6, 2025");
      const timeFrame = "y";

      it("handles offset 0 correctly", () => {
        const offset = 0;
        const result = calculateDateRange(minDate, maxDate, timeFrame, offset);

        expect(result.start).toEqual(new Date("Jan 1, 2023"));
        expect(result.end).toEqual(new Date("Dec 31, 2023"));
      });

      it("handles offset 1 correctly", () => {
        const offset = 1;
        const result = calculateDateRange(minDate, maxDate, timeFrame, offset);

        expect(result.start).toEqual(new Date("Jan 1, 2024"));
        expect(result.end).toEqual(new Date("Dec 31, 2024"));
      });

      it("handles offset 2 (max) correctly", () => {
        const offset = 2;
        const result = calculateDateRange(minDate, maxDate, timeFrame, offset);

        expect(result.start).toEqual(new Date("Jan 1, 2025"));
        expect(result.end).toEqual(new Date("Dec 31, 2025"));
      });

      it("caps at max year when offset exceeds available years", () => {
        const offset = 3; // Beyond the range

        const result = calculateDateRange(minDate, maxDate, timeFrame, offset);

        // Should cap at 2025, not go to 2026
        expect(result.start).toEqual(new Date("Jan 1, 2025"));
        expect(result.end).toEqual(new Date("Dec 31, 2025"));
      });

      it("handles data within a single year correctly", () => {
        const minDate = new Date("Jan 5, 2024");
        const maxDate = new Date("Nov 6, 2024");
        const offset = 0;
        const result = calculateDateRange(minDate, maxDate, timeFrame, offset);

        expect(result.start).toEqual(new Date("Jan 1, 2024"));
        expect(result.end).toEqual(new Date("Dec 31, 2024"));
      });
    });

    xdescribe("3 month time frame", () => {
      it("handles offset 0 correctly", () => {});
    });

    describe("1 month time frame", () => {
      const minDate = new Date("Oct 5, 2024");
      const maxDate = new Date("Jan 6, 2025");
      const timeFrame = "1m";

      it("handles offset 0 correctly", () => {
        const offset = 0;
        const result = calculateDateRange(minDate, maxDate, timeFrame, offset);

        expect(result.start).toEqual(new Date("Oct 1, 2024"));
        expect(result.end).toEqual(new Date("Oct 31, 2024"));
      });

      it("handles offset 1 correctly", () => {
        const offset = 1;
        const result = calculateDateRange(minDate, maxDate, timeFrame, offset);

        expect(result.start).toEqual(new Date("Nov 1, 2024"));
        expect(result.end).toEqual(new Date("Nov 30, 2024"));
      });

      it("handles offset 5 (max) correctly", () => {
        const offset = 5;
        const result = calculateDateRange(minDate, maxDate, timeFrame, offset);

        expect(result.start).toEqual(new Date("Feb 1, 2025"));
        expect(result.end).toEqual(new Date("Feb 28, 2025"));
      });

      it("caps at max month when offset exceeds available months", () => {
        const offset = 6; // Beyond the range

        const result = calculateDateRange(minDate, maxDate, timeFrame, offset);

        // Should cap at Feb 2025, not go to Mar 2025
        expect(result.start).toEqual(new Date("Feb 1, 2025"));
        expect(result.end).toEqual(new Date("Feb 28, 2025"));
      });

      it("handles data within a single month correctly", () => {
        const minDate = new Date("Feb 5, 2025");
        const maxDate = new Date("Feb 23, 2025");
        const offset = 0;
        const result = calculateDateRange(minDate, maxDate, timeFrame, offset);

        expect(result.start).toEqual(new Date("Feb 1, 2025"));
        expect(result.end).toEqual(new Date("Feb 28, 2025"));
      });
    });
  });
});
