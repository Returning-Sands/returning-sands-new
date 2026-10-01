/**
 * Contact `mailto:` resolution for `/support` (Requirements 11.1, 11.3, 11.10).
 *
 * Pure functions over the content model so the routing rule can be unit- and
 * property-tested without rendering. A named contact only gets its own address
 * once `confirmed` is true; until then mail is routed to the general address
 * while the visible label (name + role) stays unchanged (11.10). The general
 * contact itself is `confirmed: true` in content, so both branches agree there.
 */
import type { Contact, ContactKey } from "./types";

/** `mailto:` target for the general contact address (11.1 "Get in Touch"). */
export function generalMailto(emails: Record<ContactKey, string>): string {
  return `mailto:${emails.general}`;
}

/**
 * `mailto:` target for one contact: its own address iff `confirmed`, otherwise
 * the general address (11.10).
 */
export function mailtoFor(contact: Contact, emails: Record<ContactKey, string>): string {
  return `mailto:${contact.confirmed ? emails[contact.key] : emails.general}`;
}
