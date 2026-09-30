import type { ChangeBrief, ReportData } from "./ReportView";
import { diffLines, lineBounds, type ReviewDiff } from "../../src/diff";

const sampleOld = [
  "A business that makes an automatic renewal offer shall provide a notice thirty days before the renewal.",
  "Importers may not recover duties deposited under the emergency tariff authority.",
].join("\n");
const sampleNew = [
  "A business that makes an automatic renewal offer shall provide a notice sixty days before the renewal.",
  "Importers may request a refund of duties deposited under the emergency tariff authority.",
].join("\n");
const sampleLines = lineBounds(sampleNew);

export const sampleDiff: ReviewDiff = {
  kind: "compared",
  old_file: "corpus/triggers/sample/2024-09-24_renewal-notice.txt",
  new_file: "corpus/triggers/sample/2026-09-02_renewal-notice.txt",
  hunks: diffLines(sampleOld, sampleNew),
  lines: sampleLines,
};

export const sampleChanges: ChangeBrief[] = [
  {
    id: "nonrenewal",
    summary: "Notice before an automatic renewal moves from thirty days to sixty.",
    start: sampleLines[0]?.start,
    end: sampleLines[0]?.end,
  },
  {
    id: "refund",
    summary: "A duty that could not be recovered can now be refunded.",
    start: sampleLines[1]?.start,
    end: sampleLines[1]?.end,
  },
  { id: "eo-14220", summary: "EO 14220 orders a Section 232 investigation of copper imports." },
  { id: "header-edit", summary: "Header formatting only." },
];

export const sampleLegal = new Map<string, string>([
  ["eo-14220", "in_force"],
  ["nonrenewal", "in_force"],
  ["refund", "in_force"],
]);

export const sampleReport: ReportData = {
  items: [
    {
      rank: 2,
      stack_id: "customers/valley-medical-center_master-services-agreement_2024-11-01",
      finding_id: "F-notice",
      headline: "Send non-renewal notice to Valley Medical",
      amount: 480000,
      change_ref: "nonrenewal",
      category: "deadline_bound_obligation",
      group: "exposure",
      labels: { urgency: "obligation_clock_running", materiality: "material", direction: "exposure", response_type: "send_notice" },
      what: "The fixed price renews for another year unless Valley Medical gets written notice.",
      why: "Missing the notice locks the 2026 rate. The annual contract is about $480,000.",
      when: "2026-11-01 (31 day(s) from 2026-10-01; outside the 30-day window)",
      citations: {
        trigger: {
          file: "corpus/triggers/sample/2026-09-02_renewal-notice.txt",
          start: sampleLines[0]?.start ?? 0,
          end: sampleLines[0]?.end ?? 0,
          quote: sampleNew.split("\n")[0],
        },
        clause: {
          file: "corpus/documents/customers/valley-medical-center_master-services-agreement_2024-11-01.md",
          start: 0,
          end: 80,
          section_label: "3.2 Automatic Renewal Terms",
          quote: "This agreement renews for successive one-year terms unless either party gives written notice at least sixty days before the renewal date.",
        },
      },
    },
    {
      rank: 10,
      stack_id: "supply/purchase-orders/PO-2025-0419_keystone-plumbing-supply_2025-04-21",
      finding_id: "F-copper",
      headline: "Watch copper duties on the Keystone purchase order",
      amount: 16220,
      change_ref: "eo-14220",
      category: "cost_exposure",
      group: "exposure",
      labels: { urgency: "undeterminable", materiality: "material", direction: "exposure", response_type: "monitor" },
      what: "EO 14220 orders a Section 232 investigation into imports of copper in all forms and directs assessment of whether tariffs or quotas are necessary. Under Keystone's Section 3, any resulting duty is Buyer's cost.",
      why: "Shifts a recurring cost: copper is 38% of the Company's $31M annual material spend, and on this PO copper-bearing lines (HTS 7411 copper tube and HTS 7412 brass fittings) are $16,220 of $26,330 (62%); Sec. 3 also lets Keystone reprice at shipment on the remaining lines.",
      when: "undeterminable",
      rationale: "Deciding fields: urgency=undeterminable; materiality=material; legal_status=in_force.",
      citations: {
        trigger: {
          file: "corpus/triggers/TR-01-copper-section-232/2025-02-25_eo-14220-investigation.txt",
          start: 3669,
          end: 3902,
          quote: "The Secretary of Commerce shall initiate an investigation under section 232 of the Trade Expansion Act to determine the effects on national security of imports of copper in all forms. The investigation shall assess whether tariffs or quotas are necessary. The Secretary shall report the findings to the President within the period set by the Act.",
        },
        clause: {
          file: "corpus/documents/supply/supplier-terms/keystone-plumbing-supply_terms-and-conditions-of-sale_2019-10-22.md",
          start: 1419,
          end: 1661,
          section_label: "3. PRICE",
          quote: "All prices are subject to change unless otherwise specified on Seller's quotation. Buyer will be invoiced at prices in effect at the time of shipment. All taxes, transportation costs, duties and other charges are in addition to quoted prices.",
        },
      },
    },
    {
      rank: 4,
      stack_id: "supply/invoices/KPS-417-601877_keystone-plumbing-supply_2025-09-24",
      finding_id: "F-refund",
      headline: "Claim the duty refund from Keystone",
      amount: 2400,
      change_ref: "refund",
      category: "recovery_opportunity",
      group: "recovery",
      labels: { urgency: "no_clock", materiality: "material", direction: "recovery", response_type: "seek_refund_or_credit" },
      what: "A later refund of the duty would stay with Keystone. The invoice has no pass-back.",
      why: "Duty already paid on this invoice is about $2,400, and nothing in the terms requires Keystone to return it.",
      when: "no clock",
      citations: {
        trigger: {
          file: "corpus/triggers/sample/2026-09-02_renewal-notice.txt",
          start: sampleLines[1]?.start ?? 0,
          end: sampleLines[1]?.end ?? 0,
          quote: sampleNew.split("\n")[1],
        },
        clause: {
          file: "corpus/documents/supply/supplier-terms/keystone-plumbing-supply_terms-and-conditions-of-sale_2019-10-22.md",
          start: 0,
          end: 40,
          section_label: "3. PRICE",
          quote: "All taxes, transportation costs, duties and other charges are in addition to quoted prices.",
        },
      },
    },
  ],
  not_material: [
    { stack_id: "vendors/fieldflow-software-inc_mutual-nondisclosure-agreement_2021-01-11", finding_id: "F-nda", reason: "The change does not reach this nondisclosure agreement." },
  ],
  change_item_closure: [
    { change_ref: "nonrenewal", status: "addressed", reason: "Referenced by a finding." },
    { change_ref: "refund", status: "addressed", reason: "Referenced by a finding." },
    { change_ref: "eo-14220", status: "addressed", reason: "Referenced by a finding." },
    { change_ref: "header-edit", status: "unaddressed", reason: "Dismissed as non-substantive: formatting only." },
  ],
};
