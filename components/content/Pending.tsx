// Visibly marked "not yet available" copy (Req 14.9, 5.3, 6.3, 8.5).
//
// Rendered only where a Placeholder is pending; never alongside real copy.
// Styling lives in the `.pending` rule in app/globals.css (dashed ochre
// border, Mono_Font). `role="note"` lets assistive technology announce it as
// an aside rather than body text.
type PendingProps = { text: string; as?: "p" | "div" };

export function Pending({ text, as: Tag = "div" }: PendingProps) {
  return (
    <Tag className="pending" role="note">
      [{text}]
    </Tag>
  );
}
