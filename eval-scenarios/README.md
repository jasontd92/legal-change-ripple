**Implementing agent: start at `HANDOFF.md`.** This README is the scenario index it references.

Refreshed 2026-09-29 after corpus revision; §5(b), §5(a) and §8 updated the same day with round-2 legal findings (`legal-questions.md` Q4–Q8).

# Eval Scenarios: Consolidated Index

Consolidation of packages A–E (`A-tariff-supply.md`, `B-tariff-downstream.md`,
`C-noncompete.md`, `D-consumer-controls-trigger-side.md`,
`E-cross-cutting.md`) into one index against `eval-design.md` §4 (invariants
V1–V12), §5 (unit evals by stage), §6 (metamorphic M1–M7), §8 (gap slices),
§9 (run sets). Built by Package Z per `PLAN.md`.

**This refresh (Z2)** applies `CHANGES-2026-09-29.md` (the R1–R3 corpus/
scenario revision pass) and `legal-questions.md` on top of the original Z
consolidation. Every package file now carries its own `## Revision 2026-09-29` section; this file merges those into the index below. Per the
work-package rules, this is a consolidation pass only — corpus documents
were not re-read; all facts are taken from the package files (including
their revision sections) and from `CHANGES-2026-09-29.md` /
`legal-questions.md` as written.

## 1. Overview

### Totals by package (scenario bullets, grep-counted)

**Methodology note:** counts below are recomputed directly from each file's
top-level scenario bullets (`^- **<ID>** · <eval id> · ...`), counted only
in the scenario body of each file (before its `## Gaps` / `## Revision 2026-09-29` sections). The original Z pass used a looser count that also
picked up some non-scenario bullets, so a package with no net add/remove can
still show a different number here than the original table — treat this as
the new baseline, not a like-for-like diff. Per-file deltas are called out
below the table.


| Pkg       | File                                  | Scope                                                                                            | Scenario bullets |
| --------- | ------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------- |
| A         | `A-tariff-supply.md`                  | TR-01/02/03 trigger-side + supply-area S3/S4/LBL                                                 | 39               |
| B         | `B-tariff-downstream.md`              | TR-01/02/03 downstream (customers/subcontracts/corporate/vendors), S5-link, S3, draft tiers, LBL | 37               |
| C         | `C-noncompete.md`                     | TR-10/11/12/13 trigger-side + employment/acquisitions S3/S4/S5-link/LBL                          | 53               |
| D         | `D-consumer-controls-trigger-side.md` | TR-20/21/90, distractors, S0 pairs, S1b profile pairs                                            | 44               |
| E         | `E-cross-cutting.md`                  | V5 operative text, version resolution, template-instance drift, V6/V7, M1/M3/M4/M5/M6/M7, I6     | 60               |
| **Total** |                                       |                                                                                                  | **233**          |


Net content changes from the revision pass (not just recount noise):

