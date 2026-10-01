# Next.js 16 verification notes

Source of truth: the docs bundled with the installed version, `node_modules/next/dist/docs/01-app/` (Next `16.3.8`, React `19.2.8`, see `package.json`). Each item below mirrors the ten-point "Next.js 16 verification checklist" in `design.md`. **Where this file says "Corrected", later tasks follow this file, not the design text.**

Files read (names differ slightly from the task list):

- `02-guides/upgrading/version-16.md`
- `01-getting-started/14-metadata-and-og-images.md`, `01-getting-started/13-fonts.md`, `01-getting-started/11-css.md`
- `03-api-reference/03-file-conventions/01-metadata/{opengraph-image,sitemap,robots}.md`
- `03-api-reference/03-file-conventions/not-found.md`
- `03-api-reference/03-file-conventions/02-route-segment-config/index.md` (+ `dynamicParams.md`)
- `02-guides/caching-without-cache-components.md` (this is where `dynamic` is now documented)
- `02-guides/building.md` (route table legend), `04-glossary.md` (Request-time APIs)
- `03-api-reference/04-functions/{generate-metadata,image-response,use-pathname,generate-static-params}.md`
- `03-api-reference/02-components/{font,image}.md`
- `03-api-reference/05-config/03-eslint.md`, `03-api-reference/08-turbopack.md`, `03-api-reference/05-config/01-next-config-js/cacheComponents.md`
- `02-guides/testing/vitest.md`, `02-guides/testing/playwright.md`
- Plus the Next source `node_modules/next/dist/lib/metadata/resolve-metadata.js` for one point the docs leave open (item 1d).

Summary: 8 confirmed, 2 corrected (items 6 and 8), plus a few sharp edges to carry into later tasks.

---

## 1. Metadata API — CONFIRMED (one point confirmed from source, not docs)

- `export const metadata: Metadata` (static) and `export async function generateMetadata({ params }, parent: ResolvingMetadata): Promise<Metadata>` from `layout.tsx` / `page.tsx`. Server Components only. A segment may export one or the other, not both.
- `params` is a `Promise`: `const { city } = await params`. Synchronous access is fully removed in 16 (`version-16.md`, "Async Request APIs").
- `metadataBase: new URL(SITE_URL)` in the root layout; relative URL fields in child segments are composed against it. A relative URL field without `metadataBase` is a **build error**. Duplicate slashes are normalised.
- Emitted tags (from `generate-metadata.md`):
  - `alternates.canonical: string` → `<link rel="canonical" href="…">`
  - `openGraph.{title,description,url,siteName,type,images[]}` → `og:*` metas; `images[].url` must be absolute or resolvable via `metadataBase`.
  - `twitter.{card,title,description,images}` → `twitter:*` metas; `card: "summary_large_image"` is valid.
  - `robots: { index: false, follow: false }` → `<meta name="robots" content="noindex, nofollow">`.
  - `title: { template: "%s | Returning Sands", default: "Returning Sands" }` in root layout; `default` is required when `template` is set.
- File-based metadata (`opengraph-image.tsx`, `icon.svg`) **overrides** the `metadata` object for the same field, so co-located OG files win over `openGraph.images`. Do not also set `openGraph.images` in `pageMetadata()` or the two will fight; leave it to the file convention (design already does this).
- Optional type helpers: `npx next typegen` generates global `PageProps<'/campaign/[city]'>` / `LayoutProps<…>`.

**1d. Can `app/not-found.tsx` export `metadata`?** The docs only document `metadata` for the experimental `global-not-found.js`. Confirmed from source instead: `resolve-metadata.js` → `collectMetadata()` loads the `not-found` module via `getComponentTypeModule(tree, 'not-found')` and reads its `metadata` / `generateMetadata` export (`errorMetadataItem`). So `export const metadata = pageMetadata("notFound", "/404", { noindex: true })` in `app/not-found.tsx` works. Belt-and-braces: Next also injects `<meta name="robots" content="noindex">` automatically on any 404 response, so the 404 is noindexed even if the export were ignored.

## 2. `opengraph-image.tsx` — CONFIRMED (with two sharp edges)

