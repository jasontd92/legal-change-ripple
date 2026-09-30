# System Design: Working Notes

Working notes from the whiteboarding sessions. **This is not the one-page
design doc or the final write-up**; those stay AI-free. This file records who
owns what, the handoffs, and the open questions. Source of truth for the problem
is `take-home-context.md`.

Tags:
- **[JASON]**: Jason's direction from dictation.
- **[SUGGEST]**: a thought-partner proposal, not yet accepted.
- **[DECIDED]**: agreed.
- **[OPEN]**: unresolved.

Status: stage roles, stack membership, the trigger/run model, and the
one-session pipeline are decided (2026-09-29). The corpus is built. Artifact
schemas firm up alongside the evals.

---

## 0. Contracts first [DECIDED 2026-09-29]

The system and the eval suite are built in tandem against a shared,
versioned contract: **`contracts/`** (read `contracts/README.md`).
**Implementation starts there, before any agent code.**

- **The system owns:**
  - the artifact schemas (`contracts/schemas/`)
  - the id rules and the text normaliser (`contracts/normalize/`)
  - the scenario input
  - the run layout and telemetry
- **The eval side** specifies the stage entry points and test hooks, and
  owns the consumer-driven contract tests (CT1–CT8), which run in the
  system's CI.
- **Build order for the system implementation:**
  1. **G0:** freeze the contract. Implement the TS normaliser and pass
     `contracts/normalize/test_vectors.json`. Stub every stage to emit
     schema-valid placeholders through the `harness` CLI.
  2. **G1:** stage 1, stage 3 and single-stack stage 4 for real, injectable,
     on one config (O1 GLM), with token telemetry. This starts the eval
     improvement loop, so reach it early, even with naive prompts.
  3. **G2:** full pipeline on TR-01 (scenario T1); stage 5 injectable;
     complete tool-call telemetry; per-stack findings persisted.
  4. **G3:** all test hooks (faults, resume, corpus_root, as-of, profile) and
     every matrix config. This is **full readiness**.
- **Readiness signal:** flip the gate in `contracts/READINESS.md` with the
  date, contract version, and the run id that passed the gate's contract
  tests (`contracts/README.md` §6).
- **The artifact shapes in this document** (`ChangeRecord`, `ScopeTrace`,
  `StackFinding` §5, `ImpactReport`, `CoverageStatement`) are normative
  **only through the schemas**. If this prose and a schema disagree, the
  schema wins; update the prose.

## 1. Framing [DECIDED]

- The use case exists to demonstrate an **agent harness running as a
  long-running background job**. The orchestrator is an agent, not a code
  workflow.
- Human interaction happens at two points only:
  - **Setup:** company profile, optional custom instructions, and one source
    URL per monitored authority.
  - **Output:** an aggregated report, ranked, itemised by category; suggested
    next actions later (step 6).
- One company vault is read by many trigger runs. Each trigger event is one
  eve session (§2a).
- Current scope: the agent is smart enough to **prioritise intelligently**.
  Next actions are the eventual extension.

## 2. Pipeline at a glance

```
 trigger fires (cron / replayed snapshot)
        │
 [0] Diff + normalise ─────────────── code ──────────► exit: no substantive diff
        │  RawChange
 ┌─ ORCHESTRATOR SESSION (one agent thread, durable) ──────────────────────────┐
 │ [1] Understand the change ─► ChangeRecord (noise filtered, categorised)      │
 │ [3] Scope over stack manifests ─► ScopeTrace (every stack, in/out + reason)  │
 │        │ fan out: one subagent per in-scope stack                            │
 │        ▼                                                                     │
 │   ┌ SUBAGENT per stack (fresh context, own lane) ──────────────────────┐     │
 │   │ [2] Applicability to this stack                                    │     │
 │   │ [4] Analysis: hops, citations, labels ─► StackFinding              │     │
 │   └────────────────────────────────────────────────────────────────────┘     │
 │        │ citation verifier (code, runtime retry)                             │
 │ [5] Aggregate, resolve cross-references, label, rank ─► ImpactReport         │
 │     + CoverageStatement                                                      │
 └──────────────────────────────────────────────────────────────────────────────┘
```

Every artifact is persisted in the run directory. The session is durable
(checkpointed per step); each subagent run is the unit of retry.

## 2a. Trigger, run, and vault [DECIDED 2026-09-29]

**One trigger is one monitored authority.** [JASON] In production that is a
single case-law or other authority URL. A cron fetches that URL and compares
a content hash with the previous fetch. A changed hash is one trigger event.

**Snapshots mock that shape.** [JASON] Eval inputs are frozen snapshots of
that same URL over time. Two documents that would not be hosted together are
two triggers, even when they sit in the same topic folder today. A
proclamation, a CBP bulletin, a derived annex note, and a distractor statute
are not versions of one source. Successive fetches of one URL are.