- **A:** removed S4-RPS-01 (Riverside no longer in `profile.yaml`); added
S4-GPC-05 (the GPC-INV-26-1912 needs-review sibling).
- **B:** added B37 (Sunpoint renewal-letter chain / legal-status / M1);
no scenario removed.
- **C:** added TR11-S4-06 (IL branch-manager management-exception contrast
case) and TR13-S4-03 (Castellano §10/§12/§13 catalogue, cross-referenced
to Package D's TR-90 scenarios); no scenario removed.
- **D:** added D-TR20-S4-07, D-TR20-S4-08, D-S0-05, D-S1B-09; D-TR20-S4-03
rewritten in place (no longer a removal/add, same ID, new content); no
scenario removed.
- **E:** added E-V5-10, E-V5-11, E-M1-08, E-M1-09; E-V5-09 rewritten in
place (gap-filler → real expired-document case, same ID); no scenario
removed.

### Totals by eval id (approximate, one bullet may satisfy more than one id)


| Eval id              | Approx. count       | Packages                                                        |
| -------------------- | ------------------- | --------------------------------------------------------------- |
| S0                   | 5                   | D (D-S0-01..05); E-I6-01 still flags the same cosmetic-pair gap |
| S1a                  | ~33                 | A, C, D (unchanged in count; several entries reworded/resolved) |
| S1b                  | ~13                 | D (TR90-S1b-01..04 + D-S1B-01..09, now 9 profile pairs)         |
| S3                   | ~16                 | A, B, C, D (unchanged in count; TR-03/TR-90 rows re-scoped)     |
| S4 (2+4, all slices) | ~71                 | A, B, C, D, E (recount; see methodology note)                   |
| LBL (all label sets) | ~19                 | A, B, C (recount; see methodology note)                         |
| S5-link              | ~16                 | B, C, D                                                         |
| S5-R1/R2/R3          | 4 (all still DRAFT) | B, C                                                            |
| V1–V12 (dedicated)   | ~42                 | E (mostly), A/B/C/D incidentally                                |
| M1–M7                | ~41                 | D, E                                                            |
| I6                   | 6                   | E                                                               |


### How to navigate

- Trigger-side legal-change reading (S1a, S0, S1b) for tariffs: `A-tariff-supply.md` §TR-01/02/03. For noncompete/employment: `C-noncompete.md`. For consumer/controls/distractors: `D-consumer-controls-trigger-side.md`.
- Per-stack findings (S4) for tariffs, supply side: `A-tariff-supply.md`. Same triggers, downstream side (customers/subcontracts/corporate/vendors): `B-tariff-downstream.md`. Noncompete-family findings: `C-noncompete.md`. Consumer findings: `D-consumer-controls-trigger-side.md`.
- Cross-stack links (S5-link) and draft priority tiers (S5-R1/R2/R3): mainly `B-tariff-downstream.md` and `C-noncompete.md` (both still explicitly marked DRAFT, pending Jason's validation).
- All invariants (V1–V12), metamorphic evals (M1–M7) and robustness cases (I6): `E-cross-cutting.md`, cross-referencing documents that A/B/C already scoped.
- Every package ends with its own `## Gaps` and `## Revision 2026-09-29` sections; this file's §6 merges the former, §1 and §3 merge the latter.

---

## 2. Coverage matrix

Status: **good** = multiple scenarios incl. positive/negative pairs; **thin**
= 1–2 scenarios or all DRAFT/unresolved; **none** = no dedicated scenario
found (may be exercised incidentally as an `Expected:` field, noted).

### Slices: hop-complete, decoy, absence, version resolution, template-instance, superseded


| Slice                       | Representative scenario IDs (file)                                                                                                        | Count | Status                                                                                          |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----- | ----------------------------------------------------------------------------------------------- |
| Hop-complete                | S4-GPC-01, S4-HPB-01, S4-LWP-01, S4-NCS-01, S4-DSC-01 (A); B04, B23 (B); TR10-S4-01, TR11-S4-01 (C)                                       | ~12   | good                                                                                            |
| Decoy / look-alike          | S4-GPC-02, S4-KPS-02, TR01-06/07 (A); B16, B22 (B); TR10-S4-05, TR11-S4-04, TR12-S4-02 (C); D-TR20-S4-03/04/05/06/08, D-DIST-01/02/04 (D) | ~21   | good — **+1** (D-TR20-S4-08, new two-silo Comfort Club decoy)                                   |
| Absence                     | S4-KPS-01, S4-SCP-01 (A); B10, B13, B27 (B); D-TR20-S4-02 (D); E-V7-01..05 (E, dedicated section)                                         | ~11   | good — B13's absence framing now sits alongside its new "expired, no accrued claim" disposition |
| Version resolution          | S4-KPS-03, S4-NCS-02 (A); D-TR20-S4-07 (D); E-VR-01..05, E-V5-07/08/10/11 (E, dedicated section)                                          | ~12   | good — **+3** (D-TR20-S4-07 CA terms pair; E-V5-10 Sunpoint chain; E-V5-11 GPC invoice split)   |
| Template-instance           | TR10-S4-01 (A/C dup pattern); TR11-S4-01, TR11-S4-06, TR12-S4-01 (C); E-TID-01..05, E-M5-01, E-M7-02 (E, dedicated section)               | ~11   | good — **+1** (TR11-S4-06, management-exception contrast case)                                  |
| Superseded / operative text | TR10-S4-07, TR11-S4-05 (C); E-V5-01..09 (E, dedicated section)                                                                            | ~11   | good                                                                                            |


### S0, S1a, S1b, S3, S4 (top-level slices)


| Slice                       | Scenario IDs (file)                                                                                                                                                                       | Count | Status                                                                                                                                    |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| S0 (diff/normalise)         | D-S0-01..05 (D — 05 is the new CA membership-terms document-side pair); E-I6-01 flags the same gap                                                                                        | 5     | **thin** — no cosmetic-*trigger*-pair file exists yet (D-S0-05 is a document pair, not a trigger pair, so it doesn't close E-I6-01's gap) |
| S1a (understand the change) | A: TR01 01–07, TR02 01–03 + 04/05, TR03-01 (12); C: TR10 01–04, TR11 01–02, TR12-01, TR13 01–02 (9); D: TR20 01–06, TR21 01–03, D-DIST-01/02/04 (12)                                      | ~33   | good                                                                                                                                      |
| S1b (company gate)          | D-TR90 S1b-01..04 (01 now a **positive** result, not a clean gate-exit); D-S1B-01..09 (9 profile pairs, +09 new)                                                                          | ~13   | good                                                                                                                                      |
| S3 (scope)                  | A: S3-01..03 (03 now trigger-confirmed empty); B: B28..B30 (30 now confirmed empty); C: TR10/11/12/13 S3 (7); D: D-TR20-S3-01, D-TR21-S3-01, D-TR90-S3-01 (01 now names §12 specifically) | 16    | good                                                                                                                                      |
| S4 hop-complete north star  | see slice table above                                                                                                                                                                     | —     | good                                                                                                                                      |


### LBL per label set


| Label set     | Scenario IDs (file)                                                                                                                                                                                     | Count         | Status                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------- |
| Urgency       | LBL-urgency-01/02 (A); B35 clock-type (B); TR10-LBL-01, TR11-LBL-01, TR13-LBL-01 (C)                                                                                                                    | 6             | good (unchanged)                                                                               |
| Materiality   | LBL-materiality-01/02 (A); B33 (B); TR10-LBL-02, TR11-LBL-02, TR12-LBL-01 (C)                                                                                                                           | 6             | good — TR10-LBL-03 now split out as its own "undeterminable" label rather than a `-02/03` pair |
| Direction     | LBL-direction-01/02 (A); B34 (B)                                                                                                                                                                        | 3             | **thin** (unchanged)                                                                           |
| Finding_type  | none tagged as a dedicated LBL id — only appears as an `Expected:` field value inside S4 scenarios                                                                                                      | 0 dedicated   | **none** (unchanged)                                                                           |
| Response_type | none tagged as a dedicated LBL id — appears only as an `Expected:` field                                                                                                                                | 0 dedicated   | **none** (unchanged)                                                                           |
| Legal status  | folded into S1a; now also exercises "needs review" as a first-class third value (IL 2022–2024 band, TR11-LBL-02) alongside in force / proposed / expired / vacated-repealed / enacted-not-yet-effective | ~15 (via S1a) | good (via S1a)                                                                                 |


### S5-link, S5-R1/R2/R3


| Eval id                      | Scenario IDs (file)                                                                                                                                                                           | Count | Status                                                                                          |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ----------------------------------------------------------------------------------------------- |
| S5-link                      | B20..B27 (8, incl. positive/negative MFN pair B21/B22, both now with the markup-gap basis); TR10-L1/L2, TR11-L1/L2, TR12-L1, TR13-L1 (C, 6); D-DIST-04; B09/B15 (customer-side half / anchor) | ~16   | good                                                                                            |
| S5-R1/R2/R3 (priority tiers) | **Expanded 2026-09-29 → `priority-tiers-draft.md`**: full tier lists for T1 (TR-01), T2 (TR-02), T3a/T3b (TR-10 at two as-of dates), T4 (TR-12), T5 (TR-14). Supersedes B31, B32, TR10-R1-DRAFT, TR12-R1-DRAFT | ~40 tiered items | good (DRAFT) |


### V1–V12


| Invariant                          | Scenario IDs (file)                                                                                                                         | Count       | Status               |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | -------------------- |
| V1 Schema                          | none — infra-level                                                                                                                          | 0           | **none** (unchanged) |
| V2 Surfaced citations verbatim     | no dedicated scenario                                                                                                                       | 0 dedicated | **none** (unchanged) |
| V3 Citations locate within section | no dedicated scenario                                                                                                                       | 0 dedicated | **none** (unchanged) |
| V4 No truncated exceptions         | none                                                                                                                                        | 0           | **none** (unchanged) |
| V5 Operative text                  | E-V5-01..11 + E-VR-01..05 (16, dedicated section, +2 new: V5-10 Sunpoint chain, V5-11 GPC split); + A S4-GPC-03/05, C TR10-S4-07/TR11-S4-05 | ~20         | good                 |
| V6 Coverage audit                  | E-V6-01..05 (dedicated section)                                                                                                             | 5           | good (unchanged)     |
| V7 Absence backing                 | E-V7-01..05 (dedicated section) + A S4-KPS-01/S4-SCP-01, B B10/B13                                                                          | ~9          | good (unchanged)     |
| V8 Conservation                    | mentioned narratively; no dedicated scenario                                                                                                | 0 dedicated | **thin** (unchanged) |
| V9 Cross-reference closure         | incidental mention only (D-DIST-04)                                                                                                         | 0 dedicated | **none** (unchanged) |
| V10 Change-item closure            | mentioned narratively                                                                                                                       | 0 dedicated | **none** (unchanged) |
| V11 Scope completeness             | supported by the S3 set                                                                                                                     | 16 (via S3) | good (via S3)        |
| V12 Label-rationale agreement      | none                                                                                                                                        | 0           | **none** (unchanged) |


**Added 2026-09-29:** V13 (trigger nexus via `change_ref`) and V14
(negative control: the FCCR covenant finding must not appear in non-tariff
runs), from the priority-tier Q2 decision. Supporting scenarios: B15/B23
(positive, both tariff runs) and every TR-10…TR-21 end-to-end run (negative).

### M1–M7


| Metamorphic                | Scenario IDs (file)                                                                                                                                                                            | Count | Status                    |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ------------------------- |
| M1 (as-of shift)           | E-M1-01..09 (dedicated, +2 new: M1-08 Sunpoint accrued-claim survival, M1-09 five-document active→expired breadth check) + A LBL-urgency-01, C TR10-S1a-01/TR10-S4-02..04, E-VR/V5 as-of pairs | ~16   | good                      |
| M2 (profile swap)          | D-S1B-01..09 (9 pairs, +09 new: revenue_mix vs. CUS-RES-keyed gate check)                                                                                                                      | 9     | good                      |
| M3 (custom-prompt focus)   | E-M3-01/02                                                                                                                                                                                     | 2     | **thin** (unchanged)      |
| M4 (materiality threshold) | E-M4-01/02; B33 also exercises a threshold variant                                                                                                                                             | 3     | **thin** (unchanged)      |
| M5 (scale noise)           | E-M5-01                                                                                                                                                                                        | 1     | **thin/none** (unchanged) |
| M6 (rename/reorder)        | E-M6-01/02; D-S1B-06 (M6-adjacent negative control, now updated for the current 5-entry counterparty list)                                                                                     | 3     | **thin** (unchanged)      |
| M7 (clause removal)        | E-M7-01..07 (one per major plant)                                                                                                                                                              | 7     | good (unchanged)          |


### I6 robustness cases


| Case                                | Scenario ID (file) | Status                                                                                                        |
| ----------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------- |
| Cosmetic-only trigger pair          | E-I6-01            | **still needs construction** — D-S0-05 (new) is a document pair, not a trigger pair, so it doesn't close this |
| Duplicate trigger fed twice         | E-I6-02            | proposed, deterministic to run                                                                                |
| Unparseable/corrupted file          | E-I6-03            | proposed, needs a corrupted copy of `CORP-CREDIT-01`                                                          |
| Injected tool error                 | E-I6-04            | proposed, needs harness support                                                                               |
| Kill/restart mid-run                | E-I6-05            | proposed — infra/harness test                                                                                 |
| Embedded instructions in a document | E-I6-06            | proposed, needs a planted sentence                                                                            |


All six I6 cases are still **designed but not yet built**; E's revision pass
reviewed this section against the 2026-09-29 changes and found nothing to
correct — none of the changes touch an I6 candidate document.

---

## 3. Scenario sets per trigger (for integration run set B)

"Conflicting relevant-stack sets" notes where two packages scoped the same
trigger differently. All three conflicts flagged in the prior pass are now
**resolved** — see §4.


| Trigger                                                      | Trigger-side (S0/S1a/S1b)                                                | Scope (S3)                                                                                              | Findings (S4) + links (S5)                                                                                                                                                                                                                                                                                                                                                                                           | Conflicting stack sets?                                                                                                                                                                                                                                                                                           |
| ------------------------------------------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **TR-01** (§232 copper)                                      | A: S1a-TR01-01..07; D: D-DIST-01/02 (distractors), D-S0-01/02            | A: S3-01 (supply); B: B28 (downstream)                                                                  | A: S4-GPC-01/02/03/04/05, HPB-01/02, KPS-01/02/03, LWP-01/02, NCS-01/02, DSC-01/02, SCP-01 (RPS-01 removed); B: B01–B18 (customers/subcontracts/corporate), B20–B27, B37 (links/legal-status); E: V5-05/06/11, V7-01..05, M1-06/07, M7-01/03/06                                                                                                                                                                      | **Resolved.** GPC's post-§122-expiry surcharge is now split into GPC-INV-26-1911 (clean overcharge, HTS 7403 excluded from every §232 annex) and GPC-INV-26-1912 (HTS 7412 fittings, needs-review sibling). A's S4-GPC-03/05, B's B24, and E's V5-11 now describe the same two-invoice fact pattern consistently. |
| **TR-02** (IEEPA/§122/refunds)                               | A: S1a-TR02-01..03, 04/05                                                | A: S3-02 (supply, narrower than TR-01); B: B29 (downstream)                                             | A: S4-HPB-01/02, GPC-03/05, KPS-01; B: B14/15 (credit covenant), B20/B24/B25 (links); E: V5-06/09/11, VR-01..04, M1-07                                                                                                                                                                                                                                                                                               | Complementary, not conflicting — A covers supply-side IOR/refund eligibility, B covers downstream covenant/pass-through effects.                                                                                                                                                                                  |
| **TR-03** (AD/CVD copper pipe, Mexico)                       | A: S1a-TR03-01 (now cites the trigger's own `role: control` declaration) | A: S3-03 (**empty**, trigger-confirmed control); B: B30 (**now also empty**, reconciled to A's finding) | **None anywhere in the corpus** — TR-03 remains a pure scope/precision (true-negative) trigger by design, with a monitor-note caveat for Keystone/Lakeshore shipment-date pricing.                                                                                                                                                                                                                                   | **Resolved.** `meta.yaml` now declares TR-03 `role: control`; both A's S3-03 and B's B30 state the relevant-stack set is empty. No S4 direct-hit exists or is expected — this is intended design, not an open gap (see §6).                                                                                       |
| **TR-10** (WA ESHB 1155)                                     | C: TR10-S1a-01..04; D: D-S0-03, D-S1B-01 (profile pair)                  | C: TR10-S3-01/02                                                                                        | C: TR10-S4-01..07 (S4-02 now split into a live/expired pair, no longer a matched metamorphic pair), TR10-L1/L2, TR10-R1-DRAFT, TR10-LBL-01..03; E: TID-01, M1-01/02, M7-02, M3-01                                                                                                                                                                                                                                    | None found.                                                                                                                                                                                                                                                                                                       |
| **TR-11** (IL construction noncompete)                       | C: TR11-S1a-01/02; D: D-S0-04                                            | C: TR11-S3-01/02                                                                                        | C: TR11-S4-01 (now the resolved 3-tier band: pre-2022 unaffected / 2022–2024 needs-review / post-2025 void), TR11-S4-02, TR11-S4-03..05, TR11-S4-06 (new contrast case), TR11-L1/L2, TR11-LBL-01/02; E: TID-02                                                                                                                                                                                                       | None found.                                                                                                                                                                                                                                                                                                       |
| **TR-12** (CA AB 692 stay-or-pay)                            | C: TR12-S1a-01                                                           | C: TR12-S3-01                                                                                           | C: TR12-S4-01 (Haverford leg now a settled should-not-flag decoy), TR12-S4-02, TR12-S4-03 (Castellano relocation clause, now doubly not-affected), TR12-S4-04, TR12-L1, TR12-R1-DRAFT, TR12-LBL-01/02; E: M1-03, M7-07, TID-04; D: D-S1B-03                                                                                                                                                                          | None found; D-S1B-03 remains a cross-reference, not a conflicting scope call.                                                                                                                                                                                                                                     |
| **TR-13** (FTC rule removal + Rollins)                       | C: TR13-S1a-01/02                                                        | C: TR13-S3-01/02                                                                                        | C: TR13-S4-01/02, TR13-S4-03 (new — Castellano §10/§12/§13 catalogue, explicitly cross-referenced to D's TR-90 scenarios rather than silently dropped); TR13-L1, TR13-LBL-01/02; E: TID-03, V6-02/04                                                                                                                                                                                                                 | None found.                                                                                                                                                                                                                                                                                                       |
| **TR-20** (CA AB 2863)                                       | D: D-TR20-S1a-01..06                                                     | D: D-TR20-S3-01                                                                                         | D: D-TR20-S4-01..08 (03 rewritten around the real CA auto-renewal pair; 07 version-resolution, 08 two-silo decoy, both new)                                                                                                                                                                                                                                                                                          | None (only D covers TR-20).                                                                                                                                                                                                                                                                                       |
| **TR-21** (FTC negative-option ANPRM)                        | D: D-TR21-S1a-01..03                                                     | D: D-TR21-S3-01                                                                                         | D: D-TR21-S4-01..03                                                                                                                                                                                                                                                                                                                                                                                                  | None (only D covers TR-21).                                                                                                                                                                                                                                                                                       |
| **TR-90** (controls: SB 699, AB 1076, WY SF 107, TX SB 1318) | D: D-TR90-S1b-01..04                                                     | D: D-TR90-S3-01 (now names Castellano §12 specifically)                                                 | **D-TR90-S1b-01 is now the S4-level finding**: CA SB 699 reclassified from control to **positive trigger** — Nadia Castellano's §12 post-employment employee non-solicit is the real, material `AMN`-line finding; §10 confirmed a decoy. AB 1076 (D-TR90-S1b-02) stays a control on its own ground. C's TR13-S4-03 catalogues the same document and cross-references these D scenarios instead of duplicating them. | **Resolved.** The dropped D→C handoff is closed: D built the finding itself and D-TR90-S1b-01/02 no longer defer to "Package C."                                                                                                                                                                                  |


---

## 4. Cross-package conflicts and duplicates

### Resolved 2026-09-29

1. **GPC post-§122-expiry surcharge — resolved.** `CHANGES-2026-09-29.md` §A5
  splits the former single ambiguous invoice into `GPC-INV-26-1911`
   (copper tube from imported cathode, HTS 7403.11, not §232-covered — a
   clean overcharge once Proc. 11012/§122 expired 2026-07-24) and
   `GPC-INV-26-1912` (copper press couplings, HTS 7412.10, §232-covered —
   a genuine needs-review case pending the HTS 7412 Annex-placement VERIFY,
   §7). A's S4-GPC-03 (rewritten) and S4-GPC-05 (new), B's B24 (rewritten),
   and E's V5-11 (new) now all describe the same two-invoice split
   consistently — no remaining disagreement.
2. **TR-03 relevant-stack set — resolved.** `corpus/triggers/TR-03-adcvd-copper-pipe-mexico/meta.yaml`
  now declares `role: control` with an explicit `expected_relevance` note.
   A's S3-03 and B's B30 both now state the set is empty (B30 previously
   listed CRT/HRP-MSA/TPB as low-confidence candidates; that has been
   pruned). TR-03 is confirmed as a pure scope/precision trigger — see §6
   for why this is treated as by-design, not a gap.
3. **TR-90 stack-level handoff — resolved.** D no longer defers CA SB
  699/AB 1076 analysis to "Package C." Per `legal-questions.md` Q2,
   D-TR90-S1b-01 now builds the finding directly (Castellano §12
   reclassifies SB 699 as a positive trigger); D-TR90-S1b-02 restates AB
   1076's control status on independent grounds (notice deadline predates
   the one exposed CA agreement). C's new TR13-S4-03 catalogues the same
   document for TR-13 purposes and explicitly cross-references D's TR-90
   scenarios rather than silently dropping the CA-law exposure.

No package's revision section reported a *new* conflict (each ends "New
conflicts found: none").

### Still open (carried forward, unchanged by this revision)

1. **Duplicate near-identical decoy pattern** — A's S4-KPS-02 (HTS
  8481/8419 wrongly attributed to §232 copper duty) and D's
   D-TR20-S4-06/D-TR21-S4-02 (B2B direction-reversal batch) both test
   "right-looking document, wrong scope axis," different axes. No action
   needed, just noted so it isn't re-invented.
2. **Northaire's "not subject to decrease" ratchet** is still asserted, not
  verified, as contractually binding in three places (A S4-NCS-01, B B26,
   and the VERIFY backlog #6, §7). Neither package's revision touched this.
3. **Lakeshore's blended 9%/4% notice** is still simultaneously "resolved
  enough" for a hop-complete finding (A S4-LWP-01) and "too ambiguous to
   cleanly scope" (B S3-02, A's own Gaps). Unaffected by this revision;
   still a later gold-builder's framing choice, most likely: hop-complete
   for the 4% tariff-linked line only, needs-review for the rest.

---

## 5. Realism flags

### (a) Corpus defects and mismatches

**Resolved 2026-09-29:**


| Issue                                                                                                       | Resolution                                                                                                                                                                                                                   |
| ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Riverside Pipe & Supply Co. named in `profile.yaml` with zero documents                                     | Removed from `profile.yaml` entirely (with Clearpath, FleetCard); A's S4-RPS-01 removed                                                                                                                                      |
| CA "membership-terms" files carried `auto_renewal` roles but held only SMS/TCPA text                        | Replaced with a real June 2024 / August 2026 auto-renewal pair (`CA_RENEW_2024`/`CA_RENEW_2026`); D-TR20-S4-03 rewritten, D-TR20-S4-07/08 and D-S0-05 added                                                                  |
| No document-level `expired` status in the manifest                                                          | 12 documents now carry `status_at_as_of: expired` at 2026-10-01 (Crestline, Sunpoint, Tacoma lease, Lakemont, 3 NDAs, both Delmont quotes, etc.); E-V5-09 rebuilt around the Tacoma lease, E-V5-10 around the Sunpoint chain |
| Proc. 10962 HTS Annex was image-only, unverifiable from source text                                         | A machine-readable scope note now exists and is fully transcribed/checked; A's S1a-TR01-02 and S4-KPS-02 cite it directly                                                                                                    |
| Sunpoint MSA narrated its own future renewals in present tense (2021 document "recording" 2024/2025 events) | Renewals moved into a proper cluster of dated renewal/expiration-notice letters; §5 renumbered (5.3–5.6); work order re-dated; B37/E-V5-10 built on the corrected chain                                                      |


**Still open:**


| Issue                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Where                                                                     | Note                                                                                                                                                           |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **TR-90's `meta.yaml` still labels SB 699 a control.** The scenario files (D-TR90-S1b-01, this README) now correctly treat SB 699 as a positive trigger, but the corpus trigger metadata itself was not updated to match — a builder reading only `meta.yaml` would still see it framed as a clean no-op.                                                                                                                                                              | `corpus/triggers/TR-90-.../meta.yaml`                                     | Needs a corpus edit. **Updated round 2:** AB 1076 is also not a clean control (CA technician §6.1 employee non-solicit, 5 instances signed before 2024-02-14). Only WY SF 107 and TX SB 1318 remain controls.                                                                |
| **Castellano's `relocation_repayment` manifest tag is misleading.** TR12-S4-03 confirms the relocation clause (§3, $30,000) is a flat, unconditional payment with no repayment/clawback/tenure condition anywhere in the text — there is no stay-or-pay term here at all, only a tag that implies one.                                                                                                                                                                 | `nadia-castellano_offer-letter-and-piia...` manifest entry                | Not affected by TR-12 either way (also pre-cutoff), but the tag should be renamed or annotated so it stops implying a repayment obligation that doesn't exist. |
| **Two CA Comfort Club price regimes exist side by side** — the standalone membership terms ($21.95/month, compliant post-revision) and the residential installation agreement's bundled §6 Comfort Club clause ($19.95/month, still exposed per D-TR20-S4-01). D-TR20-S4-08 scenario-izes this as an intentional two-silo decoy (don't merge the two into one compliance conclusion), but it hasn't been confirmed as an intended trap vs. an authoring inconsistency. | D-TR20-S4-08                                                              | Needs Jason's confirmation the two-price split is deliberate design, not drift.                                                                                |
| **HTS 7412 (fittings) placement in Procs 11021/11032 is UNVERIFIED**, along with the residential-HVAC HTS codes in 11032's temporary reduced tier — the sole remaining pieces of the former "HTS Annex is image-only" gap, now narrowed after 10962 was resolved.                                                                                                                                                                                                      | A (S1a-TR01-04/05), also gates GPC-INV-26-1912's needs-review disposition | **Round 2, partial:** web research confirms 7412 is within 11021 (Annex I-A 50% / I-B 25% split) and 11032's 15% residential HVAC tier from 2026-06-08; the annex placement is still unconfirmed (CBP CSMS 68253075 controls). No gold depends on it.         |
| **"Rafael Underhill" is used for two different fictional people** (a TX technician, 2023, and a WA retention-bonus/service-manager case, 2025) — confirmed harmless per `CHANGES-2026-09-29.md` §A7, but still not confirmed as an intentional cross-stack identity link vs. coincidental name reuse.                                                                                                                                                                  | E-TID-05/M7-05                                                            | Round 2: confirmed two documents: `signed-agreements/rafael-underhill_technician-employment-agreement_tx_2023-10-20.md` and `rafael-underhill_retention-bonus-agreement_2025-04-01.md` (WA resident). Rename one in the generator unless a relocation/identity link is intended.                                                                                                           |
| CORP-CREDIT-01/-02 vs -03/-04 section-numbering mismatch (§6.20 vs §8.15 for the same covenant)                                                                                                                                                                                                                                                                                                                                                                        | E (V5-01)                                                                 | Unaffected by this revision; still a corpus seam, build gold on the ratio/date, not the section number.                                                        |
| Prime contracts absent for Titan Peak (TxDOT) and Lakemont (Naperville Library) flow-downs                                                                                                                                                                                                                                                                                                                                                                             | B (B12/B13/B27)                                                           | Lakemont's subcontract is now separately confirmed **expired**, but that doesn't substitute for the missing prime contract — the absence gap is unchanged.     |
| KPS importer-of-record status never stated                                                                                                                                                                                                                                                                                                                                                                                                                             | B (B25)                                                                   | Unaffected by this revision.                                                                                                                                   |
| No clean cosmetic-only trigger pair for the I6 formatting-noise test                                                                                                                                                                                                                                                                                                                                                                                                   | D, E (D-S0 series, E-I6-01)                                               | D-S0-05 is a *document*-side pair, not a trigger pair, so it does not close this. Still needs a synthetic reformatted trigger-file copy.                       |


### (b) Legal questions — Resolved (non-attorney reference)

The legal-judgment questions previously listed here as open were researched
and settled in `legal-questions.md` (2026-09-29). These are **non-attorney
reference**, not legal advice — see that file for full reasoning and
sources.

- **Q1 (IL PA 103-0921 / CA AB 692 retroactivity):** both are prospective
only. CA AB 692 is settled cleanly by the statute's own text (before
2026-01-01 → not affected; on/after → affected). IL PA 103-0921 is most
defensibly prospective (covenants signed on/after 2025-01-01 → void), but
the 2022-01-01–2024-12-31 band is a genuine textual ambiguity and should
gold as **needs review**, not a guess in either direction. Applied to C's
TR11-S4-01 (three-tier band) and TR12-S4-01 (settled decoy).
- **Q2 (Castellano §10 vs §12 vs §13):** §10 (in-term duty not to compete)
is enforceable — a decoy, not a §16600 covenant. §12 (one-year
post-employment employee non-solicit) is the real finding, likely void
under *AMN Healthcare v. Aya*. §13 (trade-secret-limited customer
non-solicit) is a decoy. This is the fact that reclassifies TR-90's SB
699 from control to positive trigger (D-TR90-S1b-01) and drives C's new
TR13-S4-03 and TR12-S4-03.
- **Q3 (Northbrook Commons vs. Sunpoint MFN "comparable Services"):** most
likely yes; the **markup gap** (labor PW+42% vs. PW+34%; materials
cost+15% vs. cost+12%) is the primary basis, not the surcharge waiver.
Gold = affected/needs-review, never "not affected." Applied to B02, B09,
B21.

