const { test, expect } = require("@playwright/test");

const WORK_ORDER = [
  "Padma Enterprises",
  "JAI Home Care",
  "Atul Shiv Shakti",
  "Ace Factor Fitness",
  "BKC",
  "Daftar",
  "THOOK",
];

test.describe("Kunal hire site — work", () => {
  test("Home features Daftar and does not list THOOK", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#work")).not.toContainText("THOOK");
    await expect(page.locator("#work .work-index__name")).toHaveText([
      "Padma Enterprises",
      "JAI Home Care",
      "Daftar",
    ]);
  });

  test("Work nav goes to the work page", async ({ page }) => {
    await page.goto("/");
    const work = page.locator("header .nav__links a").filter({ hasText: /^Work$/ });
    await expect(work).toHaveAttribute("href", "work/");
  });

  test("/work/ includes THOOK with the other sites", async ({ page }) => {
    await page.goto("/work/");
    const names = page.locator(".work-index__name");
    await expect(names).toHaveCount(WORK_ORDER.length);
    await expect(names).toHaveText(WORK_ORDER);
    await expect(page.getByRole("heading", { name: "THOOK" })).toBeVisible();
    await expect(page.locator("a.work-quiet")).toHaveCount(0);
  });
});

test.describe("Kunal hire site — FAQ", () => {
  test("answers stay hidden until a question is clicked", async ({ page }) => {
    await page.goto("/");
    const first = page.locator("#ask .faq-entry").first();
    await expect(first).not.toHaveAttribute("open");
    await expect(first.locator(".faq-panel")).toBeHidden();
    await first.locator("summary").click();
    await expect(first).toHaveAttribute("open");
    await expect(first.locator(".faq-panel")).toBeVisible();
  });
});
