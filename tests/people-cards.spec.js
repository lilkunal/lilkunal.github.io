const { test, expect } = require("@playwright/test");

test.describe("Kunal hire site — portfolios", () => {
  test("Portfolios dropdown shows two distinct hire cards", async ({ page }) => {
    await page.goto("/");
    await page.locator("#portfolios [data-accordion-btn]").click();
    const shweta = page.locator("#portfolios .people-card--shweta");
    const antriksh = page.locator("#portfolios .people-card--antriksh");
    await expect(shweta).toBeVisible();
    await expect(shweta).toContainText("Shweta Tiwari");
    await expect(shweta).toContainText("HR Business Partner");
    await expect(antriksh).toBeVisible();
    await expect(antriksh).toContainText("Antriksh Upadhyay");
    await expect(antriksh).toContainText("Support");
  });

  test("/portfolios page is a name board, not a work list", async ({ page }) => {
    await page.goto("/portfolios/");
    await expect(page.getByRole("heading", { name: /Their name/ })).toBeVisible();
    await expect(page.locator(".people-card--shweta")).toBeVisible();
    await expect(page.locator(".people-card--antriksh")).toBeVisible();
    await expect(page.locator(".work-drop__list")).toHaveCount(0);
  });
});
