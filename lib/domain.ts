/**
 * Loose host validation for the demo input. Accepts what people
 * actually paste: bare domains, www, full URLs, trailing paths.
 */
export function normalizeDomain(raw: string): string | null {
  const input = raw.trim().toLowerCase();
  if (!input) return null;

  const withoutScheme = input.replace(/^https?:\/\//, "");
  const host = withoutScheme.split(/[/?#]/)[0].replace(/^www\./, "");

  // At least one dot, valid label characters, a 2+ char TLD.
  const ok = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/.test(
    host,
  );

  return ok ? host : null;
}
