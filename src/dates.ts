/** Calendar arithmetic in UTC. The model supplies the anchor and the day count; this only adds. */
export function shiftDate(anchor: string, days: number, direction: "before" | "after"): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(anchor) || !Number.isInteger(days) || days < 0) return null;
  const parsed = Date.parse(`${anchor}T00:00:00Z`);
  if (Number.isNaN(parsed)) return null;
  const sign = direction === "before" ? -1 : 1;
  return new Date(parsed + sign * days * 86_400_000).toISOString().slice(0, 10);
}