**One vault, many runs.** [JASON] The company corpus is a shared read-only
vault. Every trigger run reads it. A run does not own a private copy of the
documents, and it does not read another run's findings (§7).

**One eve session per trigger event.** [JASON] Stages 1, 3, the subagent
fan-out, and stage 5 are a single orchestrator session. Stage 5 continues
that session. It does not start a fresh one. Each subagent still gets a fresh
context. Continuing the session keeps the stage-1 reading available so stage
5 does not spend those reasoning tokens again.

A run is one trigger's previous snapshot and its new snapshot (no previous
snapshot on the first observation), the as-of date, the company profile,
optional custom instructions, and the shared vault.

## 3. Ownership and handoffs

| # | Stage | Owner | Sees | Emits | Early exit |
|---|---|---|---|---|---|
| 0 | Diff + normalise | Code | old/new snapshot | `RawChange` | Whitespace / markup / encoding only |
| 1 | Understand | Orchestrator | `RawChange`, full source, company profile, custom instructions | `ChangeRecord`: categorised changes, effective date, legal status, who it applies to, verbatim source cites | All changes are noise (rephrasing, semantic equivalence), logged |
| 3 | Scope | Orchestrator | `ChangeRecord`, stack manifests, custom instructions | `ScopeTrace` | None (all-out is valid and logged). A user-directed high-confidence stack blacklist is an exclusion, not an early exit of the run |
| 2+4 | Applicability + analysis | Subagent per stack | brief (tree in the prompt), `grep` and paginated `read` inside the reading set | `StackFinding` (§5) | "Not applicable / not affected" with reason |
| 5 | Aggregate + rank | Orchestrator (same session as 1) | `ChangeRecord` and custom instructions still in context; `fetch_stack` for one family at a time; re-dispatch when a finding is too thin | `ImpactReport`, `CoverageStatement` | — |

**Why steps 1 and 2 are separate** [DECIDED]: different responsibility.
Step 1 synthesises the whole source into one coherent, categorised change
report and filters noise. Step 2 is decided **per stack** by the owning
subagent, which has room to explore within its lane.

**Why stage 1 and stage 5 share a session** [DECIDED]:
1. The orchestrator doesn't have to re-read or re-understand the full change.
2. Continuity of coverage: the agent that listed what changed is the one that
   checks every change was accounted for.
3. It leaves room, if evals point that way, to re-dispatch subagents case by
   case or across cross-cluster slices.
4. A fresh stage-5 session would re-spend the stage-1 reasoning tokens.
   [JASON 2026-09-29] The pipeline does not do that. One trigger event is one
   eve session (§2a).

**Cross-stack effects** [DECIDED]: only the stage-5 orchestrator reasons across
stacks, over distilled findings. Subagents stay in their lane and record
outbound references in `cross_references`. Most-favored-customer, flow-down,
cost pass-through, additional insured, and same-party links are this kind of
effect. They are not `incorporates` edges and they do not expand a stack
(§4).

**Where handoffs help:** 1/3→2+4 (context isolation, parallelism); 2+4→5
(orchestrator reasons over findings, never raw contracts).
**Where they hurt:** 2+4→5 if findings are thin. The `StackFinding` must carry
everything stage 5 needs. When it does not, stage 5 re-dispatches that
subagent with a narrower question (§8, Tools). It does not search the vault
itself.

## 4. Stage notes

### Stage 0: Diff + normalise
- [JASON] One authority URL per trigger. A cron compares content hashes;
  a changed hash fires the run. Evals replay frozen snapshots of that same
  URL (§2a).
- [DECIDED] The formatting-only exit is deterministic: normalise whitespace,
  markup, encoding, then diff. Anything left over goes to stage 1.
- [OPEN, deferred] Legal-status changes (stayed, vacated) often come from a
  different source than the monitored page. Record status "as of snapshot
  date".

### Stage 1: Understand the change (orchestrator)
- Synthesise the full source into categorised changes, each with verbatim
  cites (same verifier as stage 4).
- Filter noise the code diff can't: rephrasing and semantic equivalence.
  Dismissed changes are logged, not dropped.
- Legal status lives here: it describes the change, not the contract.

### Stage 2: Applicability (subagent, per stack)
- [DECIDED] Decided per stack by the owning subagent, after the profile is in
  its brief. When in doubt, investigate; tuned in evals.
