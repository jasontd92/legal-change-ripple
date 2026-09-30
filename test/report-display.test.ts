import assert from "node:assert/strict";
import { test } from "node:test";
import {
  categoriesPresent,
  categoryLabel,
  changeDate,
  changeLabel,
  clockChip,
  companyDocumentLabel,
  documentIdentity,
  groupLabel,
  legalLabel,
  matchesRecency,
  moneyMark,
  quoteExcerpt,
  responseLabel,
  splitWhat,
  tidySection,
  whenDetail,
} from "../src/report-display.js";

test("purchase order and terms read as a counterparty, not a path", () => {
  const po = documentIdentity("supply/purchase-orders/PO-2025-0419_keystone-plumbing-supply_2025-04-21");
  assert.equal(po.line, "Keystone Plumbing · PO 0419 · Apr 21, 2025");
  assert.equal(
    companyDocumentLabel(
      "corpus/documents/supply/supplier-terms/keystone-plumbing-supply_terms-and-conditions-of-sale_2019-10-22.md",
      "3. PRICE",
    ),
    "Keystone Plumbing · Terms · §3 Price",
  );
});

test("an invoice code does not replace the counterparty", () => {
  const row = documentIdentity("supply/invoices/KPS-417-601877_keystone-plumbing-supply_2025-09-24");
  assert.equal(row.line, "Keystone Plumbing · Invoice · Sep 24, 2025");
});

test("employment file keeps the person and drops the state code", () => {
  const row = documentIdentity("employment/signed-agreements/delia-kilgore_training-repayment-agreement_ca_2026-02-09");
  assert.equal(row.line, "Delia Kilgore · Training repayment · Feb 9, 2026");
});

test("change file becomes the instrument and the date", () => {
  assert.equal(
    changeLabel("corpus/triggers/TR-01-copper-section-232/2025-02-25_eo-14220-investigation.txt"),
    "EO 14220 · Feb 25, 2025",
  );
  assert.equal(
    changeLabel("corpus/triggers/TR-03-adcvd-copper-pipe-mexico/2026-09-21_preliminary-results.txt"),
    "ADCVD Copper Pipe Mexico · Sep 21, 2026",
  );
});

test("section numbers stay short", () => {
  assert.equal(tidySection("3. PRICE"), "§3 Price");
  assert.equal(tidySection("§3.2 Automatic Renewal Terms"), "§3.2 Automatic Renewal Terms");
});

test("money mark prefers the of-pair over the company total", () => {
  const why = "Copper is 38% of the Company's $31M annual material spend, and on this PO copper-bearing lines are $16,220 of $26,330 (62%).";
  assert.equal(moneyMark(why), "$16.2k of $26.3k");
  assert.equal(moneyMark("Exposure is about $31M."), "$31M");
  assert.equal(moneyMark("No figures here."), null);
});

test("clock language distinguishes no date from an unknown date", () => {
  assert.deepEqual(clockChip("no_clock", "undeterminable"), { label: "No deadline", hot: false, tone: "none" });
  assert.deepEqual(clockChip("undeterminable", "undeterminable"), { label: "Deadline unknown", hot: false, tone: "none" });
  assert.deepEqual(clockChip("obligation_clock_running", "2026-11-01 (12 day(s) from 2026-10-01; inside the 30-day window)"), {
    label: "Nov 1, 2026",
    hot: true,
    tone: "act",
  });
  assert.deepEqual(clockChip("clock_pending", "2027-06-30"), { label: "Due Jun 30, 2027", hot: false, tone: "ahead" });
  assert.equal(whenDetail("undeterminable", "undeterminable", "Deadline unknown"), null);
  assert.equal(whenDetail("obligation_clock_running", "2026-11-01 (12 day(s) from 2026-10-01)", "Nov 1, 2026"), null);
  assert.equal(whenDetail("no_clock", "Would apply at shipment if a duty is imposed.", "No deadline"), "Would apply at shipment if a duty is imposed.");
});

test("enums become the counsel vocabulary", () => {
  assert.equal(categoryLabel("cost_exposure"), "Cost");
  assert.equal(groupLabel("exposure"), "Costs you");
  assert.equal(groupLabel("recovery"), "You can recover");
  assert.equal(responseLabel("monitor"), "Watch");
  assert.equal(responseLabel("no_action"), null);
  assert.equal(legalLabel("in_force"), "In force");
  assert.equal(legalLabel("undeterminable"), null);
});

test("recency is how recently the change landed, measured from the as-of date", () => {
  const asOf = "2026-10-01";
  const recent = changeDate("corpus/triggers/TR-02/2026-09-02_cbp-ieepa-duty-refunds-page.txt");
  const lastYear = changeDate("corpus/triggers/TR-01/2025-02-25_eo-14220-investigation.txt");
  assert.equal(recent, "2026-09-02");
  assert.equal(matchesRecency(recent, asOf, "week"), false);
  assert.equal(matchesRecency(recent, asOf, "days30"), true);
  assert.equal(matchesRecency(recent, asOf, "year"), true);
  assert.equal(matchesRecency(lastYear, asOf, "year"), false);
  assert.equal(matchesRecency(null, asOf, "year"), false);
  assert.deepEqual(
    categoriesPresent([
      { category: "cost_exposure" },
      { category: "deadline_bound_obligation" },
      { category: "cost_exposure" },
    ]),
    ["deadline_bound_obligation", "cost_exposure"],
  );
});

test("a citation stays whole unless another sentence is waiting", () => {
  const short = "All prices are subject to change. Duties are in addition to quoted prices.";
  assert.deepEqual(quoteExcerpt(short), { lead: short, more: false });
  const long = `${"Alpha sentence. ".repeat(20)}Omega sentence is the rest.`;
  const cut = quoteExcerpt(long, 80);
  assert.equal(cut.more, true);
  assert.match(cut.lead, /Alpha sentence\.$/);
  assert.equal(cut.lead.includes("Omega"), false);
});

test("the row keeps the first sentence and the rest opens underneath", () => {
  const split = splitWhat("EO 14220 orders an investigation. Any resulting duty is the buyer's cost.");
  assert.equal(split.lead, "EO 14220 orders an investigation.");
  assert.equal(split.rest, "Any resulting duty is the buyer's cost.");
});
