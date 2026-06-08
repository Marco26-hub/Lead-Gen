/**
 * Renders a server-side <script type="application/ld+json"> so crawlers and AI
 * answer engines can read the structured data without executing JS.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // schema.org JSON-LD is trusted, app-generated content.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
