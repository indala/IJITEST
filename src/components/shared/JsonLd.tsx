
interface JsonLdProps {
  data: Record<string, any>;
  id?: string;
}

/**
 * A reusable component for injecting JSON-LD structured data into the page.
 * This is a key requirement for Generative Engine Optimization (GEO).
 * Rendered on the server for maximum SEO compatibility.
 */
export function JsonLd({ data, id }: JsonLdProps) {
  return (
    <script
      id={id || `json-ld-${Math.random().toString(36).slice(2, 11)}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
