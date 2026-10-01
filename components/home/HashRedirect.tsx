"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { redirectFor } from "@/lib/redirects";

// Old_Site hash redirect (Req 21.10, 21.11). Client component, Home only,
// renders nothing. On mount it reads `window.location.hash`, looks it up in
// `lib/redirects.ts`, and replaces the history entry with the new path so
// `returningsands.org/#donate` lands on `/donate`. Unknown or empty hashes
// are a no-op.
export function HashRedirect() {
  const router = useRouter();

  useEffect(() => {
    const target = redirectFor(window.location.hash);
    if (target) router.replace(target);
  }, [router]);

  return null;
}
