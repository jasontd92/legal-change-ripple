# System ↔ Eval Contract (v0.1.0)

The interface between the **system implementation** (the eve harness:
`system-design.md`) and the **eval implementation** (answer keys, scorers,
runs: `eval-design.md`, `eval-scenarios/HANDOFF.md`). The two sides are built
in tandem; this contract is what lets them work in parallel against stubs.

Version in `VERSION`. Status: **v0.1.0 draft. Freezing it is gate G0
(§6).**

## 1. Ownership
| Surface | Owner | Other side's role |
|---|---|---|
| Artifact schemas (§2.1): the product's API, also consumed by the GC report UI | **System** | Eval: required reviewer; writes contract tests |
| Identifiers, spans, normaliser (§2.2) | **System**, co-signed by eval (a change breaks every answer key) | Eval: owns the test vectors |
| Scenario input (§2.3) | **System** | Eval: supplies scenarios in this shape |
| Stage entry points and test hooks (§2.4, §2.6) | **Eval specifies, system implements** | – |
| Run layout and telemetry (§2.5) | **System** | Eval: specifies the required fields (V6, cost, funnel) |
| Contract tests (§5) | **Eval** (consumer-driven); run in the system's CI | System: must stay green |
| Answer-key schema and scorer I/O | **Eval** only | – |

**Rule:** evals measure the real product and never shape it. The system may
change a schema freely by bumping `VERSION` (semver: breaking = major, or
minor while at 0.x), as long as the contract tests pass. Gold files record the
contract version they were authored against.

## 2. Surfaces

### 2.1 Artifact schemas (`schemas/`, JSON Schema 2020-12)
| File | Artifact | Stage |
|---|---|---|
| `scenario-input.schema.json` | One runnable scenario | input |
| `change-record.schema.json` | `ChangeRecord` + company gate | 1, 1b |
| `scope-trace.schema.json` | `ScopeTrace`: must list every stack (V11) | 3 |
| `stack-finding.schema.json` | `StackFinding`: one per in-scope stack; findings with two surfaced citations, hop chain, labels, facts | 2+4 |
| `impact-report.schema.json` | Ranked `ImpactReport` (array order = rank), not-material log (V8), cross-reference resolutions (V9), change-item closure (V10) | 5 |
| `coverage-statement.schema.json` | `CoverageStatement` | 3–5 |
| `run-trace.schema.json` | Run summary + per-agent tokens and tool calls | all |
| `common.schema.json` | Enums, `span`, `stack_id`, `model_config` | shared |

**Enum decisions (2026-09-29, pre-freeze; Jason deferred to the
recommendation):**
- `finding_type` gains **`billing_discrepancy`**: a counterparty charging
  outside its contract or on a lapsed basis. It's distinct from
  `recovery_opportunity`, which is exercising a contractual or statutory
  right: different fix, different owner.
- **Exactly one `finding_type` per finding,** chosen by the precedence order
  written in the schema. "Needs review" is a `determination`, never a
  `finding_type`.
- `seek_refund_or_unwind_surcharge` is renamed **`seek_refund_or_credit`**
  (it covers refund filings, invoice disputes and credits, and surcharge
  unwinds). `renegotiate` includes change-order requests.
- The system emits one `response_type`. Answer keys may accept up to two.

Future gaps go through a contract change. Never put free text in an enum
field.

### 2.2 Identifiers, spans, normaliser
- **`stack_id`:** clustered docs → `<area>/<cluster folder>`; standalone
  docs → path under `corpus/documents/` without `.md`.
- **`span`:** `{file, start, end, section_label?, quote?}`.
  - `file` is repo-relative.
  - Offsets are **code points** into `normalize(file)`; `end` is exclusive.
  - "Citation locates" (V3) means the quote is contained in
    `text[start:end]`.
- **Normaliser:** `normalize/SPEC.md` (UTF-8, strip BOM, CRLF/CR → LF, NFC,
  nothing else). Python reference: `normalize/normalize.py`.
  - The TS harness must pass `normalize/test_vectors.json`. Run
    `python3 contracts/normalize/normalize.py` for the reference.
  - Quote comparison collapses whitespace (`norm_ws`); offsets never do.
- **Change-item ids** are system-assigned. Scorers map them to gold by anchor
  overlap. `finding.change_ref` must reference an id in the same run's
  `ChangeRecord` (V13).

### 2.3 Scenario input
`scenario-input.schema.json`: trigger group + version ids, `as_of`,
`profile` (`default` or a variant YAML path), `custom_prompt`,
`corpus_root` (overridable for fixtures and perturbed corpora).

### 2.4 Stage entry points (required for teacher-forced unit evals)
Language-neutral CLI. The eve harness exposes it as a thin script; the eval
side only ever shells out.
```
harness run   --input scenario.json --config config.json --out runs/<id>/        # full pipeline
harness stage --stage 1  --input scenario.json --config config.json --out DIR      # -> change_record.json
harness stage --stage 3  --input scenario.json --inject change_record.json ...    # -> scope_trace.json
harness stage --stage 4  --input scenario.json --stack <stack_id> --inject change_record.json ...  # -> findings/<stack>.json (one subagent)
harness stage --stage 5  --input scenario.json --inject change_record.json --inject-findings DIR ...  # -> impact_report.json, coverage.json
harness resume --run runs/<id>/                                                     # continue a killed run
```
- `--inject` files must validate against the matching schema.
- The run trace marks injected stages `"injected": true`.
- `config.json` holds `model_config` (common schema) plus hooks (§2.6).

