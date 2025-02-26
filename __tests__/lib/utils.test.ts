import {
  comparePriceFormat,
  currencyFormat,
  formatString,
  getDisplayFromParam,
  getParamFromDisplay,
  matchName,
} from "@/lib/utils";

describe("utils", () => {
  describe("currencyFormat", () => {
    it("should format currency with USD symbol and two decimal places", () => {
      const result = currencyFormat(10.5);
      expect(result).toBe("$10.50");
    });
  });

  describe("comparePriceFormat", () => {
    describe("basic functionality", () => {
      it("should handle milliliters correctly", () => {
        const result = comparePriceFormat(1, 2.5, 100, "mL");
        expect(result).toBe("$2.50 / 100 mL");
      });

      it("should handle liters correctly", () => {
        const result = comparePriceFormat(1, 10.0, 2, "L");
        expect(result).toBe("$0.50 / 100 mL");
      });

      it("should handle grams correctly", () => {
        const result = comparePriceFormat(1, 5.0, 100, "g");
        expect(result).toBe("$5.00 / 100 g");
      });

      it("should handle kilograms correctly", () => {
        const result = comparePriceFormat(1, 15.0, 5, "kg");
        expect(result).toBe("$0.30 / 100 g");
      });
    });

    describe("unit without conversion factor", () => {
      it("should handle units correctly", () => {
        const result = comparePriceFormat(1, 5.0, 1, "units");
        expect(result).toBe("$5.00 / unit");
      });

      it("should handle sheets correctly", () => {
        const result = comparePriceFormat(1, 10.0, 100, "sheets");
        expect(result).toBe("$0.10 / sheet");
      });

      it("should handle washloads correctly", () => {
        const result = comparePriceFormat(1, 20.0, 500, "washloads");
        expect(result).toBe("$0.04 / washload");
      });
    });

    describe("multiple count handling", () => {
      it("should handle multiple item counts for volume units", () => {
        const result = comparePriceFormat(2, 10.0, 100, "mL");
        expect(result).toBe("$5.00 / 100 mL");
      });

      it("should handle multiple item counts for weight units", () => {
        const result = comparePriceFormat(5, 50.0, 250, "g");
        expect(result).toBe("$4.00 / 100 g");
      });

      it("should handle multiple item counts for item (unit/sheet/washload) units", () => {
        const result = comparePriceFormat(4, 2.0, 1, "units");
        expect(result).toBe("$0.50 / unit");
      });
    });

    describe("price precision", () => {
      it("should handle fractional prices with two decimal places", () => {
        const result = comparePriceFormat(1, 1.99, 100, "mL");
        expect(result).toBe("$1.99 / 100 mL");
      });

      it("should handle prices that need rounding", () => {
        const result = comparePriceFormat(1, 2.999, 100, "mL");
        expect(result).toBe("$3.00 / 100 mL");
      });

      it("should handle very small prices without losing precision", () => {
        const result = comparePriceFormat(1, 0.05, 100, "mL");
        expect(result).toBe("$0.05 / 100 mL");
      });
    });

    describe("edge cases", () => {
      it("should handle zero price", () => {
        const result = comparePriceFormat(1, 0, 100, "mL");
        expect(result).toBe("$0.00 / 100 mL");
      });

      it("should handle invalid inputs", () => {
        const zeroCount = comparePriceFormat(0, 5.0, 100, "mL");
        const zeroAmount = comparePriceFormat(1, 5.0, 0, "mL");
        expect(zeroCount).toBe("N/A");
        expect(zeroAmount).toBe("N/A");
      });
    });
  });

  describe("matchName", () => {
    it("should match by full name", () => {
      const match = matchName("orange juice", "orange juice");
      expect(match).toBe(true);
    });

    it("should match by partial name (first word)", () => {
      const match = matchName("pure orange juice", "pure");
      expect(match).toBe(true);
    });

    it("should match by partial name (second word)", () => {
      const match = matchName("pure orange juice", "orange");
      expect(match).toBe(true);
    });

    it("should match by partial name (third word)", () => {
      const match = matchName("pure orange juice", "juice");
      expect(match).toBe(true);
    });

    it("should match by start-of-word partial match", () => {
      const match = matchName("orange juice", "ora");
      expect(match).toBe(true);
    });

    it("should not match by mid-word partial match", () => {
      const match = matchName("orange juice", "ran");
      expect(match).toBe(false);
    });

    it("should handle multiple word search query", () => {
      const match = matchName("pure orange juice", "orange ju");
      expect(match).toBe(true);
    });

    it("should not match for non-matching name", () => {
      const match = matchName("orange juice", "apple juice");
      expect(match).toBe(false);
    });

    it("should match words in any order", () => {
      const match = matchName("pure orange juice", "juice orange");
      expect(match).toBe(true);
    });

    it("should match regardless of case", () => {
      const match = matchName("orange juice", "ORANGE");
      expect(match).toBe(true);
    });

    it("should handle extra spaces between words", () => {
      const match = matchName("orange juice", "orange  juice");
      expect(match).toBe(true);
    });

    it("should handle special characters", () => {
      const match = matchName("100% orange juice", "100% orange");
      expect(match).toBe(true);
    });

    it("should handle empty search query", () => {
      const match = matchName("orange juice", "");
      expect(match).toBe(true);
    });

    it("should handle empty item name", () => {
      const match = matchName("", "orange");
      expect(match).toBe(false);
    });
  });

  describe("formatString", () => {
    it("should remove inner whitespaces", () => {
      const result = formatString("orange juice");
      expect(result).toEqual("orangejuice");
    });

    it("should remove outer whitespaces", () => {
      const result = formatString("   orange ");
      expect(result).toEqual("orange");
    });

    it("should make string lowercase", () => {
      const result = formatString("ORangE");
      expect(result).toEqual("orange");
    });

    it("should handle null", () => {
      const result = formatString(null);
      expect(result).toEqual("");
    });
  });

  describe("getDisplayFromParam", () => {
    it("should get correct display for sort by newest", () => {
      const display = getDisplayFromParam("sort", "newest");
      expect(display).toBe("Newest Date");
    });

    it("should get correct display for sort by cheapest", () => {
      const display = getDisplayFromParam("sort", "cheapest");
      expect(display).toBe("Lowest Price");
    });

    it("should get correct display for view by list", () => {
      const display = getDisplayFromParam("view", "list");
      expect(display).toBe("List All Items");
    });

    it("should get correct display for view by group", () => {
      const display = getDisplayFromParam("view", "group");
      expect(display).toBe("Group Items");
    });

    it("should return default sort display value for invalid sort parameter", () => {
      const display = getDisplayFromParam("sort", "invalid");
      expect(display).toBe("Newest Date");
    });

    it("should return default view display value for invalid view parameter", () => {
      const display = getDisplayFromParam("view", "invalid");
      expect(display).toBe("List All Items");
    });

    it("should handle empty parameter strings", () => {
      const displaySort = getDisplayFromParam("sort", "");
      const displayView = getDisplayFromParam("view", "");
      expect(displaySort).toBe("Newest Date");
      expect(displayView).toBe("List All Items");
    });

    it("should handle case-sensitive parameter matching", () => {
      const display = getDisplayFromParam("sort", "CHEAPEST");
      expect(display).toBe("Lowest Price");
    });
  });

  describe("getParamFromDisplay", () => {
    it("should get correct parameter for sort by newest", () => {
      const display = getParamFromDisplay("sort", "Newest Date");
      expect(display).toBe("newest");
    });

    it("should get correct parameter for sort by cheapest", () => {
      const display = getParamFromDisplay("sort", "Lowest Price");
      expect(display).toBe("cheapest");
    });

    it("should get correct parameter for view by list", () => {
      const display = getParamFromDisplay("view", "List All Items");
      expect(display).toBe("list");
    });

    it("should get correct parameter for view by group", () => {
      const display = getParamFromDisplay("view", "Group Items");
      expect(display).toBe("group");
    });

    it("should return default sort parameter for invalid sort display value", () => {
      const display = getParamFromDisplay("sort", "invalid");
      expect(display).toBe("newest");
    });

    it("should return default view parameter for invalid view display value", () => {
      const display = getParamFromDisplay("view", "invalid");
      expect(display).toBe("list");
    });

    it("should handle empty display strings", () => {
      const displaySort = getParamFromDisplay("sort", "");
      const displayView = getParamFromDisplay("view", "");
      expect(displaySort).toBe("newest");
      expect(displayView).toBe("list");
    });

    it("should handle case-sensitive display matching", () => {
      const display = getParamFromDisplay("sort", "LOWEST PRICE");
      expect(display).toBe("cheapest");
    });
  });
});
