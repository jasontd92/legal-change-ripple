# Answer-key build

**State 2026-09-29: focused set written and checked.** This replaces the
paused 60–80 item plan. That plan's reading notes are still in
`progress/WP*.md`. Do not relaunch WP1–WP5 to author the rest unless a
later session explicitly extends the set. How to spend the next runs is
`../RUN-PLAN.md`.

## What is gold

`spans.py check` on every file under `e2e/` and `unit/`: 0 errors, 0 warnings.
`merge.py --write` produced `INDEX.yaml` (seed 20260929, 30 done / 9 holdout).

| File | Role |
|---|---|
| `e2e/T1_TR01_2026-10-01.yaml` | Copper tariff integration. Ten findings. |
| `e2e/T3a_TR10_2026-10-01.yaml` | Washington noncompete, law not yet effective. Pair with T3b. |
| `e2e/T3b_TR10_2027-07-01.yaml` | Same findings, law in force, tiers move. |
| `e2e/T5_TR14_2026-10-01.yaml` | California SB 699 / AB 1076 integration. |
| `e2e/C1_TR03_2026-10-01.yaml` | Proceed, then empty scope. Great Plains is the keyword trap. |
| `e2e/C2_TR90_2026-10-01.yaml` | Two exits: Wyoming out of footprint, Texas wrong profession. |
| `unit/D-S0-05.yaml` | Three stage-0 pairs. Fixtures in `fixtures/s0/`. |
| `unit/D-S1B-01.yaml` | Drop Washington. TR-10 gate flips proceed to exit. |
| `unit/S4-KPS-03.yaml` | PO-2025-0231 must cite the October 2019 Keystone terms. |

## Calls made where the corpus was not fully determinate

- **FCCR (T1 F3).** Tier 1, `pass_rule: affected_or_needs_review`. The certificate
  ties the miss to unrecovered tariff costs and does not name Proclamation 11021.
- **TR-03 legal status.** `proposed`. The contract enum has no preliminary value.
  The notice says cash deposits take effect only upon publication of the final results.
- **Alan Mercer.** `not_affected`. The purchase agreement calls him OWNER and
  states that OWNER owns all of the seller's outstanding shares. Hale is named
  separately and is not called a shareholder.
- **Gemma Northcott.** The gold is the classification (the clause is a noncompete).
  Her earnings are not in the file, so enforceability against $126,858.83 is not golded.
- **Whitcombe.** $61.50/hour in the agreement, annualized at 2,080 hours to $127,920,
  above the 2026 threshold from WSR 25-20-099.
- **Castellano file.** The body says employment begins June 10, 2024 and the header
  says Nadia Mayo. The filename says nadia-castellano / 2024-05-06. Both dates are
  after the February 14, 2024 notice deadline. Section 12 is the SB 699 clause.
- **Technician signature dates.** Marchetti is executed April 7, 2024 and commences
  April 21. Ellison is executed December 10, 2017 and commences December 24.
  Both pairs sit on the same side of the relevant deadline as before.

## Left thin on purpose

One item each, not two: absence (Bridgewell), expired-but-surviving (Sunpoint),
version pin (Keystone), superseded text (the same Keystone pair). Invariant
fixtures V1–V14 other than the V13/V14/V5 tags on these files were not built.
Metamorphic cases other than the T3 date pair (M1) and the Washington profile
swap (M2) were not built. I6 is the one cosmetic trigger rewrap.
