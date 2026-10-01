/**
 * PaperTexture — intentional no-op (Req 13.7, 13.10).
 *
 * The paper-grain texture is implemented purely in CSS: the `.grain` class in
 * `app/globals.css` paints an SVG `feTurbulence` noise layer through a
 * `::after` pseudo-element (data URI, so no image request), with
 * `pointer-events: none` and `mix-blend-mode: multiply`. A pseudo-element is
 * never exposed to the accessibility tree, which satisfies the
 * `aria-hidden` intent of Req 13.10 without any DOM node.
 *
 * The root layout (Task 4) applies `grain` to `<body>`, so the texture covers
 * every Page without each page having to mount anything. This component
 * exists so the motif list in the design doc is complete and so a future
 * Designer_Asset texture could be wired in behind the same import without
 * touching any Page (Req 13.8). Until then it renders nothing.
 *
 * Usage note: if a section needs its own grain layer (for example a dark
 * panel), add the `grain` class to that element rather than rendering this
 * component.
 */
export function PaperTexture(): null {
  return null;
}
