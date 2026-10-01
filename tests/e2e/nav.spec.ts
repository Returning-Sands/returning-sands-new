import { expect, test, type Page } from "@playwright/test";

// Top_Nav behaviour axe cannot see (Req 1.5, 1.6, 1.7, 15.4, 15.7, 15.8).

const PRIMARY = 'nav[aria-label="Primary"]';
const CURRENT = `${PRIMARY} [aria-current="page"]`;

test.describe("skip link", () => {
  test("Skip to content is the first focusable element and moves focus to <main>", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");

    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();

    await page.keyboard.press("Enter");
    await expect(page.locator("main#main")).toBeFocused();
  });
});

test.describe("current page marker", () => {
  for (const path of ["/about", "/campaign/cairo", "/donate"]) {
    test(`exactly one aria-current="page" in the primary nav on ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator(CURRENT)).toHaveCount(1);
    });
  }

  test("/campaign/cairo marks the Impact Campaign link", async ({ page }) => {
    await page.goto("/campaign/cairo");
    await expect(page.locator(CURRENT)).toHaveAttribute("href", "/campaign");
  });

  for (const path of ["/museum", "/this-page-does-not-exist"]) {
    test(`no aria-current="page" in the primary nav on ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator(CURRENT)).toHaveCount(0);
    });
  }
});

test.describe("collapsed menu (mobile)", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(test.info().project.name !== "mobile", "the collapsed menu only exists below md");
    await page.goto("/");
  });

  const menuButton = (page: Page) => page.getByRole("button", { name: "Menu" });
  const menuLinks = (page: Page) => page.locator("#mobile-menu a");

  test("Menu button toggles aria-expanded and the list", async ({ page }) => {
    const button = menuButton(page);
    await expect(button).toBeVisible();
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("#mobile-menu")).toHaveCount(0);

    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#mobile-menu")).toBeVisible();
    await expect(menuLinks(page)).toHaveCount(7);

    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("#mobile-menu")).toHaveCount(0);
  });

  test("Escape closes the menu and refocuses the button", async ({ page }) => {
    const button = menuButton(page);
    await button.click();
    await menuLinks(page).first().focus();
    await expect(menuLinks(page).first()).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("#mobile-menu")).toHaveCount(0);
    await expect(button).toBeFocused();
  });

  test("activating a link closes the menu", async ({ page }) => {
    const button = menuButton(page);
    await button.click();
    const about = page.locator('#mobile-menu a[href="/about"]');
    await about.click();

    await expect(page).toHaveURL(/\/about$/);
    await expect(page.locator("#mobile-menu")).toHaveCount(0);
    await expect(menuButton(page)).toHaveAttribute("aria-expanded", "false");
  });

  test("Tab from the last link wraps to the button; Shift+Tab from the button wraps to the last link", async ({
    page,
  }) => {
    const button = menuButton(page);
    await button.click();
    const last = menuLinks(page).last();

    await last.focus();
    await expect(last).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(button).toBeFocused();

    await page.keyboard.press("Shift+Tab");
    await expect(last).toBeFocused();
  });
});
