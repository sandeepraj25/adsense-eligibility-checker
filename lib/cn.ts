/** Tiny class joiner — keeps component APIs clean without a dependency. */
export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