**Round 2 (2026-09-29): remaining questions, resolved or deferred.** Full
reasoning in `legal-questions.md` Q4–Q8.

| Question | Outcome | Gold direction |
|---|---|---|
| KPS PO-2025-0231 clause conflict (E-VR-01) | **Deferred [JASON]**: not decidable at high confidence | Exclude from gold; if kept, pass only if the agent does *not* assert a settled answer |
| TX silence on price adjustment (E-M7-06) | **Deferred [JASON]**: same | Same |
| WA RCW 49.62: customer non-solicit with "accept" (Gemma Northcott, `CUST_NONSOLICIT`) | A clause barring *acceptance* of customer business is a **noncompetition covenant** under both current and post-2027 WA law, not a non-solicit | **TR10-S4-05 is not a decoy** → affected (void from 2027-06-30; notice by 2027-10-01) |
| WA RCW 49.62: training repayment (`TRAINING_REPAY`, Gavin Ingersoll) | The post-2027 §(3)(d) forfeiture sweep plus the §(3)(e)(vi) carve-out; the plant fails all three carve-out conditions (24 months from completion, pro rata over 24, no good-cause release) | TR10-S4-03 → affected at as-of ≥ 2027-06-30 (pass = affected or needs review) |
| IL PA 103-0921: customer non-solicit | Expressly a "covenant not to solicit" | Void for construction employees per the Q1 signing-date bands |
| IL PA 103-0921: training repayment (Dmitri Rosales) | IL's forfeiture definition requires "competitive activities"; the plant triggers on resignation regardless | **TR11-S4-04 confirmed decoy** (not affected) |
| Northbrook "commercial customer" / scale | The profile lists CUS-NBC as an "Illinois commercial maintenance customer"; the MFN has no volume qualifier | Unchanged: affected |
| AB 1076 for Castellano §12 | Signed 2024-05-06, after the 2024-02-14 notice cutoff → no notice duty; exposure is SB 699 | Unchanged |
| **AB 1076 as a control (new finding)** | The CA technician template and all 6 instances have **§6.1, a one-year post-employment employee non-solicit**. 5 instances predate 2024-02-14 | **AB 1076 is not a clean control** → the 5 pre-deadline instances = needs review; SB 699 → template + all 6 instances affected (2024-04-07 instance clearest). Clean TR-90 controls are now only WY SF 107 and TX SB 1318 |
| HTS 7412 tier under 11021; 11032 residential HVAC lines | Partial: 7412 is within 11021 (Annex I-A 50% vs I-B 25% split); 11032's 15% residential HVAC tier from 2026-06-08 confirmed. **Annex placement still unconfirmed** (CSMS 68253075 is the controlling list) | GPC-INV-26-1912 stays needs review; build no gold on the 7412 tier |