- Import: `import { ImageResponse } from 'next/og'`.
- Exports: `export const alt = '…'`, `export const size = { width: 1200, height: 630 }`, `export const contentType = 'image/png'`, `export default async function Image({ params })` returning a `Response` (`ImageResponse` satisfies it).
- `params` is `Promise<{ city: string }>` in `app/campaign/[city]/opengraph-image.tsx` and `undefined` in static segments. Await it.
- Fonts: `new ImageResponse(jsx, { ...size, fonts: [{ name, data: ArrayBuffer, weight: 400, style: 'normal' }] })`. Read the file once at module scope (`const buf = await readFile(join(process.cwd(), 'public/fonts/…'))`, top-level await is fine) — docs call this "predictable values". `readFileSync` from the Old_Site also works but the docs' pattern is `node:fs/promises`.
  - **Sharp edge:** `ImageResponse` supports only `ttf`, `otf`, `woff` — **not `woff2`**. `@fontsource/*` packages ship woff2 + woff; use the `.woff` files (or a `.ttf`) for the share cards.
  - **Sharp edge:** 500 KB bundle cap per image route (JSX + fonts + embedded images). Keep the background PNG and the font subset small; the 300 KB output budget in the design is separate from this input cap.
- Local background image: read as base64 and pass `src={`data:image/png;base64,…`}` (ArrayBuffer `src` also works but needs `@ts-expect-error`).
- Static or not: "By default, generated images are statically optimized (generated at build time and cached) unless they use Request-time APIs or uncached data." `params` is not a request-time API, so with `generateStaticParams()` on the sibling `page.tsx` returning the three cities, the three city images prerender. Without `cacheComponents`, the route table should show `○` for them. Verify in the task-9 build output.
- `opengraph-image` is a specialised Route Handler and accepts the same route segment config as pages (so `dynamic = "error"` on the root layout covers it).

## 3. `not-found.tsx` — CONFIRMED

- `app/not-found.tsx` handles every unmatched URL app-wide and renders **inside the root layout** (Top_Nav + Footer come for free, Req 1.9). Takes no props. Default is a Server Component.
- `global-not-found.js` is experimental (`experimental.globalNotFound`), bypasses the layout, and is **not needed** here.
- Status code: `404` for non-streamed responses, `200` when the response is already streaming (plus an injected `noindex` meta). Our pages are fully static with no `loading.tsx` / Suspense, so the prerendered `/_not-found` is served with a real `404`. Still verify with `curl -I` on the Vercel preview (task 20).
- The build legend shows `○ /_not-found` as a normal static route.

## 4. `sitemap.ts` / `robots.ts` — CONFIRMED

- `import type { MetadataRoute } from 'next'`.
- `export default function sitemap(): MetadataRoute.Sitemap` → `Array<{ url: string; lastModified?: string | Date; changeFrequency?: 'always'|'hourly'|'daily'|'weekly'|'monthly'|'yearly'|'never'; priority?: number; alternates?; images?: string[]; videos? }>`.
- `export default function robots(): MetadataRoute.Robots` → `{ rules: { userAgent?: string|string[]; allow?: string|string[]; disallow?: string|string[]; crawlDelay?; other? } | Array<…>; sitemap?: string | string[]; host?: string }`.
- Both are special Route Handlers, cached/static by default unless they touch a Request-time API. `lastModified: new Date()` in the docs' own example does not make it dynamic.
- `generateSitemaps` `id` is now `Promise<string>` — we do not use it.

## 5. `next/font` — CONFIRMED