- [DECIDED] **Company-level gate in stage 1.** The orchestrator makes a
  company-level applicability call from the profile and records it in the
  `ChangeRecord`; subagents decide stack-level applicability only. The gate is
  **lenient**: the orchestrator hasn't read the company's documents, so it
  exits only when the profile alone makes non-applicability clear ("covers
  banks only" for a plumbing company). Anything less certain proceeds. Exits
  are logged.

### Stage 3: Scope (orchestrator)

**Stack membership** [DECIDED 2026-09-29]. No knowledge graph. The fan-out
unit is a contract family, not the company's obligation graph. A stack is
one connected component of `cluster` and `parent_id`:

- Documents that share a `cluster` value are in the same stack. A closing
  set (purchase agreement, seller covenant, note) is a cluster of peers.
- A `parent_id` edge joins a document to its parent. Walk it up and down,
  including files that live outside the cluster folder. A work order, an
  invoice, or a signed instance joins the stack of the document it points at.
- A component of one document is its own stack.
- Shared directories (`invoices/`, `purchase-orders/`, `work-orders/`,
  `signed-agreements/`) are not stacks. The path does not grant membership.

`parent_id` is one optional string. Many children may name the same parent,
so the family is a tree plus cluster edges. A document has one parent and
sits in one stack. Membership is only as good as the edges that exist: a
purchase order with no `parent_id` and no `cluster` is its own stack until
that link is filled in.

**`incorporates` is a junction table** [DECIDED 2026-09-29]. An array of ids
on the document is the wrong grain: the hop is a named clause, and stage 3
has to ask the reverse question ("who names this terms page?"). Each row is
one edge:

| Field | Meaning |
|---|---|
| `source_doc_id` | The document that contains the incorporating clause |
| `target_doc_id` | The external document that clause names |
| `clause_heading` | Heading of that clause |
| `section` | Section id as it appears in the source |
| `quote` | Verbatim incorporating language |
| `version_pin` | Optional. The version the clause selects, in its own words ("as published October 2019", "as in effect on the date of shipment") |

The edge type is only `incorporates`. A row exists only when the source text
names the target. Nothing is inferred. Most-favored-customer, flow-down,
pass-through, additional insured, and same-party links are not rows here.

In this repo the junction is an edge list beside the manifest, not a SQL
database. One hop, and only outward:

- A stack's **reading set** is its family, plus the `target_doc_id` of every
  row whose source is in the family. The subagent may read those targets.
- Do not walk from a target into the target's own family. Do not walk down
  to other sources that name the same target. Shared terms do not merge
  the families that name them.
- The target stays its own document. It is not a member of the source stack.
  Many families may name one terms page. Each family is still its own
  subagent.
- When the trigger URL is itself an incorporated document, stage 3 treats
  every family with a row pointing at that target as relevant. That lookup
  is a query on the junction. It does not fuse those families. Default-in
  scoping still applies to everyone else.

- [DECIDED] **Stack manifests** are generated for the eval corpus and stated as
  a system assumption (a future ingestion component, not the focus of this
  build). Per stack: parties and roles, contract type, governing law, term
  dates, member files and roles, key clause types present (CUAD taxonomy),
  and the `incorporates` rows whose source is in the family (target plus the
  naming clause). The junction itself is produced the same way, from the
  corpus, not discovered by the agent at runtime.
- Scoping is the most dangerous decision (an excluded stack is an uncatchable
  miss): default in, exclude with a reason, every exclusion in `ScopeTrace`,
  scope recall evaluated separately. A user-directed blacklist (§4, custom
  instructions) is one such exclusion. It still requires a reason.

### Stage 4: Analysis (subagent, per stack)
- Frame: the rights, obligations and exposures the change creates under this
  stack, not "stale clauses". Includes opportunities, running deadlines,
  missing protections, and decoys logged as not affected.
- Follows hops inside the family, and follows each `incorporates` row one
  hop to that target. It does not open the target's other documents, and it
  does not open a second family. The hop chain cites the naming clause.
- Citation verifier: code checks every quote verbatim; one retry, then "needs
  review". A runtime reliability mechanism: report citations originate here,
  and fixing them while the document is in context is cheap. As an **eval**,
  citation fidelity is measured only on what the final output displays
  (`eval-design.md` §1).

### Stage 5: Aggregate and rank (orchestrator)
- Continues the same eve session as stages 1 and 3. [JASON 2026-09-29]
- Receives distilled findings; resolves `cross_references`; checks every
  `ChangeRecord` item was covered; assigns final labels with cross-stack
  context; ranks; writes the report.
- Reads the custom instructions again here, for ranking, grouping, and what
  is logged rather than shown.

### Custom instructions [DECIDED 2026-09-29]

Near total freedom. [JASON] The orchestrator sees the GC's instructions at
the start of the session and reads them again at stage 5.

- **Stack blacklist.** When the instructions direct it, and confidence is
  high, the orchestrator may exclude stacks before fan-out (for example,
  "ignore the fleet leases"). Each exclusion is written to `ScopeTrace` with
  the instruction that caused it. This is a scope decision. It is not a
  silent drop of a finding that was already produced. Findings from stacks
  that did run are still conserved at stage 5. Eval-design M3 (out-of-focus
  items become logged dismissals, and nothing already produced is deleted)
  still applies to those findings.
- **Subagent prompt.** There is one strong universal default. The
  orchestrator's default is to send that prompt alone, so the default can be
  hill-climbed on its own. It may also pass an optional extra, adapted from
  the custom instructions, only when those instructions apply to that stack.

## 5. The `StackFinding` contract (draft)

A stack returns an overall determination plus a **list** of findings. Findings
are ranked, not stacks. [DECIDED]

**Stack level:** `stack_id`, `applicability` (applies / doesn't / undeterminable
+ reason), `determination` (affected / not affected / needs review),
`files_read`, `files_unparseable`, `cross_references`.

**Per finding:**

| Field | Type | Notes |
|---|---|---|
| `change_ref` | id of the `ChangeRecord` item | lets stage 5 check coverage |
| `finding_type` | frozen enum (§6) | |
| `hop_chain` | ordered cites + one-line inference each | |
| `citations` | file, page/section, verbatim quote, clause heading | verified |
| `absence` | clause type expected but not found, where searched | |
| `urgency` | category (§6) + `deadline` (date or rule, trigger event, cite) | |
| `materiality` | material / not material / undeterminable | + the test that fired or the missing fact |
| `direction` | exposure / recovery / both / neutral | |
| `exposure_basis` | value, volume, rate, or "unknown" + cite | optional raw facts |
| `response_type` | frozen enum (step-6 menu) | labelled, not planned |
| `reasoning` | short | |
| `open_questions` | facts the subagent couldn't find | |

## 6. Prioritisation

**Mental model** [DECIDED]: urgency (is a clock running; what's lost when it
runs out?) and magnitude (does this matter enough to act on?).

**Every judged dimension is categorical** [DECIDED]: a few categories defined
by meaning, each with a one-line test; an "undeterminable" category that names
the missing fact; no ordering exposed to the LLM.

**Urgency**: forfeitable clock running · obligation clock running · clock
pending on a known future event · no clock · undeterminable. Days remaining is
arithmetic when a date exists. Default urgency window when the GC gives none:
**30 days** [DECIDED].

**Materiality**: material if any test fires (shifts a recurring cost or
benefit; creates, removes or changes the value of a right; creates a
compliance or breach risk; starts a clock; meets the GC's threshold *if one was
given*). Otherwise not material. Undeterminable names the missing fact.

**Legal status** (per change, stage 1): in force · enacted, effective later · in
force but challenged · stayed or enjoined · proposed · vacated or repealed ·
undeterminable.

**Direction**: exposure · recovery · both · neutral. Used to group the report,
not to rank.

**Frozen categories** [DECIDED]: `finding_type` and `response_type` are frozen
enums; priority is inferred from labels. Revisit only if a scenario shows
dynamic categorisation ranks better.
- `finding_type` (**contract v0.1.0**; exactly one per finding, by precedence): deadline-bound right · deadline-bound obligation · liability / compliance exposure · recovery opportunity · **billing discrepancy** · cost exposure · consistency gap · clerical update · watch. The canonical values are in `contracts/schemas/common.schema.json`.
- `response_type` (**contract v0.1.0**): send notice · exercise pass-through · seek refund or credit · renegotiate (incl. change orders) · update template · escalate to outside counsel · brief finance · monitor · no action.

**Where the intelligence lives.** [SUGGEST] The orchestrator agent assigns the
final labels with full cross-stack context (e.g. upgrading a supplier
pass-through to urgent because a fixed-price customer contract sits
downstream). A deterministic sort over labels produces the order, and the
agent writes the one-line rationale per item. Proposed sort:
1. legal-status gate (stayed / proposed / vacated → watch band)
2. materiality: material → undeterminable → not material (logged, hidden by
   default)
3. urgency: forfeitable → obligation → undeterminable → pending → no clock
4. days remaining, then exposure if known

**Eval experiment** [SUGGEST]: score label accuracy separately from rank order,
and compare A) labels + deterministic sort, B) orchestrator ranks freely,
C) A with the agent allowed to reorder within ties, with a reason. Measure
against answer-key order and run-to-run agreement. This tests the
frozen-vs-dynamic question directly, separating category naming from ordering.

