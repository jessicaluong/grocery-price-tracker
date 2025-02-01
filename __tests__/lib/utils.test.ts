import { matchName } from "@/lib/utils";

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