**Round 2 correction applied:** B03 (Valley Medical) urgency is now **forfeitable clock running**: §3.2 non-renewal notice due 2026-11-01, or the fixed price auto-renews through 2027.

**Scenario corrections: APPLIED 2026-09-29.** C: TR10-S4-05 flipped, TR10-S4-03 and TR11-S4-04 resolved. D: §3 reworked into TR-14 + TR-90; new D-TR14-S4-01/02/03. E: E-VR-01 and E-M7-06 excluded; E-TID-05 rewritten for Ingrid Falkner. The corpus items below are also done (`CHANGES-2026-09-29.md` §E). Original list, kept for reference:
- `C` TR10-S4-05: decoy → affected. Update Expected, Realism and Verify
  (confirm Northcott's earnings against the current WA threshold for the
  pre-2027 status).
- `C` TR10-S4-03: resolve VERIFY → affected from 2027-06-30. Cite
  RCW 49.62.010(3)(d) and (3)(e)(vi).
- `C` TR11-S4-04: resolve VERIFY → confirmed decoy.
- `D` TR-90 scenarios (D-TR90-S1b-01/02, D-TR90-S3-01): AB 1076 → not a
  clean control. Add S4 scenarios for the CA technician template §6.1 and
  its six instances (SB 699: affected; AB 1076: needs review for the five
  pre-2024-02-14 instances); §6.2 as a decoy.