## 7. Context, durability, memory

- Each subagent gets a **brief, not a transcript**: the relevant
  `ChangeRecord` items, the profile, the family tree, and the universal
  default prompt. File bodies are not in the prompt. An adapted slice of the
  custom instructions is added only when the orchestrator judges that they
  apply to that stack. [DECIDED 2026-09-29]
- **Orchestrator context budget.** One long session holds the full source
  *and* every finding, so context grows with the portfolio (200 stacks ×
  ~1.5k tokens ≈ 300k). Tools available: subagents write the full
  `StackFinding` to the run directory and return a compact summary; eve's
  built-in compaction (on by default, triggers at 90% of the window,
  configurable). [DECIDED] For now, **measure, don't optimise**: context used
  per run, in aggregate and split orchestrator vs subagents. Optimise later if
  the numbers call for it.
- Subagent budget: bounded tool calls; on exhaustion, partial findings marked
  "needs review" plus what wasn't read.
- Unparseable files go to the coverage statement.
- Full end-to-end trace persisted per run (internal only).
- **Memory across runs** [DECIDED]: the orchestrator handles each diff; long-term
  memory is the historical log of findings tables across runs. Nothing more.
  The orchestrator **does not read** that log in this project's scope; each
  run is independent. [DECIDED 2026-09-28]
