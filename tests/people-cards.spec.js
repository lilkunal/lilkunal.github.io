const { test, expect } = require("@playwright/test");

test.describe("Kunal hire site — portfolios", () => {
  test("Home keeps the portfolios in the nav dropdown, not in a section", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#hire-portfolios")).toHaveCount(0);

    await page.getByRole("button", { name: /Portfolios/ }).click();
    const menu = page.locator("#nav-portfolios");
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("link", { name: /Shweta Tiwari/ })).toHaveAttribute("href", "https://tiwarishweta03.github.io/");
    await expect(menu.getByRole("link", { name: /Antriksh Upadhyay/ })).toHaveAttribute("href", "https://antrikshu.github.io/");
    await expect(menu.getByRole("link", { name: /Anamika Rajput/ })).toHaveAttribute("href", "https://r-anamika.github.io/");
    await expect(menu.getByRole("link", { name: /All portfolios/ })).toHaveAttribute("href", "portfolios/");
  });

  test("Home work reel moves and tracks its position with dots", async ({ page }) => {
    // Reduced motion switches autoplay off and scrolling to instant, so the assertions are stable.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const reel = page.locator(".home-reel").first();
    const track = reel.locator("[data-carousel-track]");
    const dots = reel.locator(".home-reel__dot");
    await expect(dots).toHaveCount(8);
    await expect(dots.first()).toHaveClass(/is-active/);

    const start = await track.evaluate((el) => el.scrollLeft);
    await reel.locator("[data-carousel-next]").click();
    await expect.poll(async () => track.evaluate((el) => el.scrollLeft)).toBeGreaterThan(start);
    await expect(dots.first()).not.toHaveClass(/is-active/);

    await reel.locator("[data-carousel-prev]").click();
    await expect.poll(async () => track.evaluate((el) => el.scrollLeft)).toBe(start);
    await expect(dots.first()).toHaveClass(/is-active/);
  });

  test("/portfolios page is a name board, not a work list", async ({ page }) => {
    await page.goto("/portfolios/");
    await expect(page.getByRole("heading", { name: /Hire sites I designed/ })).toBeVisible();
    await expect(page.locator(".people-card--shweta")).toBeVisible();
    await expect(page.locator(".people-card--antriksh")).toBeVisible();
    await expect(page.locator(".people-card--anamika")).toBeVisible();
    await expect(page.locator(".people-card")).toHaveCount(3);
    await expect(page.locator(".people-card--anamika")).toHaveAttribute("href", "https://r-anamika.github.io/");
    await expect(page.locator(".work-board")).toHaveCount(0);
  });
});
