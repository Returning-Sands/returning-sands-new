// Structured-data block (Req 16.10 to 16.12). Server component.
//
// `data` is built from Content_Files at build time (lib/jsonld.ts), never from
// user input, so serialising it straight into the script body is safe.
export function JsonLd({ data }: { data: object }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
