# Eval Design

**Status: FINAL for implementation handoff (2026-09-29).** Entry point for
the implementing agent: `eval-scenarios/HANDOFF.md`.

Companion to `system-design.md`. Stage-by-stage unit evals, multi-stage
integration evals, what each one measures, the levers each one tunes, and
the budget plan (§13). Concrete scenarios live in `eval-scenarios/`.
The spend order and repeat counts to use now are `eval-scenarios/RUN-PLAN.md`.

Tags follow `system-design.md`: [JASON], [SUGGEST], [DECIDED], [OPEN].
§10 records the revision-2 changes. Decisions made later on 2026-09-29 are
tagged inline: high-confidence gold only; invariants V13/V14; the stage-5 M1
pair; the budget plan; the open-weight-first model matrix.

---

## 1. Principles

- **Deterministic first, binary first.** [DECIDED] Every metric is computed by
  code where possible. Where an LLM judge is unavoidable, it answers a
  **yes/no question** about one item, never a score on a scale.
- **Unit evals feed gold upstream inputs** (teacher forcing), so an error is
  attributable to the stage under test.
- **Integration evals feed real upstream outputs** and measure compounding.
- **Recall-weighted.** [DECIDED] F2 (recall weighted 2× precision) wherever a
  stage filters or flags. Precision and false-alarm rate are reported next to
  it.
- **Citations: verify what's shown.** [DECIDED 2026-09-28] Citations have
  three roles, and only one is scored:
  1. **User-facing proof:** every citation displayed in the final output
     (report items, their drill-down, the change-record drill-down). Hard gate,
     **measured once, at the report**.
  2. **Internal grounding and handoff:** stage-1 anchors passed into briefs,
     intermediate cites inside a subagent's working. Not scored for fidelity;
     their value shows up downstream as finding recall.
  3. **Eval matching keys:** only need a location (file + section/span), not
     verbatim fidelity.

  The runtime verifier at stage 4 stays as a reliability mechanism (one retry
  while the subagent still has the document in context), not as an eval
  metric. Report citations originate in stage 4 because the orchestrator
  never re-reads documents, so checking at generation time is the cheap place
  to fix them.
- **High-confidence gold only.** [DECIDED 2026-09-29] The eval set must be
  realistic, but every gold answer must follow a predictable, deterministic
  rule, so optimisation has a stable signal. Where a real GC couldn't decide
  cleanly, the item is excluded or scored as abstention only (needs review =
  pass). Never gold a guess.
- **Asymmetric errors are counted separately, not averaged.** The dangerous
  direction of each binary decision (false exit, false "not material",
  scoped out) is its own metric with its own target, so a good average can't
  hide it.
- **pass^k for reliability.** Each item runs k=3 times. An item counts as
  *reliably correct* only if it passes in all k runs. This folds consistency
  into accuracy instead of reporting it separately.
- **Paired comparisons.** Two configs are compared on the same items, counting
  items that flipped (fixed vs broken), not the difference in aggregate
  percentages (§9).
- **Always measured, never scored:**
  - cost ($ per run and per stack)
  - tokens, split orchestrator vs subagents
  - tool calls per stack
  - retries and failures
  - wall-clock time per stage

---

## 2. Ground truth and matching

### Answer key per scenario [SUGGEST: fold into the corpus brief now]

Every gold item is anchored to **source spans**, so predictions can be matched
by code:

| Gold artifact | Anchored by |
|---|---|
| Change items | Span in the trigger text (diff hunk or section id); each marked substantive or noise |
| Effective date, legal status | Exact value and enum |
| Who it applies to | **Structured fields**, not prose: jurisdictions, entity types, product classes (e.g. HTS codes), thresholds |
| Company-level applicability | Enum |
| Relevant-stack set | Stack ids |
| Findings | (stack id, change-item id) + **required spans**: the plant ids, or char/section spans for real-derived text, that a correct finding must cite; one span per required hop |
| Absence findings | Clause type + the document(s) in which it should have appeared |
| Operative vs superseded text | Spans superseded by an amendment or a later version, marked as such |
| Facts | Deadline as structured rule (days, trigger event enum) and computed date for the scenario's as-of date; exposure figure if present |
| Labels | Enum per label set, including "undeterminable" where the evidence really doesn't decide |
| Cross-stack links | (stack A, stack B, link type) |
| Priority | **Tiers** (e.g. act now / act soon / monitor), written from judgement, not from our sort policy |

The corpus plan already gives most of this for free:
- `planted_features[]` in the manifest, with plant ids and verbatim text
  inserted by script
- `status` (active / expired / superseded) per document
- `parent_id` chains for amendments
- version-dated web terms
- the as-of date as a parameter

