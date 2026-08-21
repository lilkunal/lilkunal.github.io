const { test, expect } = require("@playwright/test");

const BUILD_ORDER = [
  "Padma Enterprises",
  "JAI Home Care",
  "Atul Shiv Shakti",
  "Ace Factor Fitness",
  "BKC",
  "Daftar",
  "THOOK",
];

test.describe("Kunal hire site — work order", () => {
  test("Website work dropdown lists sites in the build order", async ({ page }) => {
    await page.goto("/");
    const names = page.locator("#work .work-drop__list .work-drop__name");
    await expect(names).toHaveCount(BUILD_ORDER.length);
    await expect(names).toHaveText(BUILD_ORDER);
  });

  test("Work nav menu uses the same order", async ({ page }) => {
    await page.goto("/");
    await page.locator("#work-menu-btn").click();
    const menu = page.locator("#work-menu");
    await expect(menu).toBeVisible();
    const links = menu.locator("a");
    const labels = (await links.allTextContents()).map((t) => t.trim());
    expect(labels[0]).toBe("All website work");
    expect(labels.slice(1)).toEqual(BUILD_ORDER);
  });
});
