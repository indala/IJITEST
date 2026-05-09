import { useId } from 'react';

interface JsonLdProps {
  data: Record<string, unknown>;
  id?: string;
}

/**
 * A reusable component for injecting JSON-LD structured data into the page.
 * This is a key requirement for Generative Engine Optimization (GEO).
 * Rendered on the server for maximum SEO compatibility.
 */
export function JsonLd({ data, id }: JsonLdProps) {
  const generatedId = useId();
  return (
    <script
      id={id || generatedId}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