What must be hand-authored: required-hop lists, labels, cross-stack links and
priority tiers.

### Matching rule [SUGGEST]
- **A predicted finding matches a gold finding** when it has the same stack and
  change item and *locates* at least one of the gold's required spans (same
  file and section, with character overlap ≥ 50% of the gold span or
  containment). Location, not quote fidelity. Fully deterministic.
- **A predicted change item matches** when its citation overlaps the gold
  anchor span. Deterministic.
- **Unmatched predictions are false positives**, with one exception: a
  prediction that cites a span marked "decoy" is counted separately as a decoy
  hit.
- A judge is used only if span matching proves too brittle in practice. Check
  this on the first 20 findings before building a fallback.

---

## 3. Levers

| Lever | Stages it affects |
|---|---|
| Model per role (orchestrator / subagent) | 1, 3, 4, 5 |
| System prompt and instructions | all agentic stages |
| Skills (hop checklist, category definitions) | 4, labels |
| Brief contents passed to subagents | 4 |
| Tool set (grep vs read vs structured section fetch) | 4 |
| Tool-call budget per subagent | 4 |
| Manifest richness | 3 |
| Gate leniency (company level, scoping) | 1b, 3 |
| Labeller: LLM self-label vs Jev tool call; Jev abstention threshold | labels |
| Ranking approach A / B / C | 5 |
| Finding handoff: full vs summary + on-demand reads | 4→5 |
| Compaction threshold | orchestrator session |
| Normalisation rules | 0 |

---

## 4. Always-on invariants (every run, deterministic, zero AI cost)

Run on every run's artifacts and trace. A violation fails the run and is
listed by name. These catch failures that no accuracy metric sees.

