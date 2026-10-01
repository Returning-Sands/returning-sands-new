import { AdmissionTicket } from "@/components/motifs/AdmissionTicket";
import { museum } from "@/content/museum";
import { site } from "@/content/site";

// Compact mailing-list signup for the Support page: the same Admission_Ticket
// (same Email_Provider Placeholder, same copy, same consent checkbox) with a
// different small-caps heading, so the two signups can never diverge in
// provider, consent wording or privacy note. One instance per page; the id is
// fixed because /support renders exactly one.
export const MAILING_LIST_HEADING = "Join the mailing list";
export const MAILING_LIST_TICKET_ID = "ticket-support";

export function MailingListTicket({ className = "" }: { className?: string }) {
  return (
    <AdmissionTicket
      config={site.pending.emailProvider}
      id={MAILING_LIST_TICKET_ID}
      copy={museum.ticket}
      heading={MAILING_LIST_HEADING}
      className={className}
    />
  );
}