- **Cross-stack consistency** [DECIDED]: the same clause template labelled
  differently in two stacks is plausible (different POs, governing law,
  Incoterms), so it is **not** flagged. Instead it's an **eval metric**: plant
  shared templates with controlled context and check the labels agree when the
  context agrees and diverge when it doesn't.

## 8. Harness and runtime

### Options compared

| Dimension | Vercel AI SDK (plain) | eve (Vercel) | pi (Mario Zechner) |
|---|---|---|---|
| What it is | Library: model calls, tool loop, `Agent` / `WorkflowAgent` | Framework on AI SDK + Workflow SDK; agent = directory of files | Minimal harness: unified provider API (`pi-ai`), agent loop (`pi-agent-core`), coding CLI |
| Durability | None built in; add Workflow SDK (`WorkflowAgent`) or Temporal | Every session is a durable workflow, checkpointed per step; resumes after crash or deploy | None; interactive sessions saved to disk |
| Subagents | Build your own | Built in: declared subagents (`agent/subagents/<id>/`), fresh context, own tools, `outputSchema` returns structured results; fan-out supported | Deliberately absent; spawn `pi --print` processes or write an extension |
| Context isolation | Manual | Child never sees parent history; parent packs the brief | Separate processes |
| Evals | Bring your own | `.eval.ts` suites, local or CI | Bring your own |
| Tracing | OTel via AI SDK telemetry | OTel traces of model calls, tools, sandbox; exportable | Session logs |
| Skills / instructions | Manual | `instructions.md`, `skills/` loaded on demand | Minimal prompt; extensions and skills |
| Triggers | Manual | `schedules/` (cron), HTTP sessions, channels | Manual |
| Sandbox / filesystem | Manual | Docker / microsandbox / just-bash locally | Read, write, edit, bash tools |
| Maturity | Stable | **Public beta** (June 2026), APIs may change | Stable, popular, coding-focused |
| Portability | Anywhere | Runs locally (`.eve/.workflow-data`) or self-hosted; Vercel is the first-class target | Anywhere |

### Session shape [DECIDED 2026-09-29]

One eve session per trigger event (§2a). That thread runs stages 1 and 3,
fans out subagents, then continues into stage 5. Fan-out is one declared
subagent type invoked once per in-scope stack, each with a fresh context.
Artifact schemas (`RawChange`, `ChangeRecord`, `ScopeTrace`, `StackFinding`,
`ImpactReport`, `CoverageStatement`) are filled in as the evals firm up.
They are not a precondition for this session shape. [JASON]

### Decision [DECIDED]
**eve**, run locally. It occupies the combined place of Temporal + AI SDK.
- Its primitives map one-to-one onto this design: durable session =
  orchestrator thread; declared subagent with `outputSchema` = per-stack
  analyst returning `StackFinding`; `skills/` = legal playbooks (hop checklist,
  category definitions); `schedules/` = monitoring cron; built-in evals and
  traces = the eval and audit story.
- It's AI SDK underneath, so existing familiarity carries over, and model
  strings make multi-model comparison a config change.
- It's named in the brief.
- **pi** is a great minimal loop but is interactive and coding-oriented, with
  no durability and no subagents by design. You'd build the two things this
  project is supposed to showcase before starting on the legal problem.

### Temporal [DECIDED: not added on top of eve]
- eve already gives durable execution through the Workflow SDK. Temporal on top
  would be two durability layers.
- Temporal is the right call for **plain AI SDK** (its `AiSDKPlugin` wraps model
  calls as activities; tools become activities). It's more mature, but needs a
  Temporal server (local dev server is easy) and workflow/activity determinism
  discipline.
- So the real choice is **eve (Workflow SDK)** vs **AI SDK + Temporal**. The
  fallback, if eve's beta bites, is AI SDK `WorkflowAgent` or Temporal.

### How eve does durability (verified locally, eve 0.68.0, 2026-09-28)

**Mechanism** (docs plus inspection of the state directory):
- Each session is one Workflow SDK workflow. A **step** = one model call plus
  the inline tool calls after it; that's the checkpoint unit.
- State is an **append-only event log**, not SQLite. With the default local
  world it's one JSON file per event under `.eve/.workflow-data/` (`events/`,
  `runs/`, `steps/`, `hooks/`, `waits/`, `streams/`). Observed events:
  `run_created`, `step_created`, `step_started`, `step_completed`,
  `hook_created`, ...
- Recovery is **event-sourced replay**: the workflow re-runs, completed steps
  return their recorded results instead of executing, and an interrupted step
  re-runs from scratch (so side effects must be idempotent).