| # | Invariant | How it's checked |
|---|---|---|
| V1 | **Schema** | Every artifact parses against its contract |
| V2 | **Surfaced citations are verbatim** | Every quote *displayed in the final output* is found in the cited file (whitespace-normalised). Internal cites are not checked |
| V3 | **Surfaced citations locate** | Each displayed quote is found *within* its cited section/page, not merely somewhere in the file |
| V4 | **No truncated exceptions (surfaced)** | A displayed quote that ends mid-sentence, where the rest of the sentence contains "except / unless / provided that / notwithstanding / subject to", is flagged. Lint, not a proof |
| V5 | **Operative text** | No finding relies on a span marked superseded or on an expired document, unless the finding is explicitly about that status |
| V6 | **Coverage audit** | Files a subagent claims to have read ⊆ files it actually opened (from tool-call trace), and share of each file's characters actually returned by read tools. Claimed full reads of truncated files fail |
| V7 | **Absence claims are backed** | Every absence finding lists where it searched, and each of those files was fully read (V6) |
| V8 | **Conservation** | Every accepted finding from every subagent appears in the report (ranked or in the logged not-material list). Nothing silently dropped or merged away |
| V9 | **Cross-reference closure** | Every `cross_reference` a subagent emitted has a resolution entry from stage 5 |
| V10 | **Change-item closure** | Every `ChangeRecord` item is accounted for: referenced by a finding, or explicitly marked as unaddressed with a reason |
| V11 | **Scope completeness** | Every stack in the vault appears in the `ScopeTrace` |
| V12 | **Label-rationale agreement (structural)** | Each ranked item's rationale names the deciding label and fact fields present in the finding (field reference check, not prose reading) |
| V13 | **Trigger nexus** | Every finding's `change_ref` points to a change item of the run's own trigger. Catches trigger-agnostic findings copied across runs (e.g. a covenant breach that fans in from several triggers must be framed by *this* trigger's contribution) |
| V14 | **No off-trigger carry-over (negative control)** | Designated trigger-agnostic stacks (e.g. the credit-agreement FCCR breach) must **not** appear as findings in runs whose trigger has no nexus to them (noncompete and consumer triggers). A hit is a false positive |
| V15 | **Change items are real** | Every substantive change item has a summary that describes something (no placeholder or probe such as "test A"), and every anchor's quote is the file text at its span. When there is a previous snapshot, every short changed region of the diff is inside some item, substantive or opted out as noise. Items the harness kept by default are listed as warnings. Scorer: `scripts/score-tool-health.ts` |
| V16 | **Tool-call health** | No tool call was rejected by the SDK as unparseable or schema-invalid (logged on the trace as `invalid tool call`). A single rejected value that the model fixed on retry (a bad line range, a placeholder summary, an unknown enum word) is counted and reported, not failed. A structurally invalid call (a list sent as a string, a required field missing) fails, and so does a stage that never finished (stage 1 defaulting its gate, a stack that stopped before committing). Scorer: `scripts/score-tool-health.ts` |

V15–V16 were added on 2026-09-30 after a run persisted a model's debugging probe ("test A" / "test B") as its change record: the model's full tool calls kept failing schema validation invisibly, and the first call that passed was a probe. Tools now take one flat item per call and cite by line number, so the model never re-types source text.

V3–V9 are the main answer to "fails undetected": most silent failures in this
system are faithful-looking artifacts that aren't what they claim.

---

## 5. Unit evals by stage

Each stage lists its **binary unit** (what passes or fails), the metric
computed over those units, and the method.

### Stage 0: Diff and normalise (code)
- **Unit:** one old/new pair. **Pass:** cosmetic pairs exit; substantive pairs
  survive.
- **North star:** zero false exits.
- **Method:** unit tests. Deterministic.

### Stage 1a: Understand the change
- **Units:**
  - per gold substantive item: found (matched by span) yes/no
  - per gold noise item: dismissed yes/no
  - per predicted item: matches a gold item yes/no
  - effective date: exact yes/no
  - legal status: exact yes/no
  - applies-to fields: set equality per field yes/no
- **North star:** substantive-item F2, with **false dismissals** reported
  separately (target zero).
- **Method:** deterministic (span overlap, exact match, set comparison).
  "Who it applies to" was previously judged; now structured fields.
- **Cost:** one orchestrator call per trigger (~20–25 triggers). Cheap.

### Stage 1b: Company-level gate
- **Unit:** one (profile, change) pair. **Pass:** decision equals gold (with
  "uncertain → proceed" counted as proceed).
- **North star:** false-exit count. Target zero.
- **Secondary:** correct-exit rate.
- **Method:** deterministic enum match. Cases come mostly from metamorphic
  profile swaps (§6), so no new gold is needed.

### Stage 3: Scope
- **Unit:** one gold-relevant stack. **Pass:** included.
- **North star:** scope recall; every miss listed by name. Target 100% on
  planted cases.
- **Secondary:** pruning rate (irrelevant stacks excluded).
- **Deferred:** exclusion-reason quality [JASON].
- **Method:** set comparison. Deterministic.

### Stage 2+4: Per-stack subagent
- **Units:**
  - per gold finding: matched yes/no (recall); **hop-complete** yes/no (all
    required spans cited)
  - per predicted finding: matched yes/no (precision); decoy hit yes/no
  - per gold absence: found and backed (V7) yes/no
  - per matched finding: deadline rule exact yes/no; computed date exact
    yes/no; exposure figure within tolerance yes/no
- **North star:** finding-level F2, on **hop-complete** matches. A finding
  that cites the right clause but misses a required hop (e.g. the override in
  a child document) counts as a miss. This catches "right answer, wrong
  reason".
- **Slices, not separate evals:** decoy false positives, absence recall,
  superseded-text use (V5), template-instance variance, version resolution
  (§8).
- **Secondary:** needs-review rate on items gold considers decidable (cop-out
  signal); tokens and tool calls per stack.
- **Method:** deterministic throughout. "Citation support" (previously
  judged) is replaced by the required-span check: citing the gold span *is*
  support.
- **Cost:** the main cost centre (stacks × scenarios × k × models). Cache by
  (brief hash, stack hash, model, prompt version) so unchanged subagent runs
  aren't repeated across scenarios or iterations.

### Labels: classification
- **Unit:** one (finding evidence, label set). **Pass:** exact enum match.
- **North star:** accuracy per label set, with the **dangerous confusions
  counted separately**, e.g. gold material → predicted not material (hidden
  from the default report); gold forfeitable clock → anything else. Each gets
  a zero target. This replaces the error-cost matrix: simpler, binary, and it
  keeps the costly errors visible instead of weighted into an average.
- **Abstention:** correct "undeterminable" vs over-abstention, both counts.
- **Jev threshold:** sweep the threshold, plot accuracy vs abstention, pick
  the point where dangerous confusions hit zero.
- **Method:** deterministic.
- **Cost:** Jev is cheap per call; the LLM labeller is one call per finding.
  Runs on gold evidence, so the whole set can run in parallel, independent of
  the agent.

### Stage 5: Aggregate and rank
- **Input:** gold findings (plus planted cross-stack links).
- **Units:**
  - per gold cross-stack link: found yes/no; per predicted link: gold yes/no
  - per relabelled item: moved toward gold yes/no (diagnostic, derived by
    diffing subagent label, final label and gold)
  - ranking, binary checks:
    - **R1:** every gold tier-1 item is ranked above every gold tier-3 item
    - **R2:** every gold tier-1 item appears in the top N (N = tier-1 count
      + a small margin)
    - **R3:** no gold tier-1 item is hidden as not material
  - ranking, secondary continuous: pairwise cross-tier order accuracy
    (deterministic)
  - report: V8, V10, V12 invariants
- **North star:** R1–R3 all pass (per scenario, pass^k).
- **Method:** deterministic. One optional judge check (§7): does each item's
  rationale contradict its labels?
- **Circularity guard:** gold tiers are written from judgement, never by
  running our sort; otherwise approach A scores perfectly by construction.

---

## 6. Metamorphic evals (new: expected *changes*, no new gold needed)

Rerun a scenario with one input changed and assert that the output changes (or
stays the same) in a predictable way. All deterministic, and cheap because
most stages can reuse cached artifacts. The corpus plan makes these natural.

| # | Perturbation | Expected | Catches |
|---|---|---|---|
| M1 | **Shift the as-of date** past a deadline or effective date | Named urgency labels change as predicted; expired documents drop out; future-effective law becomes in force | Temporal reasoning errors; stale "now" |
| M2 | **Swap the company profile** (states, industry, what it buys) | Company gate flips for designed pairs; applicability per stack flips accordingly | Profile blindness; the gate ignoring the profile |
| M3 | **Add a custom-prompt focus** | Out-of-focus items move to logged dismissals; nothing deleted (V8 still holds) | Custom prompt ignored, or used as a silent filter |
| M4 | **Add a materiality threshold** to the custom prompt | Designated items flip material ↔ not material; others unchanged | Threshold ignored or misapplied |
| M5 | **Scale noise** (the corpus plan's 240 → 300 knob: more generated instances and distractors) | Recall on the same planted findings unchanged; pruning absorbs the noise | Degradation at scale; attention dilution |
| M6 | **Rename or reorder files and stacks** | Identical findings and labels | Reliance on filenames or ordering |
| M7 | **Remove a single required clause** (edit one plant) | The dependent finding flips (e.g. to an absence finding or not affected) | Findings not actually grounded in the cited text |

**M1 applied to stage 5 [DECIDED 2026-09-29]:** score TR-10 at as-of
2026-10-01 vs 2027-07-01 **as a pair**. The same findings must move from
tier 3 (monitor) to tier 1 (act now) when the law takes effect and the notice
clock starts (`eval-scenarios/priority-tiers-draft.md` T3a/T3b). Pass = every
listed finding flips as expected; owner covenants stay logged in both.

**Tier 1 includes "money leaking now through a fixable mechanism"**
[DECIDED 2026-09-29], even without a legal deadline (e.g. the forward-only
pass-through re-notice, an active overbilling).

M7 is the strongest grounding test in the set: if removing the clause the
finding cites doesn't change the finding, the agent wasn't reading it.

---

## 7. LLM-judge usage (minimised)

After this revision the judge is needed in only two places, both binary and
both optional:

| Check | Question | Batching |
|---|---|---|
| J1 Rationale–label contradiction | "Does this rationale contradict the labels {…}? yes/no" | One call per report, returning one boolean per item |
| J2 Span-match fallback | "Do these two findings describe the same issue? yes/no" | Only if deterministic matching proves brittle |

- **Judge from a different model family** than the agent under test.
- **Calibrate** each judge check against ~30 hand-labelled items before
  relying on it. Report agreement; if it's under ~90%, drop the check rather
  than trust it.
- Nothing in the north stars depends on a judge.

---

## 8. Gap analysis: where the agent could fail undetected

"Undetected" means every metric in revision 1 would still have passed.

| Failure mode | Why revision 1 missed it | Added |
|---|---|---|
| **Faithful but superseded citation**: quotes a base-contract clause that an amendment replaced, or an older version of incorporated web terms | Verbatim gate passes; the finding may even match gold if span-matched loosely | V5 operative-text invariant; superseded spans marked in gold; version-resolution slice |
| **Wrong version of incorporated terms**: a PO references a dated version of supplier terms; the agent reads the current one | Same as above | Version-resolution slice (the corpus has dated versions and POs pinned to them) |
| **Expired or superseded documents treated as live** | Nothing checked document status | V5; M1 (as-of shift) |
| **Right answer, wrong reason**: correct determination through the wrong hop chain | Outcome-level matching only | Hop-complete requirement in the stage-4 north star; M7 grounding test |
| **Out-of-context quote**: truncated before an exception | Verbatim gate passes | V4 truncation lint; V3 section location |
| **Claimed coverage that didn't happen**: budget exhaustion, a long document silently truncated by the read tool, files listed but never opened | Coverage statement was self-reported and trusted | V6 coverage audit from the tool trace |
| **Unbacked absence**: "no protective clause" because a search tool missed it (formatting, a split heading) | Absence recall scored only when gold had an absence | V7: absence must list where it searched and those files must be fully read; M7 in reverse |
| **Template-instance drift**: agent reads the template, assumes signed instances match; instances vary by state, role, date | No slice for it | Template-instance slice (the corpus has ~20 signed instances with planted variation) |
| **Report drops or merges findings** | Ranking was scored on what appeared, not on what vanished | V8 conservation |
| **Cross-reference recorded but never resolved** | Only found links were scored | V9 closure |
| **Change item silently unaddressed** | Coverage check was a secondary metric | V10 closure, as an invariant |
| **Hidden false "not material"**: a material finding classified not material disappears from the default report view | Averaged into label accuracy | Dangerous-confusion count with zero target; R3 |
| **Custom prompt ignored or used as a silent filter** | No eval covered the custom prompt at all | M3, M4 |
| **Profile ignored** | Gate eval had few boundary cases | M2 |
| **Scale degradation** | Scenarios were scored at one corpus size | M5 |
| **Filename or ordering reliance** | Not tested | M6 |
| **Long trigger source truncated** (a long court opinion) → change items missing, no signal | Item recall catches misses only if gold lists them | Gold items span the whole source; V6-style audit of how much of the trigger the orchestrator actually read |
| **Run-over-run duplication** (the same trigger twice, or a trigger that reverses an earlier one) | — | **Out of scope** [DECIDED]: the orchestrator does not read historical logs, so each run is independent by design. Noted as a production gap |
| **Instructions embedded in documents** (text in a document telling the agent to do something) | Not tested | Optional adversarial case in I6: one document with embedded instructions; pass = no behavioural change, and the text is treated as content |
| **Judge drift** | Judge used widely, uncalibrated | Judge reduced to two optional binary checks, calibrated (§7) |
| **Overfitting to the dev set** | Held-out split was an open item | Held-out split fixed before the first prompt iteration (§9) |

---

## 9. Run plan, cost and signal-to-noise

### Consolidated run sets
Many revision-1 evals were analyses of the same runs, not separate runs:

| Run set | What runs | Analyses it feeds |
|---|---|---|
| **A. Unit, teacher-forced** | Stage 1a, 1b, 3, 2+4, labels, 5 on gold inputs | Every §5 metric |
| **B. End to end** | Full pipeline, all scenarios, k=3, per model config | I1 end-to-end, I2 funnel attribution (from traces), I5 consistency (pass^k), I7 per-slice generalisation, I8 model matrix, all §4 invariants |
| **C. Metamorphic** | Perturbed reruns, reusing cached upstream artifacts where the perturbation doesn't touch them | §6 |
| **D. Robustness** | Adversarial and failure-injection cases (I6) | Pass/fail per behaviour |
| **E. Handoff** | Stage 5 with full vs summary findings (I3), on gold findings | Stage-5 north star delta, orchestrator tokens |
| **F. Ranking approach** | Stage 5 with approaches A / B / C, on gold findings; the winner and runner-up then go end to end in set B | R1–R3; I4 |

I2, I5, I7 and I8 add **no AI cost**: they're computed from run set B's
traces.

### Tiers of use
- **Dev loop** (every prompt change): the relevant unit eval on the dev split
  only, plus §4 invariants. Minutes, low cost.
- **Milestone:** run sets A and B on the dev split, plus C.
- **Final numbers:** everything on the **held-out split**, run once per
  shortlisted config.

### Signal-to-noise protocol
- **Paired, per-item comparison.** Compare configs on identical items.
  Report *fixed / broken / unchanged* counts. For binary pass/fail, use
  McNemar's test on the discordant pairs rather than comparing two
  percentages.
- **pass^k** (all k runs pass) as the reliability view; majority-of-k as the
  capability view. A config that wins on majority but loses on pass^k is less
  consistent, which is a finding in itself.
- **Stratify by slice** (hop type, decoy, absence, version, instance) so a
  gain in one slice can't hide a loss in another.
- **Report counts, not only percentages,** when a slice has fewer than ~30
  items. "9/10 → 10/10" is honest; "+10%" isn't.
- **Freeze the held-out split before the first iteration.** Record which
  scenarios are in it and why.
- **Cache aggressively:** deterministic upstream artifacts (stage 0, gold
  briefs) and unchanged subagent runs, keyed by content hash, so repeated
  runs cost only what changed.

---

## 10. What changed in revision 2

**Removed or merged (redundant):**
- *Stack determination* as its own metric → derived from findings (a stack is
  affected if it has ≥1 finding) and reported as a view.
- *Decoy resistance* and *absence detection* as separate evals → slices of
  finding precision and recall.
- *Citation support* (judge) → replaced by the deterministic required-span
  check.
- *Error-cost matrices* → replaced by separately counted dangerous
  confusions with zero targets.
- *I2, I5, I7, I8* as separate runs → analyses of run set B.
- *I4* → split: cheap stage-5-only comparison on gold findings, then end to
  end for the top two.
- *Coverage-check accuracy* → invariant V10.
- *"Who it applies to"* (judge) → structured fields, set comparison.
- *Report rubric* (judge, graded) → invariants V8, V10, V12 plus one optional
  binary judge (J1).

**Added:**
- Always-on invariants V1–V14 (§4).
- Metamorphic evals M1–M7 (§6).
- Hop-complete matching in the stage-4 north star.
- Binary ranking checks R1–R3.
- Gap-driven slices: version resolution, template-instance drift, superseded
  text.
- Paired-comparison and pass^k protocol.

---

## 11. Headline scorecard

1. **Invariants:** V1–V14 pass on every run (list any violations by name).
   V2–V4 are the citation gate, applied to surfaced citations only.
2. **Material-finding recall** in the report, hop-complete, pass^k (I1): the
   north star.
3. **False-alarm rate** (I1).
4. **Dangerous-error counts:** false exits, scoped-out relevant stacks, false
   "not material", missed forfeitable clocks. Target zero each.
5. **Ranking R1–R3** pass rate.
6. **Metamorphic pass rate** (M1–M7).
7. **$ per run**, with tokens (orchestrator/subagent) and latency alongside.

---

## 12. Settled parameters and remaining implementer decisions

- [DECIDED] **Span-overlap threshold:** 50% of the gold span, or
  containment, same file and section. The implementer validates it on the
  first 20 findings; if it's brittle, add the J2 fallback.
- [DECIDED] **Repeats:**
  - Broad set: k=1.
  - Sentinel set: k=3 on R1 Luna and the Sonnet check; **k=5 on the
    open-weight configs** (O1, O2).
  - Final tier: k=3.
- [DECIDED] **R2 margin:** N = (gold tier-1 count) + 2.
- [DECIDED] **Judge (J1/J2):** always a **different model family** from the
  config under test. Luna judges the open-weight configs; GLM-5.3-Flash judges
  R1. Calibrate on ~30 hand-labelled items and drop the check if agreement is
  below 90%. Nothing in the headline depends on a judge.
- [DECIDED] The orchestrator does not read the historical findings log;
  run-over-run cases are out of scope.
- [DECIDED] **GC view:** what / why / when per item, grouped by category,
  with the cited trigger change, the cited document clause, and the
  intersection summary. The hop chain is dev-only. V2–V4 apply to those two
  headline citations per item and to the change-record drill-down.
- [IMPLEMENTER] **Held-out split.**
  - Stratified by (trigger, slice), ~30% of items, fixed seed.
  - Sentinel items split in proportion.
  - Both TR-10 as-of dates (T3a/T3b) stay in the same split.
  - Record the split and its seed in the answer-key index; freeze it before
    the first prompt iteration.

---

## 13. Budget plan: high-ROI evals under a fixed spend [SUGGEST, 2026-09-29]

> **Spend order superseded 2026-09-30.** The sequence, the repeat counts, and
> the dollar figures in this section were estimates. Measured runs replaced
> them. Follow `eval-scenarios/RUN-PLAN.md`. The stage definitions in §5 still
> hold.

Target [JASON]: one "suite" run costs **$1–5** per model, on lightweight
models only. Magnitude, not precision. The token figures below are
**estimates to be replaced by measured usage** from the first instrumented
run. Per-run token accounting is already required (§1 "always measured").

### Prices used (per 1M tokens)

| Model | Input | Cached read | Output | Notes |
|---|---|---|---|---|
| Claude Haiku 4.5 | $1.00 | ~$0.10 | $5.00 | Cache write ~1.25× input. **Minimum cacheable prefix 4,096 tokens**: a shorter system prompt + tools + brief silently won't cache. Batch API 50% off. 200K context |
| GPT-5.6 Luna | $0.20 | $0.02 | $1.20 | Cache write 1.25×. Reasoning tokens bill as output (the main uncertainty). 1.05M context |

### Cost per unit of work (estimates)

| Unit | Tokens (uncached in / cached in / out) | Haiku | Luna |
|---|---|---|---|
| One per-stack subagent run (single stack, ~6 turns) | 8k / 15k / 1.5k | ~$0.02 | ~$0.004–0.01 |
| Stage 1 on one trigger group (TR-02 carries a ~88k-token opinion) | 10–90k / – / 3k | $0.03–0.10 | <$0.02 |
| Stage 3 scoping over ~200 stack manifests | 35k / – / 3k | ~$0.05 | ~$0.01 |
| Stage 5 on gold findings (one scenario) | 20k / – / 5k | ~$0.045 | ~$0.01 |
| **One full end-to-end run** (full corpus, ~30 in-scope stacks) | ~725k / ~1.5M / ~72k | **~$1.30** | **~$0.25–0.50** |

**Implication:** the full end-to-end matrix (10 trigger scenarios × k=3 =
30 runs) costs ~$40 on Haiku and ~$10 on Luna. That's roughly 10× over the
target, so end-to-end runs can't be the routine suite. Stage 4 subagents are
~80% of end-to-end cost.

### Three tiers of spend

| Tier | When | Contents | Cost (Haiku / Luna) |
|---|---|---|---|
| **Dev loop** | Every prompt change | Only the unit eval for the stage being changed, on the ~20-item **sentinel set** (below) for that stage, k=1 | $0.05–0.50 / <$0.10 |
| **Suite** (the $1–5 target) | Per milestone / model comparison | All unit evals k=1, the sentinel set at k=3, deterministic invariants and cheap metamorphics | **~$3.5 / ~$1** |
| **Final** | 1–2 times total | Full-corpus end-to-end on every trigger scenario, k=3 per model; expensive metamorphics (M5 scale, M6 rename) | ~$40 / ~$10, **outside the envelope, budgeted separately** |

**Suite breakdown (Haiku):**

| Component | Cost |
|---|---|
| Stage 4 units, ~85 items × k1 | ~$1.70 |
| Sentinel extra runs, ~20 × 2 | ~$0.80 |
| Stage 1 on 10 trigger groups (Batch) | ~$0.30 |
| Stage 3 on 16 scope cases (Batch) | ~$0.30 |
| Stage 5 on gold, 5 scenarios × k3 (after the A/B/C decision) | ~$0.70 |
| Labels (~25) | ~$0.03 |
| Stage 1b profile pairs | ~$0.01 |
| **Total** | **≈ $3.8** |

Luna ≈ ¼–⅓ of that, depending on reasoning tokens.

### ROI rules for what goes where
1. **Free tier (always run):** invariants V1–V14 and deterministic scorers.
   These cost nothing beyond the runs they inspect.
2. **Cheap by construction:** teacher-forced unit evals (one stage, gold
   inputs), labels on gold evidence, and M1/M3/M4/M7 metamorphics that only
   rerun the perturbed stage. Upstream artifacts are cached by content hash.
   M7 (clause removal) reruns one single-stack subagent (~$0.02).
3. **Batch where non-interactive:** stage 1, stage 3, stage 5 on gold, and
   labels are single calls, so they go through the Batch API (50% off). The
   agentic stage 4 loop stays synchronous.
4. **Expensive, so rare:** full-corpus end-to-end, M5 scale, M6
   rename/reorder. Final tier only. Scale and scoping realism are measured
   there, once.
5. **One-time experiments don't recur:** the ranking A/B/C comparison, the
   LLM-vs-Jev labeller, and the Jev threshold sweep. Once decided, only the
   winner runs in the suite.

### n over m: the sentinel set (k=3, pass^k)

> Canonical sentinel IDs, updated after the round-2 flips, are in `eval-scenarios/HANDOFF.md` §4. That list supersedes the summary below. Repeats per §12: k=5 on open-weight configs, k=3 on Luna.
About 20 items where a silent regression would be most damaging. These get
repeated runs; everything else runs once. Selection rule: dangerous-error
exposure × edge-case uniqueness.
- **Forfeitable clocks:** B03 Valley non-renewal (2026-11-01); B11 Cascade
  REA already run.
- **Gate false exits:** S1b profile pairs; TR-03 control (a true negative,
  not a miss).
- **Hop-complete chains:** A S4-GPC-01; A S4-HPB-01 (IEEPA line only).
- **Decoys:** B16 utility "tariff"; A S4-GPC-02 Metals Adjustment; C
  TR11-S4-04 IL training repayment; Castellano §10.
- **Abstention (needs review is correct):** IL 2022–2024 band; GPC-INV-26-1912;
  AB 1076 pre-deadline technician instances.
- **Expired ≠ irrelevant:** B02 Sunpoint MFN accrued claim.
- **Flips:** C TR10-S4-05 Gemma Northcott; D-TR14-S4-01 technician §6.1.
- **Version pin:** A S4-KPS-03 / S4-NCS-02.
- **Ranking:** T1 and T3a/T3b tier checks (stage 5 on gold).
- **Tool-call robustness (V15/V16):** stage 1 only, no fan-out. TR-13 Rollins
  (a rewrite; Federal Register footnote markers like `\1\`), TR-21 first
  reading, TR-01 EO 14220 → Proclamation 10962 and TR-11 (short diff
  regions that are kept unless opted out). `--stacks` adds single-stack
  stage 4 on the families that failed before (TR-13 handbook and arbitration
  template; TR-01 Great Plains and Hai Phong). Runner:
  `scripts/sentinel-stage1.ts --config <config> --k 3`. Pass^k on V15 and V16.

**Noise, in magnitude:**
- On the sentinel set, k=3 per item makes a 3/3 → 0/3 flip unambiguous.
- On the ~150-item k=1 broad set, a paired McNemar comparison resolves
  roughly 8–10 point swings. That's enough to rank lightweight models and
  catch real regressions, not to separate near-ties. Near-ties get
  sequential top-up: re-run only the discordant items.

### Design constraints this surfaces
- **Haiku's 4,096-token cache minimum:** subagent system prompt + tool
  schemas + skills must form a stable prefix ≥ 4k tokens, or every turn
  pays full input price. Verify `cache_read_input_tokens` > 0 in the first
  run.
- **Haiku's 200K context vs the orchestrator session:** TR-02 stage 1 (~88k
  opinion) plus stage 5 findings can approach the limit. Compaction or
  summary handoff becomes necessary on Haiku, not optional. Measure it.
- **Corpus slices:** routine end-to-end checks, if wanted, run on a slice
  (relevant stacks + ~10 sampled decoys) rather than all ~200 stacks. Full
  corpus is final-tier only.

### Model access and billing [SUGGEST, 2026-09-29]

> **Superseded in part (2026-09-29):** the core matrix is now open-weight first (GLM-5.3-Flash, DeepSeek V4.1 Flash) with Luna as the closed reference and Jev as the labeller variant. Sonnet appears only as a conditional ceiling check. The access notes below still hold.
- **Context forces Sonnet into the plan** [JASON]. Sonnet 5 is $2 / $10 per
  1M tokens with 1M context: ~2× Haiku, so the suite is ~$7–8 and the final
  tier ~$80 if Sonnet runs everywhere.
  - **Cheaper mixed config:** Sonnet for the **orchestrator only** (the
    session that needs the context), Haiku for per-stack subagents (each
    stack fits in 200K; the largest document is ~110k tokens). The
    orchestrator is ~15–20% of tokens, so this lands near Haiku cost.
  - Evaluate it as its own config alongside all-Haiku and all-Sonnet.
- **Subscription-billed OpenAI runs inside the harness:** eve's
  `chatgpt()` model helper (`eve/models/openai`, sign in with `/login` in
  `eve dev`) serves OpenAI models on a ChatGPT subscription instead of an API
  key.
  - Local development only; deployments need provisioned keys.
  - Near-zero marginal cost for the Luna runs, subject to plan rate limits,
    which slow long suites.
  - Confirm token-usage reporting still works for the cost metrics.
- **No Claude subscription equivalent for the harness.** Anthropic's consumer
  terms (updated February 2026, enforced by April 2026) restrict Free / Pro /
  Max OAuth credentials to Claude Code and Claude.ai. They can't back a
  third-party harness (eve) or the Agent SDK. Claude models in the harness
  need an API key.
- **Headless CLIs (`claude -p`, `codex exec`, `cursor-agent -p`) are agents,
  not model endpoints.** Each brings its own system prompt, tools and loop,
  so it can't serve as eve's model and would confound the model comparison
  (you'd be scoring Codex-the-agent, not Luna in our harness). Where they
  fit:
  - offline tooling (corpus generation already uses `claude -p`)
  - low-volume binary judge checks (J1)
  - an informal **agent baseline**, like the GC AI trial: run Codex or
    Claude Code headless on a scenario with the same prompt and score it on
    the same rubric

### Cost per configuration [DECIDED 2026-09-29: open-weight first; estimates, see `system-design.md` Models]

| Config | Suite tier | Final tier (full end-to-end) | Sentinel k |
|---|---|---|---|
| O1 GLM-5.3-Flash | ~$0.10 (VERIFY prices) | ~$1.50 at k=3 | **k=5** (cheap enough to measure variance properly) |
| O2 DeepSeek V4.1 Flash | ~$0.10–0.30 (VERIFY) | ~$2–4 at k=3 | k=5 |
| R1 Luna (ChatGPT subscription) | ~$0 marginal (rate-limited) | ~$0 marginal | k=3 (limited by the plan's rate limits, not cost) |
| J Jev labeller variant | the base config + Jev calls on ~25 label items (price TBD) | – | k=3 |
| S Sonnet ceiling check (conditional) | – | ~$1–2, one run of ~20 sentinel items | k=1 |

**Implication:** a full suite across O1 + O2 + R1 + J lands **well under
$1**, inside the $1–5 envelope with room to spare. The earlier tier split
(dev loop / suite / final) still applies, but the final tier is now
affordable to run more than once. The Haiku / Sonnet-mix figures above are
retained only as reference for the dropped configs.
