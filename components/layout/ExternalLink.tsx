import type { ComponentPropsWithoutRef, ReactNode } from "react";

// External link (Req 1.10). Server-safe.
//
// Always adds `target="_blank" rel="noopener noreferrer"`, a small inline SVG
// arrow (decorative, `aria-hidden`) adjacent to the link text, and a
// screen-reader-only " (opens in new tab)" suffix. When the caller supplies
// `aria-label` (icon links in the Footer) that label becomes the accessible
// name and must itself include "(opens in new tab)".
type ExternalLinkProps = Omit<ComponentPropsWithoutRef<"a">, "href" | "target" | "rel"> & {
  href: string;
  children: ReactNode;
};

export function ExternalLink({ href, children, className, ...rest }: ExternalLinkProps) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className} {...rest}>
      {children}
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 16 16"
        width="0.75em"
        height="0.75em"
        className="ms-1 inline-block align-baseline"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 12 12 4M6 4h6v6" />
      </svg>
      <span className="sr-only"> (opens in new tab)</span>
    </a>
  );
}
