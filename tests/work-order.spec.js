const { test, expect } = require("@playwright/test");

const WORK_ORDER = [
  "Padma Enterprises",
  "THOOK",
  "JAI Home Care",
  "Atul Shiv Shakti",
  "Ace Factor Fitness",
  "BKC",
  "Daftar",
];

test.describe("Kunal hire site — work", () => {
  test("Home points to the work page instead of listing sites", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#work .work-drop__list")).toHaveCount(0);
    await expect(page.locator("#work .work-card")).toHaveCount(0);
    await expect(page.getByRole("link", { name: /See the work/ })).toHaveAttribute("href", "work/");
  });

  test("Work nav goes to the work page", async ({ page }) => {
    await page.goto("/");
    const work = page.locator("header .nav__links a").filter({ hasText: /^Work$/ });
    await expect(work).toHaveAttribute("href", "work/");
  });

  test("/work/ leads with live sites, then labelled demos", async ({ page }) => {
    await page.goto("/work/");
    const names = page.locator(".work-index__name");
    await expect(names).toHaveCount(WORK_ORDER.length);
    await expect(names).toHaveText(WORK_ORDER);
    await expect(page.getByText("01 · Live client")).toBeVisible();
    await expect(page.getByText("03 · Demo")).toBeVisible();
  });
});
