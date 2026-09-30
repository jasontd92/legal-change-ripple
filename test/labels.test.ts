import assert from "node:assert/strict";
import { test } from "node:test";
import { matchFileName } from "../src/citations.js";
import { shiftDate } from "../src/dates.js";
import { requireRunningClockDate } from "../src/labels.js";
import type { Labels } from "../src/types.js";

function labels(urgency: Labels["urgency"]): Labels {
  return { urgency, materiality: "material", direction: "exposure", response_type: "monitor" };
}

test("a running clock without a date becomes undeterminable", () => {
  for (const urgency of ["forfeitable_clock_running", "obligation_clock_running"] as const) {
    const next = requireRunningClockDate(labels(urgency), null);
    assert.equal(next.urgency, "undeterminable");
    assert.match(next.missing_fact ?? "", /deadline date/);
  }
  assert.equal(requireRunningClockDate(labels("forfeitable_clock_running"), "not-a-date").urgency, "undeterminable");
});

test("a hyphen and an underscore basename match when only one file fits", () => {
  const real = "corpus/triggers/TR-03/2026-09-21_preliminary-results.txt";
  const other = "corpus/triggers/TR-03/2026-09-21_final-results.txt";
  assert.equal(matchFileName("preliminary_results", [real]), real);
  assert.equal(matchFileName("preliminary-results", [real]), real);
  assert.equal(matchFileName("preliminary_results", [real, other]), real);
  assert.equal(matchFileName("results", [real, other]), null);
  assert.equal(matchFileName("preliminary_results", [real, real.replace("preliminary-results", "preliminary_results")]), null);
});

test("date_shift counts calendar days in UTC and does not invent a day count", () => {
  assert.equal(shiftDate("2026-12-31", 60, "before"), "2026-11-01");
  assert.equal(shiftDate("2027-01-01", 30, "before"), "2026-12-02");
  assert.equal(shiftDate("2026-10-01", 1, "after"), "2026-10-02");
  assert.equal(shiftDate("12/31/2026", 60, "before"), null);
  assert.equal(shiftDate("2026-12-31", -1, "before"), null);
});

test("a dated running clock and every other urgency stay", () => {
  assert.equal(requireRunningClockDate(labels("forfeitable_clock_running"), "2026-11-01").urgency, "forfeitable_clock_running");
  assert.equal(requireRunningClockDate(labels("obligation_clock_running"), "2026-11-01").urgency, "obligation_clock_running");
  for (const urgency of ["clock_pending", "no_clock", "undeterminable"] as const) {
    assert.equal(requireRunningClockDate(labels(urgency), null).urgency, urgency);
  }
});
