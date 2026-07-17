/**
 * Renders a JSON-LD structured-data block as a <script> tag. The payload is
 * serialised and its `<` characters escaped so no value can break out of the
 * script element (a `</script>` in a string would otherwise close it early);
 * standard JSON-LD hardening. The data is build-time constant, not user input.
 */

interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