- A **queue** drives execution by POSTing to the app's own workflow routes.
  Local world: in-process queue. Vercel: Vercel Queues. Self-hosted:
  `@workflow/world-postgres` (Postgres + Graphile Worker).

**Crash test** (mock model, a 3-step tool loop with 6-second steps,
`kill -9` of every process during step 3):

| Mode | Result |
|---|---|
| `eve dev`, plain restart | Run left **dormant** by design; new messages to it are rejected |
| `eve dev --resume` | Re-enqueue attempted; interrupted step never re-ran (waited >90s); run stuck `running` |
| `eve build` + `eve start` | No re-enqueue on startup; run stuck `running` |
| `eve start` with `WORKFLOW_LOCAL_RECOVER_ACTIVE_RUNS=1` | Workflow re-enqueued on boot (log confirms), but the in-flight step still never re-ran |

Steps 1 and 2 were never re-executed, but no run ever completed, so replay was
not proven end to end. Likely cause: the step's queue message lived in the
in-memory queue and died with the process; replay sees `step_started` with no
completion and waits for a delivery that never comes. [INFERRED from logs and
event files, not confirmed in source]

**Conclusion:** with the local world, eve survives graceful restarts and parked
work, but **hard-crash recovery of in-flight work isn't reliable** in this
version.

**Crash resume** [DEFERRED 2026-09-29]. Not in this build. [JASON] The path is
known and is not a bespoke skip-list on the local world: a distributed job
system, or Temporal, which is already the fallback if eve's beta gets in the
way (§8). App-level "restart and skip finished stacks" and the Postgres-world
crash test are both out of scope. Artifacts are still written to the run
directory as the record of a run, not as a resume protocol.

### Spike before committing (half a day or less)
1. Orchestrator fans out N declared subagents **in parallel** with
   `outputSchema`, and gets structured results.
2. ~~Kill the process mid-run~~: done for a single session (see above).
   Repeating it across a subagent fan-out is part of crash resume, which is
   deferred.