- `E` E-VR-01 and E-M7-06: mark **excluded from gold (deferred,
  low-confidence)**. If retained, score abstention only.
- Corpus: TR-90 `meta.yaml` should name only WY SF 107 and TX SB 1318 as
  controls.

### (c) Acceptable simplifications / well-designed traps (no action needed)

Unaffected by this revision. Designed decoy pairs (B06/B22 CA-vs-TX MFN
non-trigger; A S4-GPC-02 Metals Adjustment vs. tariff surcharge; D D-DIST-01
aluminum-vs-copper proclamation), genuine judgment calls a real GC would
also face (B04 Harborview lump-sum carve-out; A S4-GPC-03's original
right-clause/wrong-currency-of-facts trap, now resolved but still a good
teaching example), and known corpus-authoring trade-offs already called out
as intentional (E V6-01's 442k-char credit agreement; TR02-01's 352k-char
SCOTUS opinion) remain working as designed.

---

## 6. Gaps rollup

Merged and deduplicated from all five package `## Gaps` sections plus their
`## Revision 2026-09-29` updates, ranked by impact.

### Closed 2026-09-29

- ~~TR-90 stack-level handoff dropped~~ — D built the finding itself
(D-TR90-S1b-01); C cross-references it (TR13-S4-03). See §4.
- ~~TR-03 has no S4 direct-hit scenario~~ — now explicitly documented as
**intentional**: TR-03 is a scope/precision-only trigger (empty gold set,
trigger-declared `role: control`), not a missing direct-hit. No further
action needed beyond what A/B already did.
- ~~No document-level `expired` status in the manifest~~ — 12 documents now
carry `status_at_as_of: expired`; E-V5-09/10 and B01/B02/B13 built on real
expired documents.
- ~~Riverside Pipe & Supply named with zero documents~~ — removed from
`profile.yaml`.
- ~~CA membership-terms manifest tag mismatch~~ — real auto-renewal terms
now exist (D-TR20-S4-03/07/08).
- ~~PA 103-0921 / AB 692 retroactivity unconfirmed~~ — settled by
`legal-questions.md` Q1.
- ~~Proc. 10962 HTS Annex image-only~~ — machine-readable scope note added.

