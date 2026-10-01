"use client";

import { useEffect, useRef, useState } from "react";

// Clipboard copy control for the UK bank details (Req 12.11, 12.13). The only
// client component on /donate.
//
// On activation writes `value` via `navigator.clipboard.writeText`; on success
// the visible label flips to "Copied" for 2000 ms, then back to "Copy". If the
// write rejects (no permission, insecure context, no Clipboard API) an inline
// `role="status"` live region (mounted empty from the start) tells the visitor
// to select the text instead — the
// value itself stays visible in the adjacent <dd>, this component never hides
// it. `label` names the field so the accessible name is "Copy Sort code", not
// a bare "Copy" repeated three times.
export const COPY_FAILED_MESSAGE = "Couldn't copy automatically — select the text to copy it.";
export const COPIED_RESET_MS = 2000;

const BUTTON =
  "inline-flex min-h-[44px] min-w-[44px] items-center justify-center border border-ink bg-transparent px-3 py-1 font-mono text-xs uppercase tracking-wider text-ink hover:bg-sand-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nile-800";

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear any pending revert if the component unmounts mid-countdown.
  useEffect(() => {
    return () => {
      if (timer.current !== null) clearTimeout(timer.current);
    };
  }, []);

  async function copy() {
    try {
      if (typeof navigator === "undefined" || !navigator.clipboard) {
        throw new Error("Clipboard API unavailable");
      }
      await navigator.clipboard.writeText(value);
      setFailed(false);
      setCopied(true);
      if (timer.current !== null) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        setCopied(false);
        timer.current = null;
      }, COPIED_RESET_MS);
    } catch {
      setCopied(false);
      setFailed(true);
    }
  }

  const text = copied ? "Copied" : "Copy";

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button type="button" onClick={copy} aria-label={`${text} ${label}`} className={BUTTON}>
        {text}
      </button>
      {/* Always mounted so assistive tech registers the live region before it
          ever changes; empty until a write fails (Req 12.13). */}
      <span role="status" className="font-mono text-xs text-stamp-700">
        {failed ? COPY_FAILED_MESSAGE : null}
      </span>
    </span>
  );
}
