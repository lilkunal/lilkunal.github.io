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

test.describe("Kunal hire site — work", () => {
  test("Home features proof and points to the work page", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#work .work-drop__list")).toHaveCount(0);
    await expect(page.locator("#work .work-card")).toHaveCount(3);
    await expect(page.getByRole("link", { name: /All website work/ })).toHaveAttribute("href", "work/");
  });

  test("Work nav goes to the work page", async ({ page }) => {
    await page.goto("/");
    const work = page.locator("header .nav__links a").filter({ hasText: /^Work$/ });
    await expect(work).toHaveAttribute("href", "work/");
  });

  test("/work/ lists sites in the build order", async ({ page }) => {
    await page.goto("/work/");
    const names = page.locator(".work-index__name");
    await expect(names).toHaveCount(BUILD_ORDER.length);
    await expect(names).toHaveText(BUILD_ORDER);
  });
});