### Tier 1 — an eval currently has zero support


| Gap                                                                     | Impact                                                                                                                  | Proposed fix                                                          |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| **16 CFR 425 text absent from corpus** (only the 2026 ANPRM is present) | TR-21's only real S4 finding (D-TR21-S4-01) rests on a secondary description, weakening V2/V3 citation-fidelity testing | Add the current 16 CFR 425 text (or at least its definitions section) |
| **No clean cosmetic-only trigger pair for I6**                          | E-I6-01 still can't be built; D-S0-05 (new) is a document pair and doesn't substitute                                   | Construct one synthetic reformatted copy of an existing trigger file  |


### Tier 2 — an eval exists but gold can't be finalized without a fact lookup


| Gap                                                                                                                                                             | Impact                                                                                                                 | Proposed fix                                                                                                     |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **HTS 7412 (fittings) Annex placement in Procs 11021/11032, and 11032's residential-HVAC reduced-tier codes** — the narrowed remainder of the old HTS-Annex gap | Blocks finalizing GPC-INV-26-1912's needs-review disposition (A S4-GPC-05) and every downstream fittings-line scenario | Targeted read of the OCR'd 11021/11032 scope note plus the primary Annex text                                    |
| **WA/IL current-year noncompete earnings thresholds not in corpus**                                                                                             | TR10-S4-01, E-TID-01 can only be scored "undeterminable" without an out-of-corpus number                               | Add a footnote/addendum with the current adjusted figure, or keep "undeterminable" as the deliberate gold answer |
| **Prime contracts absent** for Titan Peak (TxDOT federal-aid) and Lakemont (Naperville Library) flow-down subcontracts                                          | B12/B13/E-V7-03 stay permanent-absence findings even though Lakemont is now separately confirmed expired               | Add at least one Prime Contract excerpt with a price-adjustment clause                                           |
| **KPS importer-of-record status never stated**                                                                                                                  | B25's refund-chain gap can't resolve who can file for a CBP refund                                                     | Add an IOR statement to KPS master terms or a sample customs entry                                               |
| **Northaire's ratchet clause not verified as contractually binding** vs. a unilateral dealer bulletin                                                           | A S4-NCS-01, B26                                                                                                       | Check the actual Authorized Dealer Agreement / T&Cs text                                                         |
| **Cascade Ridge's 21-day escalation-clock start date** unresolved                                                                                               | B11/E-M1-06's $61,380 REA can't be scored forfeited-or-live                                                            | Locate the actual notice date in the corpus text                                                                 |
| **GPC's actual Tariff-Charges activation date** unresolved (distinct from the now-resolved invoice-split question)                                              | E-M1-07's 30-day activation window                                                                                     | Locate the date GPC began invoicing at the elevated rate                                                         |
| **CUS-WADES-01 / EMP-OFFER-CA-2024 exact clause headings/positions** not yet located by a first-pass grep                                                       | E-V6-05's two coverage-audit candidates can't be built at all                                                          | Targeted read to locate Price Ceiling / Non-Competition-Relocation clauses                                       |
| **Rollins FTC consent order exact terms** not verified                                                                                                          | TR13-S1a-02/TR13-S4-02's enforcement-posture framing                                                                   | Read the actual proposed order                                                                                   |