- `next/font/google` option names: `weight`, `style`, `subsets`, `axes`, `display`, `preload`, `fallback`, `adjustFontFallback`, `variable`. `next/font/local`: `src` (string or `Array<{ path, weight?, style? }>`), `weight`, `style`, `display`, `preload`, `fallback`, `adjustFontFallback`, `variable`, `declarations`.
- Checked the bundled type list (`next/dist/compiled/@next/font/dist/google/index.d.ts`): both `Bitter` (variable; `weight` optional, `style: 'normal' | 'italic'`) and `IBM_Plex_Mono` (**`weight` is required**, `'100'…'700'`) exist. Design's `IBM_Plex_Mono({ weight: ['400','600'], … })` and `Bitter({ weight: ['400','700'], style: ['normal','italic'], … })` are valid.
- Google fonts are downloaded **at build time** and self-hosted; no browser request goes to Google. The build machine needs network access for the first fetch (Vercel does).
- `localFont({ src: '../public/fonts/AVRO-Regular.woff2' })` paths resolve relative to the calling file; a missing file is a build error (design's "AVRO flag on but file missing" row holds).
- `variable: '--font-display'` returns `NextFontWithVariable`; apply `.variable` className on `<html>`/`<body>` and reference `var(--font-display)` in `@theme inline`.

## 6. Static rendering — CORRECTED (name is right, location and caveat changed)

- **The API name `export const dynamic = "error"` is correct** and still valid in 16.3.8. Values: `'auto' | 'force-dynamic' | 'error' | 'force-static'`. `'error'` = "force prerendering … by causing an error if any components use Request-time APIs or uncached data". Applies to `layout.tsx | page.tsx | route.ts`.
- **Correction 1 (documentation location):** `dynamic`, `revalidate`, and `fetchCache` are **no longer listed** in `03-api-reference/03-file-conventions/02-route-segment-config/` (that index now only has `dynamicParams`, `runtime`, `preferredRegion`, `maxDuration`). They are documented in `02-guides/caching-without-cache-components.md#route-segment-config`.
- **Correction 2 (precondition):** `dynamic`, `dynamicParams`, `revalidate`, `fetchCache` are **removed when `cacheComponents: true`** is set in `next.config.ts`. The scaffold's `next.config.ts` is empty (cacheComponents off), and this project must **keep it off**. Add a comment in `next.config.ts` saying so, and do not adopt `'use cache'` / Cache Components for this site.
- `usePathname()` in a `"use client"` component does **not** make a route dynamic: "a Client Component with `usePathname` will be rendered into HTML on the initial page load". Request-time APIs per the glossary are only `cookies()`, `headers()`, `searchParams`, `draftMode()` (plus uncached `fetch`). Caveat from `use-pathname.md`: if the site has `rewrites` or a `proxy.ts`, a prerendered `usePathname` can hydration-mismatch. We have neither (only a `redirects` entry for www, which is not a rewrite). Fine.
- `new Date()` at module level is **not** a Request-time API, so it does not opt the route out of prerendering under the default model. (Only under Cache Components would it be flagged as unpredictable.) The design's build-date footer and `lib/buildInfo.ts` are fine.
- Build output legend (`02-guides/building.md`): `○ (Static)` prerendered as static content; `● (SSG)` prerendered from `generateStaticParams`; `ƒ (Dynamic)` server-rendered per request; `◐` only appears with Cache Components. **Deploy-gate check for every task: no `ƒ` rows.** Note `next build` no longer prints "Size" / "First Load JS" columns — that is why the design uses `size-limit` for the 120 KB budget.

## 7. Linting — CONFIRMED

- `next lint` is removed and `next build` no longer lints. The `eslint` key in `next.config.ts` is removed too (do not add it).
- Install `eslint` + `eslint-config-next`. `@next/eslint-plugin-next` defaults to flat config. Recommended `eslint.config.mjs`:
  ```js
  import { defineConfig, globalIgnores } from 'eslint/config'
  import nextVitals from 'eslint-config-next/core-web-vitals'
  export default defineConfig([
    ...nextVitals,
    globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
  ])
  ```
  Add `eslint-config-next/typescript` alongside for TS rules. Run with `eslint .` (our `"lint"` and `"build"` scripts).
- `@next/next/no-img-element` is on in the recommended set — the `.grain` noise is a CSS data-URI, not an `<img>`, so no conflict; use `next/image` everywhere else as planned.

## 8. `next/image` — CORRECTED (`priority` → `preload`)

- **Correction:** the `priority` prop is **deprecated in 16** in favour of `preload` (`image.md` version history, `v16.0.0`). The docs further say "in most cases, you should use `loading="eager"` or `fetchPriority="high"` instead of `preload`". Decision for later tasks: on the one above-the-fold image per page (the first archival image on `/at-stake`), use `preload` instead of `priority`; everywhere else leave default lazy loading. Grep for `priority=` before each deploy gate.
- Defaults changed in 16 (all confirmed in `version-16.md`):
  - `images.qualities` default is now `[75]`. Any `quality` prop other than 75 is coerced to 75 (dev warns). If a page needs e.g. `quality={90}`, add `images: { qualities: [75, 90] }` to `next.config.ts`; otherwise do not pass `quality`.
  - `images.imageSizes` default dropped `16` → `[32, 48, 64, 96, 128, 256, 384]`. Irrelevant for us.
  - `images.minimumCacheTTL` default is 4 hours (14400 s), was 60 s. Good for static assets.
  - `images.maximumRedirects` default 3; `images.dangerouslyAllowLocalIP` false. Irrelevant (all images local).
  - Local images with a **query string** now require `images.localPatterns[].search`. Do not append `?v=` to `/img/*` or `/deck/*` paths.
  - `images.domains` deprecated → `remotePatterns`. We have no remote images.
  - `next/legacy/image` deprecated; import from `next/image` only.
- `sizes` semantics unchanged: required with `fill` or responsive CSS; without it the browser assumes `100vw` and Next emits a 1x/2x srcset only; with it Next emits the full width-based srcset. Design's "explicit `sizes` on every image" rule stands.

## 9. Turbopack + Tailwind 4 — CONFIRMED

- Turbopack is stable and the default for both `next dev` and `next build`; no `--turbopack` flag needed (the scaffold scripts already omit it). A custom `webpack` key in `next.config.ts` makes the build **fail**; we have none. Opt-out would be `next build --webpack`.
- `experimental.turbopack` → top-level `turbopack` in `next.config.ts` (we need no options). Filesystem caching is on by default for dev and build.
- `08-turbopack.md`: PostCSS is **Supported** — "Automatically processes PostCSS config files (`postcss.config.js`, `.mjs`, …) in a Node.js worker pool. Useful for Tailwind." The scaffold's `postcss.config.mjs` with `"@tailwindcss/postcss": {}` and `@import "tailwindcss"` in `globals.css` is exactly the documented setup (`11-css.md`). No extra config.
- `next dev` and `next build` now use separate output dirs (`.next/dev` vs `.next`) and can run concurrently; a lockfile prevents two builds at once. Relevant if Playwright's `webServer` runs `npm run start` while a dev server is open — it is fine.
- Sass tilde imports are unsupported; we do not use Sass.

## 10. Vitest / Playwright — CONFIRMED (two deltas from the design to carry forward)

- `vitest.md`: install `vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths`. Config file `vitest.config.mts` (the guide uses `.mts`; `.ts` also works):
  ```ts
  import { defineConfig } from 'vitest/config'
  import react from '@vitejs/plugin-react'
  import tsconfigPaths from 'vite-tsconfig-paths'
  export default defineConfig({ plugins: [tsconfigPaths(), react()], test: { environment: 'jsdom' } })
  ```
  - **Delta:** task 1.2's dev-dependency list omits `@testing-library/dom` (a required peer of `@testing-library/react` v16) and `vite-tsconfig-paths` (the guide's way to honour the `@/` alias). Add both in 1.2, or set `resolve.alias` manually in 1.3 as the design describes — either satisfies the guide.
  - The guide warns Vitest cannot render **async** Server Components; test those via Playwright. Our pages are sync Server Components reading `content/*.ts`, so RTL rendering of components is fine; `opengraph-image` default exports are async but return a `Response`, which the design's byte-length test can `await` without rendering React.
  - `npm run test` with plain `vitest` watches; we use `vitest run` in scripts (non-interactive). Good.
