import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";

import "./globals.css";
import { Footer } from "@/components/layout/Footer";
import { SkipLink } from "@/components/layout/SkipLink";
import { TopNav } from "@/components/layout/TopNav";
import { JsonLd } from "@/components/seo/JsonLd";
import { site } from "@/content/site";
import { display, mono } from "@/lib/fonts";
import { organizationSchema } from "@/lib/jsonld";
import { SITE_URL } from "@/lib/metadata";
import { validateAll } from "@/lib/validate";

// Build-time content gate (Req 3.8, 4.7, 7.5, 8.7, 10.10, 14.8, 16.14, 20.8):
// every route renders through this layout, so a content error throws here and
// stops `next build` with one readable message listing every problem.
validateAll();

// Every route is prerendered (Req 19.2). `"error"` makes `next build` fail if
// any component reaches for a Request-time API instead of silently turning the
// route dynamic. Requires `cacheComponents` to stay off (docs/NEXT16_NOTES.md,
// item 6).
export const dynamic = "error";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Child pages set complete titles via `pageMetadata()`, so the template is a
  // passthrough; `default` covers any segment without its own title.
  title: { template: "%s", default: site.pages.home.title },
  description: site.description,
};

// Removes the `no-js` hook as early as possible so the CSS fallbacks
// (`.no-js .nav-inline`, `.no-js .reveal`) only apply when scripts are off
// (Req 19.8). Static string, no user input.
const NO_JS_SCRIPT = "document.documentElement.classList.remove('no-js')";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`no-js ${display.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_JS_SCRIPT }} />
      </head>
      <body className="grain min-h-screen bg-sand-50 font-display text-ink antialiased">
        <SkipLink />
        <header>
          <TopNav />
        </header>
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <footer>
          <Footer />
        </footer>
        <JsonLd data={organizationSchema(site)} />
        <Analytics />
      </body>
    </html>
  );
}
