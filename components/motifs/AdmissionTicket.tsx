import Image from "next/image";
import { resolveAsset } from "@/lib/assets";
import { isPending, present, type Pending } from "@/lib/pending";
import type { EmailProviderConfig, MuseumContent } from "@/lib/types";

// Ticket-styled email signup for the Virtual Museum (Req 9). Server component.
//
// Zero-backend: when the Email_Provider Placeholder is populated the ticket is
// a plain `<form method="post">` that posts straight to the provider's hosted
// endpoint with native `type="email" required` validation (9.1, 9.2, 9.5). No
// provider script is ever loaded (9.7). While the Placeholder (or its action
// URL) is empty the ticket renders a `<div>` instead of a form, a disabled
// input and the text "Ticket desk opening soon" where the button would be, so
// it cannot be submitted by mouse, keyboard or Enter (9.4). The privacy note
// names the provider when known, otherwise the "to be confirmed" wording
// (17.10, 17.11). Two instances on `/museum` need distinct `id`s.
export function AdmissionTicket({
  config,
  id,
  copy,
  className = "",
}: {
  config: Pending<EmailProviderConfig>;
  /** Unique per instance — used for the label/input pairing. */
  id: string;
  copy: MuseumContent["ticket"];
  className?: string;
}) {
  const asset = resolveAsset("admissionTicket");
  const live = present(config) && !isPending(config.actionUrl) ? config : null;

  const background =
    asset.kind === "designer" ? (
      <Image
        src={asset.src}
        alt=""
        aria-hidden="true"
        fill
        sizes="(min-width: 768px) 640px, 100vw"
        className="pointer-events-none object-cover"
      />
    ) : null;

  const field = (
    <div className="relative flex flex-col gap-1">
      <label htmlFor={id} className="font-mono text-xs uppercase tracking-[0.18em]">
        {copy.label}
      </label>
      <input
        id={id}
        name={live ? live.emailFieldName : "email"}
        type="email"
        required
        autoComplete="email"
        disabled={!live}
        className="border border-ink bg-sand-50 px-3 py-2 font-mono text-sm text-ink disabled:cursor-not-allowed disabled:opacity-60"
      />
    </div>
  );

  const stub = (
    <div className="relative flex flex-col justify-center gap-2 border-s-2 border-dashed border-ink ps-5 md:w-56">
      <span aria-hidden="true" className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-nile-700">
        tear here
      </span>
      {live ? (
        <button
          type="submit"
          className="border border-ink bg-ochre-500 px-4 py-2 font-mono text-sm font-semibold uppercase tracking-[0.12em] text-sand-50 hover:bg-ochre-600"
        >
          {copy.buttonLabel}
        </button>
      ) : (
        <p className="font-mono text-sm font-semibold uppercase tracking-[0.12em]">Ticket desk opening soon</p>
      )}
    </div>
  );

  const note = (
    <p className="relative text-xs leading-relaxed text-nile-700">
      {live ? `${copy.privacyNote} Handled by ${live.provider}.` : copy.privacyNoteProviderTbc}
    </p>
  );

  const shell = `perf relative overflow-hidden border border-ink bg-sand-100 p-5 text-ink ${className}`;
  const layout = "flex flex-col gap-4 md:flex-row md:items-stretch";

  const body = (
    <>
      {background}
      <div className={layout}>
        <div className="flex flex-1 flex-col gap-3">
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em]">Admission ticket</span>
          {field}
          {note}
        </div>
        {stub}
      </div>
    </>
  );

  // Only the wrapper differs: a real form when the provider is configured,
  // an inert <div> (no action, no submit control) while it is pending.
  return live ? (
    <form method="post" action={live.actionUrl} className={shell}>
      {Object.entries(live.hiddenFields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      {body}
    </form>
  ) : (
    <div className={shell}>{body}</div>
  );
}
