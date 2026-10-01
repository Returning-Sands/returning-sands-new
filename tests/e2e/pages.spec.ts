import { expect, test, type Locator, type Page } from "@playwright/test";

import { site } from "@/content/site";

// Page-level rendering behaviour (Req 2.1, 2.5, 5.7, 10.7, 12.1, 12.11, 12.13).

/** Number of tracks in an element's computed `grid-template-columns`. */
async function columnCount(locator: Locator): Promise<number> {
  return locator.evaluate((el) => {
    const value = getComputedStyle(el).gridTemplateColumns;
    // Without an explicit template the computed value is "none" — one column.
    if (value === "none") return 1;
    return value.split(" ").filter((t) => t.length > 0).length;
  });
}

async function expectInsideViewport(locator: Locator, viewport: { width: number; height: number }, label: string) {
  await expect(locator, label).toBeVisible();
  const box = await locator.boundingBox();
  expect(box, `${label} has no bounding box`).not.toBeNull();
  const { x, y, width, height } = box!;
  expect(y, `${label} top is above the viewport`).toBeGreaterThanOrEqual(0);
  expect(x, `${label} left is outside the viewport`).toBeGreaterThanOrEqual(0);
  expect(y + height, `${label} bottom (${y + height}) is below the fold (${viewport.height})`).toBeLessThanOrEqual(
    viewport.height,
  );
  expect(x + width, `${label} right (${x + width}) overflows the viewport (${viewport.width})`).toBeLessThanOrEqual(
    viewport.width,
  );
}

test.describe("Home above the fold", () => {
  test("kicker, h1, description, Donate and the trailer control are all within the initial viewport", async ({
    page,
  }) => {
    const viewport =
      test.info().project.name === "mobile" ? { width: 375, height: 667 } : { width: 1280, height: 800 };
    await page.setViewportSize(viewport);
    await page.goto("/");

    const hero = page.locator("main section").first();
    await expectInsideViewport(hero.locator(".kicker"), viewport, "kicker");
    await expectInsideViewport(hero.getByRole("heading", { level: 1 }), viewport, "h1");
    await expectInsideViewport(hero.getByText(site.description), viewport, "description");
    await expectInsideViewport(hero.getByRole("link", { name: "Donate" }), viewport, "Donate button");

    // Trailer control: an ExternalLink when the URL is present, otherwise the
    // disabled "coming soon" button.
    const trailer = hero.locator('a:has-text("Watch the Trailer"), button:has-text("Trailer coming soon")');
    await expect(trailer).toHaveCount(1);
    await expectInsideViewport(trailer, viewport, "trailer control");
  });
});

test.describe("City_Stamp hover", () => {
  test("hovering a City_Stamp changes its border colour", async ({ page }) => {
    // Tailwind 4 wraps `hover:` in `@media (hover: hover)`, which the touch
    // emulation of the mobile project does not match.
    test.skip(test.info().project.name === "mobile", "hover styles are gated on (hover: hover)");

    await page.goto("/");
    // The hero stamps are the first links to the city pages in <main>; the
    // CityList anchors come later in the DOM.
    const stamp = page.locator('main a[href="/campaign/london"]').first();
    await expect(stamp).toBeVisible();

    const before = await stamp.evaluate((el) => getComputedStyle(el).borderTopColor);
    await stamp.hover();
    await expect
      .poll(async () => stamp.evaluate((el) => getComputedStyle(el).borderTopColor), {
        message: "border colour should change on hover (150 ms transition)",
      })
      .not.toBe(before);
  });
});

test.describe("Documentary trailer", () => {
  // The trailer URL is a build-time Placeholder in content/film.ts; with the
  // site prerendered there is no runtime hook to stub it, so the iframe
  // aspect-ratio check can only run once a trailer URL is committed.
  test("trailer iframe keeps a 16:9 ratio at 320 and 1920 px", async ({ page }) => {
    await page.goto("/film");
    const iframe = page.locator('iframe[title="Returning Sands trailer"]');
    test.skip((await iframe.count()) === 0, "trailer URL pending — no iframe rendered");

    for (const width of [320, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      const box = await iframe.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width / box!.height).toBeCloseTo(16 / 9, 1);
    }
  });
});

test.describe("Team grid", () => {
  for (const [width, expected] of [
    [1024, 4],
    [640, 2],
    [375, 1],
  ] as const) {
    test(`${expected} column(s) at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/team");
      const grid = page.locator("main ul.grid").first();
      await expect(grid).toBeVisible();
      expect(await columnCount(grid)).toBe(expected);
    });
  }
});

test.describe("Donate panels", () => {
  const panelGrid = (page: Page) => page.locator("main .grid").filter({ has: page.locator("#donate-us") }).first();

  test("side by side at 768px", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 900 });
    await page.goto("/donate");
    expect(await columnCount(panelGrid(page))).toBe(2);
  });

  test("stacked at 375px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 900 });
    await page.goto("/donate");
    expect(await columnCount(panelGrid(page))).toBe(1);
  });
});

test.describe("Copy buttons", () => {
  // The <dl> with the Copy buttons renders only when all three core bank
  // fields in content/donate.ts are present (filled 2026-10-01).

  test("Copy → Copied with clipboard permission granted", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/donate");

    const button = page.getByRole("button", { name: /^Copy Sort code$/ });
    await button.click();
    await expect(page.getByRole("button", { name: /^Copied Sort code$/ })).toBeVisible();
    await expect(page.getByRole("status").filter({ hasText: /couldn't copy/i })).toHaveCount(0);
    await expect(button).toHaveText("Copy", { timeout: 4000 });
  });

  test("failed clipboard write shows the inline status message and keeps the value visible", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText: () => Promise.reject(new Error("denied")) },
      });
    });
    await page.goto("/donate");

    const value = page.locator("main dl dd span.select-all").first();
    const text = await value.innerText();
    await page.getByRole("button", { name: /^Copy Account name$/ }).click();

    await expect(page.getByRole("status").filter({ hasText: /couldn't copy automatically/i })).toBeVisible();
    await expect(value).toHaveText(text);
  });
});
