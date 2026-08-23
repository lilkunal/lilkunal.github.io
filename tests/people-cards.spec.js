const { test, expect } = require("@playwright/test");

test.describe("Kunal hire site — portfolios", () => {
  test("Home points to the portfolios page", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#portfolios .people-card")).toHaveCount(0);
    await expect(page.getByRole("link", { name: /Portfolios I made/ }).first()).toHaveAttribute("href", "portfolios/");
  });

  test("/portfolios page is a name board, not a work list", async ({ page }) => {
    await page.goto("/portfolios/");
    await expect(page.getByRole("heading", { name: /Hire sites I designed/ })).toBeVisible();
    await expect(page.locator(".people-card--shweta")).toBeVisible();
    await expect(page.locator(".people-card--antriksh")).toBeVisible();
    await expect(page.locator(".work-board")).toHaveCount(0);
  });
});
