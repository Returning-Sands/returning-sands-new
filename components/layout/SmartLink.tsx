import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { isExternalHref } from "@/lib/links";
import { ExternalLink } from "./ExternalLink";

// Picks the right anchor for an href (Req 1.10):
//   - external host      -> <ExternalLink> (new tab + affordance)
//   - mailto:            -> plain <a> (opens the mail client; not "external")
//   - everything else    -> next/link client-side navigation
type SmartLinkProps = Omit<ComponentPropsWithoutRef<"a">, "href" | "target" | "rel"> & {
  href: string;
  children: ReactNode;
};

export function SmartLink({ href, children, ...rest }: SmartLinkProps) {
  if (isExternalHref(href)) {
    return (
      <ExternalLink href={href} {...rest}>
        {children}
      </ExternalLink>
    );
  }
  if (href.startsWith("mailto:")) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} {...rest}>
      {children}
    </Link>
  );
}