### Tier 3 — breadth gaps and lower-priority items

- No dollar-level itemization behind the FCCR compliance-certificate's
$1,140,000 aggregate (B23).
- RSMeans/CCI index update cadence is an external fact not in the corpus
(B08).
- No customer-side invoice reprices after the §122 surcharge's 2026-07-24
expiry other than the GPC supply-side invoice (B24).
- No CA-equivalent auto-renewal statute for WA/IL/TX (D) — correct as a
scope call, flagged as breadth, not a defect.
- No dedicated antitrust/no-poach trigger for the B2B no-hire clauses
(NDA_NOHIRE, NOHIRE_OAKRIDGE) (C) — optional, low priority.
- Franchise agreement full text (ACQ-05) and the Rollins consent order
specifics not read verbatim in Package C's pass — ties into the VERIFY
backlog (§7) rather than a standalone corpus gap.
- No WY presence beyond the trigger text itself — D-S1B-08 can only be
exercised at the company-gate level without a planted WY employment
document.
- Employment-instance generator's WA boundary case (`rate = 61.50`) not
resolved to actual employee names (E-M5-01) — a one-command grep closes
this.
- Castellano's `relocation_repayment` tag mismatch (see §5a) — cosmetic
manifest fix, no scenario blocked.

---

## 7. VERIFY backlog

