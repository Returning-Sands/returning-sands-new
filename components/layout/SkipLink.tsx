// "Skip to content" link (Req 15.4). Server component.
//
// Rendered first inside <body> so it is the first focusable element on every
// Page. Visually hidden until focused; `#main` is `<main id="main" tabIndex={-1}>`
// in app/layout.tsx so activating the link really moves focus into <main>.
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-sand-50 focus:text-ink focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:outline-2 focus:outline-offset-2 focus:outline-nile-800"
    >
      Skip to content
    </a>
  );
}
