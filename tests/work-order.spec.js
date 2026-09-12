const { test, expect } = require("@playwright/test");

const WORK_ORDER = [
  "Padma Enterprises",
  "JAI Home Care",
  "Atul Shiv Shakti",
  "Ace Factor Fitness",
  "BKC",
  "Daftar",
  "THOOK",
  "Bhagwan",
];

test.describe("Kunal hire site — work", () => {
  test("Home work carousel lists every site in order", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#work .work-index__name")).toHaveText(WORK_ORDER);
    await expect(page.locator("#work [data-carousel]").first()).toBeVisible();
  });

  test("Work nav goes to the work page", async ({ page }) => {
    await page.goto("/");
    const work = page.locator("header .nav__links a").filter({ hasText: /^Work$/ });
    await expect(work).toHaveAttribute("href", "work/");
  });

  test("/work/ includes THOOK and Bhagwan with the other sites", async ({ page }) => {
    await page.goto("/work/");
    const names = page.locator(".work-index__name");
    await expect(names).toHaveCount(WORK_ORDER.length);
    await expect(names).toHaveText(WORK_ORDER);
    await expect(page.getByRole("heading", { name: "THOOK" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Bhagwan" })).toBeVisible();
    await expect(page.locator("a.work-quiet")).toHaveCount(0);
  });
});

test.describe("Kunal hire site — home", () => {
  test("Background timeline and FAQ are gone", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#experience")).toHaveCount(0);
    await expect(page.locator("#ask")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Background" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Hiring questions, answered" })).toHaveCount(0);
  });
});
