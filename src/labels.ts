import type { Labels } from "./types.js";

const RUNNING_CLOCK = new Set(["forfeitable_clock_running", "obligation_clock_running"]);
const MISSING_DATE = "A running clock needs a deadline date; none was located.";

/** A clock that is already running and has no date is undeterminable. A dated clock is unchanged. */
export function requireRunningClockDate(labels: Labels, deadlineDate: string | null | undefined): Labels {
  if (!RUNNING_CLOCK.has(labels.urgency)) return labels;
  if (deadlineDate && /^\d{4}-\d{2}-\d{2}$/.test(deadlineDate)) return labels;
  const prior = labels.missing_fact?.trim();
  const missing_fact = prior && prior.includes(MISSING_DATE) ? prior : [prior, MISSING_DATE].filter(Boolean).join("; ");
  return { ...labels, urgency: "undeterminable", missing_fact };
}
