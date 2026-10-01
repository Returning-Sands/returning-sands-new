"use client";

import Link from "next/link";
import { useRef, useState, type KeyboardEvent } from "react";

import type { NavItem } from "@/lib/types";
import { useFocusTrap } from "./useFocusTrap";

// Collapsed Top_Nav for viewports narrower than `md` (Req 1.6, 1.7, 15.7, 15.8).
//
// Renders the "Menu" button and, while open, `<ul id="mobile-menu">` with the
// same seven links in the same order as the inline list. The Home wordmark and
// the Donate_CTA live in TopNav's bar, outside this collapsible region.
//
// - Escape closes and refocuses the button inside the same keydown handler.
// - Activating a link closes and refocuses the button.
// - useFocusTrap wraps Tab / Shift+Tab between the button and the last link.
//
// Without JavaScript the button is inert and the inline list is shown via the
// `.no-js .nav-inline` CSS fallback (Req 19.8), so nothing here is required
// for the links to be reachable.
type MobileMenuProps = { items: NavItem[]; current: string | null };

export function MobileMenu({ items, current }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  useFocusTrap(containerRef, open);

  function closeAndRefocus() {
    setOpen(false);
    buttonRef.current?.focus();
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape" && open) {
      e.preventDefault();
      closeAndRefocus();
    }
  }

  return (
    <div ref={containerRef} className="relative md:hidden" onKeyDown={onKeyDown}>
      <button
        ref={buttonRef}
        type="button"
        aria-label="Menu"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-11 w-11 items-center justify-center border border-ink text-ink hover:bg-sand-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nile-800 md:hidden"
      >
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        >
          {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

      {open && (
        <ul
          id="mobile-menu"
          className="absolute right-0 top-full z-40 mt-2 flex min-w-56 flex-col border border-ink bg-sand-50 p-2 shadow-lg"
        >
          {items.map((item) => {
            const isCurrent = current === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isCurrent ? "page" : undefined}
                  onClick={closeAndRefocus}
                  className={`block px-3 py-2 font-mono text-sm uppercase tracking-wider text-ink hover:bg-sand-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nile-800 ${
                    isCurrent ? "underline decoration-2 underline-offset-4" : ""
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