- `playwright.md`: `npm init playwright` or manual `@playwright/test`; set `baseURL` and use `webServer` so Playwright boots `npm run start` against the **production build** (the guide recommends testing the built output). Design's `playwright.config.ts` (`webServer: { command: "npm run start", port: 3000 }`, Chromium + 375x667 mobile project) matches. `npx playwright install chromium` for the browser; `install-deps` only on CI Linux.

---

## Carry-forward list (actions for later tasks)

1. **Task 1.2:** also install `@testing-library/dom` and `vite-tsconfig-paths` (pinned). Font files for `ImageResponse` must be `.woff`/`.ttf`, not `.woff2`.
2. **Task 1.3:** `eslint.config.mjs` per item 7; no `eslint` key in `next.config.ts`. Add a comment in `next.config.ts`: `// cacheComponents must stay off: dynamic = "error" (root layout) depends on the classic model.`
3. **Task 4 (root layout):** `export const dynamic = "error"` is correct as written. `metadataBase`, `title.template` + `title.default`.
4. **Task 4 (404):** `app/not-found.tsx` may export `metadata` (confirmed from source); Next also auto-injects `noindex`.
5. **All image tasks:** use `preload` not `priority`; never pass `quality` unless `images.qualities` is extended; no `?query` on local image paths; always set `sizes`.
6. **Share-card tasks:** `readFile` at module scope, `fonts[].data: ArrayBuffer`, `.woff`/`.ttf` only, keep per-route bundle < 500 KB.
7. **Every deploy gate:** route table must contain only `○` / `●` rows, never `ƒ`.
