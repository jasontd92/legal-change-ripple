# Eval Scenario Scoping: Plan and Progress

**Planning phase COMPLETE (2026-09-29).** Next phase: gold / answer keys. Start at `HANDOFF.md`.

**Goal.** One-line eval scenarios for every eval in `../eval-design.md`,
each naming the trigger file + section, document path(s) + section(s), and
inputs (as-of date, profile, custom prompt). Stage-setting for the agents who
will later verify numbers and build eval infrastructure. **Not** eval infra,
not full gold answers. Jason validates realism before the full set is written.

**Recoverability.** Each work package writes its own file in this folder,
appending as it goes. To resume after an interruption: check the status table,
relaunch only packages whose file is missing or marked incomplete, using the
brief below verbatim. Don't redo completed packages.

## Status

Log: 2026-09-28, all five packages stopped at the session limit before writing anything. Resumed 2026-09-29 by messaging the same agents, so their earlier reading carries over.


| Pkg | Scope | Output file | Status |
|---|---|---|---|
| A | Tariff triggers (TR-01, TR-02, TR-03): trigger-side evals + supply-area findings | `A-tariff-supply.md` | complete |
| B | Tariff downstream: customers, subcontracts, corporate, vendors; cross-stack links; tiers | `B-tariff-downstream.md` | complete |
| C | Noncompete / employment triggers (TR-10..13): trigger-side + employment, acquisitions, vendor no-hire; links; tiers | `C-noncompete.md` | complete |
| D | Consumer triggers (TR-20, TR-21), controls (TR-90), distractor trigger versions; stage 0 diff pairs; stage 1b profile pairs | `D-consumer-controls-trigger-side.md` | complete |
| E | Cross-cutting: invariants V3–V11, metamorphic M1–M7, robustness I6 candidates | `E-cross-cutting.md` | complete |
| Z | Consolidation: index + coverage matrix (eval × scenarios), gaps, realism flags | `README.md` | complete |
| R1 | Update A + B to `CHANGES-2026-09-29.md` | `A-*.md`, `B-*.md` (revision section) | complete |
| R2 | Update C + D to `CHANGES-2026-09-29.md` | `C-*.md`, `D-*.md` (revision section) | complete |
| R3 | Update E to `CHANGES-2026-09-29.md` | `E-*.md` (revision section) | complete |
| Z2 | Refresh README after R1–R3 | `README.md` | complete |
| H | Implementation handoff (entry point for the gold / answer-key agent) | `HANDOFF.md` | complete |

## Decisions carried in (don't relitigate)
- GC sees what / why / when per item, grouped by category: cited trigger
  change + cited document clause + intersection summary. Hop chain is dev-only.
- Citation fidelity is scored only on surfaced citations.
- The orchestrator does not read historical logs; run-over-run cases are out
  of scope.
- As-of date defaults to 2026-10-01 (`corpus/company/profile.yaml`); scenarios
  may override it.
- A "stack" = a cluster folder, or a standalone document (POs, each web-terms
  version, each signed agreement, each closing agreement stand alone).

## Shared brief for packages A–E

You are scoping eval scenarios for a legal-change monitoring agent. Read first:
- `eval-design.md` §1, §2, §4, §5, §6, §8 (what each eval measures, matching,
  invariants, metamorphic evals, gap slices)
- `system-design.md` §2–§6 (pipeline stages, `StackFinding` contract, label
  sets)

Corpus (source of truth, in `corpus/`):
- `company/profile.yaml`
- `triggers/<group>/` (each version + `meta.yaml`)
- `documents/<area>/...`
- `manifest.jsonl` (roles, status, parent_id, planted_features, version_label)
- `INDEX.md`

Design intent for planted features (hints only; always confirm against the
corpus text): `build/specs/*.yaml`, `build/generate/specs_gen.py`. Don't use
`corpus-research/` or `research/`; they may be stale.

Rules:
- **One-liners, not gold.** Each scenario is a short entry in the format below.
  Enough for a later agent to build and verify it; no full answer keys.
- **Cite sections.** Name the section/heading/clause number as it appears in
  the document or trigger (e.g. "§7.2 Price Adjustments", "Sec. 2(b)"). If a
  number, date or threshold matters, quote it and mark it `VERIFY`.
- **Cover should-not-flag cases** (decoys, look-alikes, expired, out-of-scope)
  as deliberately as positives.
- **Flag realism concerns** in a `Realism` line when a scenario depends on
  something a real GC would find implausible, or where the corpus seems
  inconsistent.
- **Record gaps:** evals or slices from `eval-design.md` that the corpus can't
  support in your scope, and what document change would enable them.
- **Write incrementally.** Create the output file with its header **as your first action, before any reading** (lesson from a rate-limit interruption on 2026-09-28, when all five packages stopped with nothing written);
  append after each trigger/area so partial work survives interruption. End
  the file with the line `STATUS: complete`.
- Read only what you need: use `manifest.jsonl` roles and planted_features to
  target documents, then read the relevant sections.

Scenario entry format:
```
- **<ID>** · <eval id, e.g. S4 / LBL-urgency / S5-R1 / V5 / M1> · <one-liner>
  - Trigger: <path> — <section>
  - Docs: <path> — <section> (<role>); ...
  - Inputs: as-of <date>; profile <default | variant>; custom prompt <none | text>
  - Expected: <short: affected / not affected / exit / label / tier / link>
  - Plants: <planted_feature ids, if any>
  - Verify: <facts a later agent must confirm>
  - Realism: <only if there's a concern>
```
Eval ids: S0, S1a, S1b, S3, S4 (2+4), LBL-<set>, S5-link, S5-R1/R2/R3, V#,
M#, I6.