### Count per file (grep-counted, case-insensitive `VERIFY` occurrences, whole file)


| File                                | VERIFY occurrences |
| ----------------------------------- | ------------------ |
| A-tariff-supply.md                  | 44                 |
| B-tariff-downstream.md              | 28                 |
| C-noncompete.md                     | 60                 |
| D-consumer-controls-trigger-side.md | 12                 |
| E-cross-cutting.md                  | 96                 |
| **Total**                           | **240**            |


The raw count rose slightly (220 → 240) even though several load-bearing
items were settled this pass, because the new/rewritten scenarios
(TR11-S4-06, TR13-S4-03, D-TR20-S4-07/08, E-V5-10/11, E-M1-08/09, B37) each
carry their own narrower VERIFY notes (per-instance IFWA compliance, exact
notice dates, etc.) in place of the old blanket ones they replaced.

### Settled and dropped from the top list this pass

- ~~PA 103-0921 retroactivity~~ — settled, `legal-questions.md` Q1.
- ~~AB 692 retroactivity~~ — settled, `legal-questions.md` Q1.
- ~~Statutory definition of "construction employee" under PA 103-0921~~ —
settled in practice: the management/engineering/design/sales/owner
exception applies throughout per Q1, and TR11-S4-02/S4-06 now build on it.
- ~~Whether Castellano's §10 is a §16600 covenant~~ — settled,
`legal-questions.md` Q2 (no; §12 is the real finding instead).
- ~~Proc. 10962 HTS scope~~ — settled, scope note transcribed and checked.
- ~~Riverside profile/corpus inconsistency~~ — settled, removed from
profile.

### The ~10 most consequential remaining (a whole scenario's gold answer turns on these)

1. **HTS 7412 (fittings) Annex placement in Procs 11021/11032**, and the
  residential-HVAC codes in 11032's reduced tier — decides A S4-GPC-05's
   needs-review disposition and every downstream fittings-line-attribution
   scenario. (Narrowed continuation of the old GPC-rate item: the
   clean-overcharge leg, GPC-INV-26-1911, no longer depends on this.)
2. **Current (2026) RCW 49.62.020 WA noncompete earnings threshold dollar
  figure** — decides C TR10-S4-01 and E-TID-01.
3. **Which clause governs KPS PO-2025-0231's "as published October 2019"
  vs. "terms as in effect on date of shipment" conflict**, plus the PO's
   actual ship date — decides E-VR-01.
4. **Whether the TxDOT federal-aid Prime Contract gives Titan Peak any
  price-adjustment flow-down** — decides B12/E-V7-03.
5. **Who is importer of record on Keystone Plumbing Supply shipments** —
  decides B25's refund-chain-gap finding.
6. **Whether Northaire's Authorized Dealer Agreement/T&Cs contain a binding
  no-decrease/ratchet clause**, vs. a unilateral dealer-bulletin assertion
   — decides A S4-NCS-01 and B26.
7. **The actual notice date that starts Cascade Ridge's 21-day
  escalation-request clock** — decides the $61,380 REA (B11/E-M1-06).
8. **The date GPC actually began paying the elevated Tariff Charges** —
  decides the 30-day surcharge-activation window in E-M1-07 (distinct from
   the now-resolved 1911/1912 split).
9. **Exact clause headings/positions in `CUS-WADES-01` (Price Ceiling) and
  `EMP-OFFER-CA-2024` (Non-Competition/Relocation)** — decides whether
   E-V6-05's two candidates can be built as scenarios at all.
10. **Exact terms of the proposed Rollins FTC consent order** — decides
  whether TR13-S1a-02/TR13-S4-02's enforcement-posture framing is
    accurate.

All ten require either a targeted full-text read the package authors
flagged as skipped for time, or a real-world/out-of-corpus fact lookup
(items 1 and 2).

---

## 8. Recommended next actions

1. ~~Apply the pending scenario corrections~~: done 2026-09-29 (see §5(b)).
2. ~~Corpus fixes~~: done 2026-09-29. TR-14 split out of TR-90; Castellano roles corrected; the TX technician renamed Ingrid Falkner; prose names reserved in the generator. Validator passes (243 documents).
3. **HTS 7412 annex placement:** fetch CBP CSMS 68253075 if a gold ever
   needs it. Currently none does; GPC-INV-26-1912 stays needs review.
4. **Remaining fact verification reads** in §7 before promoting their
   scenarios to gold.
5. **Jason:** confirm the CA Comfort Club two-price split (D-TR20-S4-08) is
   intentional. Validate **`priority-tiers-draft.md`**: full tier lists for T1–T5, replacing the four single-item sketches, with 4 open questions. These are
   the one gold artifact that needs your judgement directly.
6. **Close the Tier-1 gaps:** add the 16 CFR 425 text (TR-21) and build a
   synthetic cosmetic-only trigger pair (E-I6-01).

---

STATUS: complete