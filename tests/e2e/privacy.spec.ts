import { expect, test } from "@playwright/test";

// Privacy guarantees (Req 18.3, 18.5, 9.7): no cookies, no storage, no
// third-party requests beyond Vercel Analytics, and no provider script on the
// Virtual Museum page.

const OWN_HOST = /^localhost:3000$/;
const ALLOWED_THIRD_PARTY = [/\.vercel-insights\.com$/, /^vercel\.live$/, /^va\.vercel-scripts\.com$/];

function isAllowedHost(host: string): boolean {
  return OWN_HOST.test(host) || ALLOWED_THIRD_PARTY.some((re) => re.test(host));
}

test.describe("no cookies or storage", () => {
  for (const path of ["/", "/donate"]) {
    test(`${path} sets no cookies and writes nothing to localStorage or sessionStorage`, async ({ page, context }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      expect(await context.cookies()).toEqual([]);

      const storage = await page.evaluate(() => ({
        local: window.localStorage.length,
        session: window.sessionStorage.length,
      }));
      expect(storage).toEqual({ local: 0, session: 0 });
    });
  }
});

test.describe("network requests", () => {
  for (const path of ["/", "/donate"]) {
    test(`every request while loading ${path} goes to the site origin or Vercel Analytics`, async ({ page }) => {
      const hosts = new Set<string>();
      page.on("request", (req) => {
        const url = new URL(req.url());
        if (url.protocol === "http:" || url.protocol === "https:") hosts.add(url.host);
      });

      await page.goto(path);
      await page.waitForLoadState("networkidle");

      const disallowed = [...hosts].filter((h) => !isAllowedHost(h));
      expect(disallowed, `unexpected third-party hosts: ${disallowed.join(", ")}`).toEqual([]);
    });
  }
});

test.describe("/museum", () => {
  test("served HTML contains no <script src> from a third-party host", async ({ request }) => {
    const response = await request.get("/museum");
    expect(response.ok()).toBe(true);
    const html = await response.text();

    const srcs = [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/gi)].map((m) => m[1]);
    const thirdParty = srcs.filter((src) => {
      if (src.startsWith("/") && !src.startsWith("//")) return false; // same-origin relative
      try {
        return !isAllowedHost(new URL(src, "http://localhost:3000").host);
      } catch {
        return true;
      }
    });
    expect(thirdParty, `third-party scripts on /museum: ${thirdParty.join(", ")}`).toEqual([]);
  });
});
