const { test, expect } = require("@playwright/test");

const WORK_ORDER = [
  "Padma Enterprises",
  "JAI Home Care",
  "Atul Shiv Shakti",
  "Ace Factor Fitness",
  "BKC",
  "Daftar",
];

test.describe("Kunal hire site — work", () => {
  test("Home features Daftar and never names THOOK", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).not.toContainText("THOOK");
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

  test("/work/ lists sites without a THOOK card", async ({ page }) => {
    await page.goto("/work/");
    const names = page.locator(".work-index__name");
    await expect(names).toHaveCount(WORK_ORDER.length);
    await expect(names).toHaveText(WORK_ORDER);
    await expect(page.locator(".work-card img[src*='thook']")).toHaveCount(0);
    await expect(page.locator("a.work-quiet")).toHaveAttribute(
      "href",
      "https://lilkunal.github.io/thook/"
    );
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
