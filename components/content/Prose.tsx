// Ordered body copy: one <p> per paragraph, in Content_File order (Req 4.2,
// design.md Property 4). Server component.
export function Prose({ paragraphs, className = "" }: { paragraphs: string[]; className?: string }) {
  return (
    <div className={`flex flex-col gap-4 leading-relaxed ${className}`}>
      {paragraphs.map((text, i) => (
        <p key={i}>{text}</p>
      ))}
    </div>
  );
}
