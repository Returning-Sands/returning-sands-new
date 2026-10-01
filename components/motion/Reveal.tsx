"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
  type Ref,
} from "react";

// Ported from Old_Site app/Reveal.tsx (Req 13.11, 19.7, 19.8).
//
// Children are ALWAYS rendered into the server HTML — there is no
// conditional rendering here. The component only toggles the `.is-visible`
// class from an IntersectionObserver once hydrated; the fade/rise itself is
// the `.reveal` CSS in app/globals.css. That split is what makes the
// fallbacks work without extra code:
//   - JS disabled: `.no-js .reveal { opacity: 1; transform: none }` shows the
//     content (19.8).
//   - prefers-reduced-motion: the CSS block forces the final state on first
//     paint and zero durations (13.11).
//   - No IntersectionObserver (very old browsers): we add `.is-visible`
//     straight away.
//
// Callers pass `className="reveal"` (or `reveal-lg`) themselves, so the same
// wrapper can also be used with no motion class at all.
//
// `WordStagger` from the Old_Site was NOT ported: its `.headline-stagger` /
// `.word` CSS was dropped from globals.css in Task 2.1 and nothing in the new
// design uses per-word headline animation.

type RevealProps = {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  /** Extra transition delay in ms, for simple staggering. */
  delay?: number;
  threshold?: number;
  /** When true (default) the element stays visible after first entering view. */
  once?: boolean;
  id?: string;
  style?: CSSProperties;
};

export function Reveal({
  as: Tag = "div",
  className = "",
  children,
  delay = 0,
  threshold = 0.15,
  once = true,
  id,
  style,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-visible");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            if (once) io.unobserve(entry.target);
          } else if (!once) {
            entry.target.classList.remove("is-visible");
          }
        }
      },
      { threshold, rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, once]);

  return (
    <Tag
      ref={ref as Ref<HTMLDivElement>}
      id={id}
      className={className}
      style={delay ? { ...style, transitionDelay: `${delay}ms` } : style}
    >
      {children}
    </Tag>
  );
}
