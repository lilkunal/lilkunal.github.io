const { test, expect } = require("@playwright/test");

test.describe("Kunal hire site — gaming", () => {
  test("Gaming page shows the Riot ID and a movable avatar", async ({ page }) => {
    await page.goto("/gaming/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("body")).toContainText("stuartboi#0702");
    await expect(page.locator("#gamer")).toBeVisible();
    await expect(page.locator("[data-copy-id]").first()).toHaveAttribute("data-copy-id", "stuartboi#0702");
    await expect(page.locator("body")).toContainText("stuart07026699");
    await expect(page.getByRole("link", { name: /Profile/ })).toHaveAttribute("href", /76561199138410559/);

    // The parts the cursor animation drives must all exist.
    for (const id of ["#g-head", "#g-pupils", "#g-brows", "#g-arm-left", "#g-arm-right", "#g-lids"]) {
      await expect(page.locator(id)).toHaveCount(1);
    }
  });

  test("Avatar follows the pointer", async ({ page }) => {
    await page.goto("/gaming/");
    const pupils = page.locator("#g-pupils");
    await page.mouse.move(50, 120);
    await page.waitForTimeout(500);
    const left = await pupils.getAttribute("transform");

    const box = await page.locator("#gamer").boundingBox();
    await page.mouse.move(box.x + box.width, box.y + box.height);
    await page.waitForTimeout(500);
    const right = await pupils.getAttribute("transform");

    expect(left).not.toBeNull();
    expect(right).not.toEqual(left);
  });

  test("Footer sticker strip loads all four images", async ({ page }) => {
    await page.goto("/gaming/");
    const imgs = page.locator(".stickers img");
    await expect(imgs).toHaveCount(4);
    await imgs.last().scrollIntoViewIfNeeded();
    for (let i = 0; i < 4; i += 1) {
      await expect(imgs.nth(i)).toBeVisible();
      const ok = await imgs.nth(i).evaluate((el) => el.complete && el.naturalWidth > 0);
      expect(ok).toBe(true);
    }
  });

  test("Every page links to gaming and the page fits a phone", async ({ page }) => {
    for (const path of ["/", "/work/", "/portfolios/"]) {
      await page.goto(path);
      await expect(page.locator(".nav__links").getByRole("link", { name: "Gaming" })).toHaveCount(1);
    }

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/gaming/");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