### 2.5 Run directory layout and telemetry
```
runs/<run_id>/
  input.json  config.json  run.json          # run.json validates against run-trace.schema.json
  change_record.json  scope_trace.json  findings/<stack_id with / → __>.json
  impact_report.json  coverage.json  trace.jsonl   # trace.jsonl = raw event stream (debug; eve's own events are fine)
```
- Required telemetry per agent: `input`, `cached_input` and `output`
  tokens (plus `reasoning` where the provider reports it),
  `peak_context_tokens`, model, provider, and retries.
- Required per tool call: `file` and `chars_returned` / `file_chars` for
  read tools (the V6 coverage audit), `ok`, `error`, `injected_fault`.
- Findings are written the moment each subagent finishes (the app-level
  resumability decided in system-design §8).

### 2.6 Test hooks (in `config.json`)
| Hook | Purpose |
|---|---|
| `model_config` (orchestrator / subagent / classifier / provider_pin) | Model matrix O1/O2/R1/J/X/S |
| `scenario.as_of`, `scenario.profile`, `scenario.corpus_root` | M1, M2 / S1b, M5–M7 and I6 fixtures |
| `faults.tool_error: {tool, nth_call}` | I6 injected tool error |
| `faults.kill_after: {stage \| stack_count}` | I6 kill / restart (then `harness resume`) |
| `cache: on \| off` | Fresh samples for k-repeats vs cached upstream |
| `max_tool_calls_per_subagent` | Budget exhaustion path |

## 3. What each side can build before the other is ready
- **System:** stub every stage to emit schema-valid placeholder artifacts
  first, then replace stage by stage.
- **Eval:**
  - answer keys (all fields; offsets are safe once G0 freezes the normaliser)
  - scorers tested against **hand-written fixture artifacts** that validate
    against the schemas
  - contract tests

## 4. Versioning
- Bump `VERSION` on any schema, enum, id-rule or normaliser change.
- Record the change in `CHANGELOG.md` (create it on first change).
- A normaliser change forces recomputing answer-key offsets, so avoid it
  after G0.

## 5. Contract tests (eval-owned, run in system CI)
| Id | Checks | Needed for gate |
|---|---|---|
| CT1 | Every artifact in a run dir validates against its schema | G1 |
| CT2 | TS normaliser passes `test_vectors.json`; every span resolves (file exists, offsets in range); surfaced citations contain their quote | G1 |
| CT3 | `harness stage` accepts injected gold for stages 3, 4 and 5 and marks `injected` | G1 (3, 4) / G2 (5) |
| CT4 | `run.json` has per-agent token fields and read-tool `chars_returned` | G1 (tokens) / G2 (tool calls) |
| CT5 | Every `stack_id` exists in the corpus; `ScopeTrace` lists all stacks | G2 |
| CT6 | Enum fields contain only enum values | G1 |
| CT7 | `harness resume` after `faults.kill_after` completes without re-running finished stacks | G3 |
| CT8 | Every `model_config` in the matrix runs a 1-stack smoke scenario | G3 |

## 6. Readiness gates: when the system tells the eval side it's ready
Readiness is staged. The eval side doesn't wait for "done"; each gate
unlocks a class of evals. The system side flips a gate in `READINESS.md`
(create it at G0) with the date, contract version, and the run id that passed
the listed contract tests.

| Gate | System has delivered | Contract tests green | Unlocks for eval |
|---|---|---|---|
| **G0 Contract frozen** | Schemas, id rules, normaliser, and CLI signatures agreed; stubs emit valid artifacts | – (review sign-off by both sides) | Answer-key offsets; scorer development on fixtures |
| **G1 Unit-ready** | Stage 1, stage 3 and single-stack stage 4 runnable via `harness stage` with injection, on **one** config (O1), with token telemetry | CT1, CT2, CT3 (3, 4), CT4 (tokens), CT6 | Dev loop: teacher-forced unit evals S1a, S1b, S3, S4, LBL; sentinel stage-4 items; M7 clause removal |
| **G2 E2E-ready** | Full pipeline on **T1 (TR-01)** end to end; stage 5 injectable; complete tool-call telemetry; findings written per stack | + CT3 (5), CT4 (tool calls), CT5 | Stage-5 ranking (R1–R3, T3a/T3b pair); invariants V1–V14 on real runs; funnel attribution; **first measured cost run** (replaces §13 estimates) |
| **G3 Full readiness** | All hooks (faults, resume, corpus_root, as-of, profile); all matrix configs selectable; runs reproducible from `input.json` + `config.json` | + CT7, CT8 | Robustness I6, metamorphic M1–M6, model matrix, suite and final tiers |

**"Full readiness" means G3.** The single most important gate is G1: it
starts the improvement loop. Target G1 as early as possible, even with one
model and a naive prompt.