3. Re-dispatch: docs say every child starts fresh. Confirm that a
   re-dispatched subagent with its prior `StackFinding` in the brief is good
   enough (it's arguably cleaner than continuing a thread). Not required
   while crash resume is deferred.
4. ~~Compaction~~: built in (docs). Measure first (§7).
5. ~~Local file access~~: decided. Subagents get `grep` and paginated `read`,
   scoped to the reading set. The orchestrator does not (§8, Tools).

### Tools [DECIDED 2026-09-29]

**Subagent.** [JASON] Two tools, both confined to the reading set (the family,
plus one `incorporates` hop). A path outside that set is refused by the tool.
The pair is deliberate: `grep` discovers where to look, `read` fetches that
place. [DECIDED 2026-09-29]

A **page** is whichever boundary the file actually has. `grep` and `read`
share that number.

- **PDF, and any extract that kept the PDF's page map.** The page number is
  the file's own page, from 1. It is known from the PDF. Ingest keeps the
  map. A markdown copy that dropped it does not get a synthetic number in
  its place.
- **HTML and other text with no page map.** Triggers, web terms, and files
  that were never paginated. A page is 40 lines, numbered from 1. A file
  under 40 lines is page 1.

The 20-page cap is 20 of those pages. For a PDF that is 20 document pages.
For HTML it is 800 lines.

- `grep` searches the whole tree. An optional file filter narrows it to one
  file. Each hit is the filename, the page number, and a one-line snippet,
  so the next call can be `read` of that file and page. The tool result is
  at most **1,500 tokens** (about 25 hits). That is enough to choose what to
  read, and small enough that a few searches do not fill the subagent. When
  the query matches more than fits, the result is the total count, the first
  hits that fit in the budget, and the line: "This search returned N results.
  Refine or narrow the search to see specific results." It does not return
  the rest.
- `read` is one file, and only pages of that file. Arguments are the file and
  a start page. It returns at most **20 pages**. A short file comes back in
  one call. A long agreement does not. When the cap is hit, the
  result includes the pages that fit and tells the model to do one of two
  things: `grep` to narrow by section or keywords, or `read` the next page
  range. Both are valid. The tool does not choose for it.

The family tree is in the subagent's prompt, not something it discovers:
members, `parent_id` and `cluster` links, and `incorporates` rows (target and
the naming clause). File bodies are not in the prompt. Every `grep` and
`read` records the path, the page, and how many lines came back, so a claimed
full read of a truncated file can be checked (eval-design V6). Tool calls
stay bounded. On exhaustion the finding is partial and marked "needs review,"
plus what was not read.

**Orchestrator, until stage 5.** [JASON] The only tool is dispatching a
subagent, one call per in-scope stack. The trigger text, profile, custom
instructions, and the stack index (manifest summaries) are session inputs.
It does not grep or read the vault while it is scoping.

**Orchestrator, stage 5.** It does not get `grep` or `read`. Those tools are
how a stack is understood. Used again here, they pull raw contracts back into
the session that is supposed to stay on distilled findings, and they spend
the context the subagents were created to protect.

What it gets instead:

- `fetch_stack(stack_id)` returns that family's tree and the `StackFinding`
  already written for it. One stack at a time, so a join can look at the
  two families it names without holding every finding and without a flat
  search over the vault.
- Re-dispatch of that same subagent, with the thin spot named in the brief,
  when the finding cannot support the join. The child still starts fresh,
  still limited to its reading set.

The report quotes come from the finding. The citation check has already run
while the document was in the subagent's context. Stage 5 does not open the
file to hunt for a better clause.

<!-- Lever, not built. If stage-5 joins are too thin, allow this session
     opt-in grep/read with an explicit file and an explicit search term.
     No tree-wide search. Leave it off until the findings contract proves
     insufficient. -->

Code around the session is unchanged: stage 0 diff and hash compare, the
citation check, manifests and the `incorporates` junction generated ahead of
the run, artifacts written to the run directory. Jev via a `classify` tool
remains a suggestion (§8, Models).

### Models [DECIDED 2026-09-29: open-weight first, closed reference, Jev labeller variant]

**Goal** [JASON]: demonstrate evaluating several models and improving the
system efficiently from the results. The matrix is chosen for **contrast**
between model archetypes, access paths and cost, not to find the best model.

**Roles.** Two agentic roles with different demands, plus one
classification role:

| Role | What it needs | Context pressure |
|---|---|---|
| Orchestrator (stages 1, 3, 5; one long session) | Long-context synthesis, cross-stack reasoning, report writing | **High.** The TR-02 source alone is ~88k tokens, plus all findings |
| Per-stack subagent (stages 2+4; many short sessions) | Reliable tool calling, careful reading, schema-valid findings | Low–medium; the largest single document is ~110k tokens |
| Classifier (fixed label sets, as a tool call) | Consistent categorical judgement | Tiny |

**Candidate models and access paths**
(prices per 1M tokens, input / output; open-weight prices to VERIFY on the
Gateway page before use: some input figures may be cached-input rates):

| Model | Archetype | Access path | Price | Context | Notes |
|---|---|---|---|---|---|
| `claude-haiku-4-5` | Closed, small | Anthropic API key (`anthropic("claude-haiku-4-5")`) | $1 / $5 | 200K | Cache minimum 4,096 tokens; context too small for the orchestrator on TR-02 |
| `claude-sonnet-5` | Closed, mid | Anthropic API key (`anthropic("claude-sonnet-5")`) | $2 / $10 | 1M | The orchestrator candidate when using Claude |
| `gpt-5.6-luna` | Closed, small | **ChatGPT subscription** via `chatgpt("gpt-5.6-luna")`, local `eve dev` only | Subscription (API list $0.20 / $1.20) | 1.05M | Near-zero marginal cost; plan rate limits; reasoning tokens bill as output on the API |
| `zai/glm-5.3-flash` | **Open-weight**, agentic-tuned | Vercel AI Gateway key | ~$0.03 / $0.25 (VERIFY) | 1M | Cheapest credible agentic option; MIT-licensed family |
| `deepseek/deepseek-v4.1-flash` | Open-weight, cheap MoE | AI Gateway | ~$0.02–0.30 / $0.42–1.20 (VERIFY) | 1M | Alternate open-weight; off-peak pricing exists at the source |
| `minimax/minimax-m3` | Open-weight, agentic MoE | AI Gateway | ~$0.24 / $0.96 (VERIFY) | 1M | Reserve pick if GLM's tool calling is unreliable |
| Jev (TypeSafe System One) | Classifier | TypeSafe API | TBD | – | Fixed label sets; returns probabilities (principled "undeterminable") |

**Configurations to evaluate** [DECIDED 2026-09-29: open-weight first]

| Config | Orchestrator | Subagents | Classifier | Role in the story |
|---|---|---|---|---|
| **O1 GLM** | GLM-5.3-Flash | GLM-5.3-Flash | self-label | **Primary.** Open-weight, agentic-tuned, ~$0.10 per suite |
| **O2 DeepSeek** | DeepSeek V4.1 Flash | DeepSeek V4.1 Flash | self-label | Second open-weight model: the model comparison the brief requires |
| **R1 Luna** | Luna (ChatGPT subscription) | Luna | self-label | **Closed reference** at ~$0 marginal: calibrates whether low open-weight scores are the model or the eval |
| **J (labeller variant)** | best of O1/O2 | same | **Jev** | Same pipeline, labels from Jev via the `classify` tool. Isolates the classification lever (accuracy, dangerous confusions, abstention curve) |
| **X (optional)** | best orchestrator | cheapest reliable subagent | best labeller | Role-based routing in open-weight form, **only if** per-stage results show the roles diverge |
| **S (ceiling check)** | Sonnet 5 | Sonnet 5 | self-label | ~20 sentinel items, run once (~$1–2), and **only if** R1 also scores low, to establish that the eval is passable |

MiniMax M3 is the reserve if either open-weight model's tool calling proves
unreliable. Haiku, and the Sonnet-orchestrator + Haiku-subagent mix, are
**dropped from the core matrix**: Haiku's 200K context is a liability for
the orchestrator, and the open-weight models make its price point
irrelevant. The Anthropic key is needed only for the optional ceiling check.

**How this produces the improvement narrative:**
- O1 vs O2 is the model comparison and choice.
- O vs R1 checks the open-weight results against a closed reference.
- J shows the labeller lever (LLM self-label vs a dedicated classifier).
- X composes winners by role, only when justified.

Each step is driven by per-stage unit evals rather than one headline
number.

**Eval hygiene for multi-model runs:**
- **Pin the upstream provider** for Gateway-routed open-weight models where
  possible. Otherwise run-to-run variance mixes model noise with provider
  noise.
- **Schema adherence varies:** strict structured output isn't uniform across
  providers. V1 (schema) and the retry-then-"needs review" path absorb it;
  report the failure rate as a metric.
- **Record model ID, provider, date and price per run.** Gateway prices
  move month to month.
- **Data handling:** the corpus is synthetic or public, so any provider is
  fine for the take-home. A production GC deployment would restrict providers
  by data-processing terms (noted, not built).

**Access setup:**
- `/login` in `eve dev` supports ChatGPT Subscription, Anthropic API Key,
  OpenAI API Key, and a Vercel AI Gateway key or account.
- Gateway model strings (`zai/glm-5.3-flash`) work directly in
  `defineAgent({ model })`.
- See `eval-design.md` §13 for costs and budget tiers.

**How Jev fits (unchanged).** The subagent does the agentic part: finds
clauses, follows hops, extracts facts and cites. A `classify` tool then sends
the evidence to Jev per fixed category set. That separates extraction from
classification, and both can be evaluated on their own. Jev's probabilities
fall within the context doc's classifier exception and give a principled
"undeterminable" below a tuned threshold.

### GC-facing vs dev-facing output [DECIDED 2026-09-28]
- **GC view:** per item, what / why / when, grouped by category. Each item
  shows the cited trigger change, the cited document clause, and a short
  summary of how they intersect.
- **Dev view:** the hop chain, full findings, scope trace and run trace.

### UI
- Setup: a form (profile, custom instructions, source URL) that starts a
  session over eve's HTTP API.
- Output: a static report page rendered from the run's `ImpactReport` JSON,
  grouped by direction and category, ranked, with citations expandable to the
  source.
- Vite + React, or static HTML. Live progress over eve's NDJSON stream is a nice
  extra, not required.

## 9. Open questions

- [OPEN] Ranking approach A/B/C (§6): settle by eval.
- [DECIDED 2026-09-29] Durability for this build is the local eve world only.
  Crash resume is deferred. The known path later is Temporal or another
  distributed job system, not a resume layer on the local world.
- [OPEN] Enum validation against both tariff triggers and the noncompete slice
  before freezing the drafts.
- [DECIDED] GC AI trial account used as an informal baseline, not a formal
  scored comparison.
- [DECIDED 2026-09-29] Corpus is built. Stack membership, the one-URL trigger,
  and one session per trigger event are in §2a and §4.
- [DECIDED 2026-09-29] `parent_id` stays one-to-many and defines the family.
  Many-to-many incorporation is the `incorporates` junction (§4): one hop,
  named clause on the row, and it does not put one file in two stacks.
- The materiality-classifier question is moot now that materiality is a
  categorical label.

## 10. Pipeline smoke runs [SUGGEST]

A few single-run integration tests, separate from the scorecard. Each is one
trigger event against the shared vault. They check that the pipeline is
wired: the session stays one thread, artifacts are written, `ScopeTrace`
lists every stack, shown citations occur in the cited file, and findings
that were produced appear in the report. They do not lock label gold, which
is still moving.

1. **Hash gate.** Two snapshots of one URL that match after whitespace
   normalisation, or that are byte-identical. Stage 0 exits. No orchestrator
   session starts.
2. **Positive, one statute.** TR-12 (AB 692) as a first observation of that
   one chaptered bill. Employment stacks come in, supply stacks stay out, at
   least one surfaced citation checks out, and a pre-cutoff agreement comes
   back not affected or is excluded with a logged reason.
3. **True negative.** TR-03, one Federal Register snapshot, relevant set
   empty. `ScopeTrace` covers every stack, no finding is invented, and the
   report says there is no exposure.
4. **Blacklist.** The same trigger as (2), with instructions that name a
   stack to ignore. That stack is excluded on `ScopeTrace` and is not
   dispatched. The other in-scope stacks still run.

A single copper-proclamation snapshot pair, read against the Great Plains
stack, is the later demo of multi-hop analysis. It is a poor health check
while TR-01 is still several URLs in one folder, and while several of its
gold lines are still unverified.
