import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/groceries");
});

test.describe("add item", () => {
  test("should open dialog for selecting method of adding items", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Add" }).first().click();
    await expect(page.locator('div[role="dialog"]')).toBeVisible();
    await expect(page.locator('div[role="dialog"]')).toContainText(
      "Add to Grocery Tracker"
    );
  });

  test.only("should successfully add a new item manually", async ({ page }) => {
    await page.getByRole("button", { name: "Add" }).first().click();
    await page
      .getByRole("button", { name: "Enter Item Manually" })
      .first()
      .click();
    await expect(page.locator('div[role="dialog"]')).toContainText(
      "Add Item Manually"
    );

    await page.getByLabel("Name").fill("orange juice");
    await page.getByLabel("Brand").fill("Tropicana");
    await page.getByLabel("Store").fill("Walmart");
    await page.getByLabel("Amount").fill("100");
    await page.getByLabel("Price").fill("4.99");
    await page.getByText("Pick a date").click();
    const calendarCells = await page.getByRole("gridcell", { name: "1" }).all();

    for (const cell of calendarCells) {
      const isDisabled = await cell.evaluate((el) =>
        el.classList.contains("text-muted-foreground")
      );

      if (!isDisabled) {
        await cell.click();
        break;
      }
    }
    await page.keyboard.press("Escape");

    await page.getByRole("button", { name: "Submit" }).click();

    // Wait for dialog to close
    await expect(page.getByRole("button", { name: "Add" })).toBeEnabled();

    await expect(page.getByText("orange juice")).toBeVisible();
    await expect(page.getByText("Tropicana")).toBeVisible();
    await expect(page.getByText("$4.99").first()).toBeVisible();
  });
});
