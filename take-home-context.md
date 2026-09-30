# GC AI Take-Home: Problem Context and Decisions

This document carries context into later sessions. It records the assignment,
what GC AI said they want, the legal problem being solved, the scope Jason has
decided, the proposed inputs and outputs, and the data sources. It deliberately
contains **no system-design recommendations**; the next session is for that.

Tags:
- **[DECIDED]**: Jason's decision.
- **[OPEN]**: not yet decided.
- **[VERIFY]**: a fact from web research that must be confirmed before it's
  relied on in the design doc or presentation.

---

## 1. The assignment

**Company.** GC AI (gc.ai) builds AI for in-house corporate legal teams.
- **Role:** Applied AI Engineer.
- **Format:** a paid work trial, about 10 hours in total.

**Stages.**
1. A design doc of one page or less, **written without AI**. ✅ done. It was
   originally about monitoring vendor terms of service.
2. A 45-minute whiteboard call with Jonathon (title not recorded). ✅ done.
3. An async build over about 3 business days: an eval set plus an agent harness.
4. A one-hour review and presentation.

**Build instructions.**
- Use the GC AI trial account (14 days, no message limits).
- Build a small, high-quality eval set.
- Start from an open-source agent harness framework; the brief names Vercel's
  "Eve" and "Pi" as examples.
- Implement some of: tools, code execution, filesystem access, skills,
  subagents.
- Evaluate and iterate until the output could ship to a practising in-house
  attorney.
- **Evaluate more than one model and choose one.**
- Prefer a few well-understood features that work over an over-ambitious
  project.
- UI is welcome but optional.

**Non-goals.** No authentication, no full database (in-memory is fine), no
production deployment.

**Deliverables.**
- A GitHub repo.
- Exported AI coding session logs.
- The original design doc.
- A write-up of about one page, **written without AI**, covering:
  - design decisions
  - what changed from the design doc and why
  - what evaluation taught and what improved
  - how "good" was defined
  - what didn't work

**Judging criteria.**
1. Design decisions and execution, including how well the approach generalises
   to other in-house workflows.
2. Evaluation insights and iterative improvement.
3. Reliability: failures, bad tool outputs, long-running work, where a human
   stays in the loop.
4. Output quality and UX.
5. Presentation.

**Hard rule for AI assistance.** Do not draft prose for the design doc or the
final write-up. Help with research, critique, thinking and code only.

## 2. What GC AI said matters (whiteboard call)

- **Highest-signal areas:**
  - **Judgment.** Reason through trade-offs and understand what the AI built.
  - **Long-running background jobs.** GC AI's product today is chat that "the
    user has to prod along." They're exploring proactive and user-initiated
    background work, starting with user-initiated.
  - **Evals.** Keep up with model updates, hill-climb system prompts, cover many
    dimensions (not one pass/fail), and be able to defend what is and isn't in
    the eval set.
  - **Table stakes:** own a working product end to end, and cut scope if
    necessary.
- **The shape Jonathon was interested in:**
  - A large set of monitored inputs that change over time, with case law as the
    example given.
  - Users define what gets monitored.
  - The system keeps the documents plus a change log.
  - The valuable capability is querying across documents for **rippling
    effects**: "does a change to case law here change our exposure under this
    contract or agreement?"
- **Inputs he suggested:**
  - monitored document URLs, supplied by the user rather than crawled
  - a company profile (industry, size, demographics)
  - a custom prompt ("this is what I care about")
- **Other notes from the call:**
  - Relevance should vary by company profile. A tech company worries about SOC 2;
    a plumbing company worries about the physical world.
  - "HTML is the happy case."
  - Lean agentic, not crawler or scraper infrastructure.
  - Monitoring vendor terms alone is too narrow, because GC AI's customers
    include every kind of company (plumbing, retail, and so on), not just tech.

## 3. Landscape: what exists and what doesn't

**GC AI today** (from its docs and changelog, 2026):
- **Automations** are "recurring GC AI chats."
  - They're triggered by schedule only.
  - They take instructions plus files, skills, playbooks and the company profile.
  - Each run is a fresh chat: no diff against the previous run, no stored
    snapshots, no memory of what was already reported.
  - No owners or tasks, no sharing, and "a run cannot ask a clarifying
    question."
  - Since September 2026 they can leave tracked-change redlines.
- **GC AI already does URL + company profile + custom prompt.** It publishes a
  "quarterly vendor TOS re-check" recipe built on Automations.
- **GC AI's agents are in-chat by design** (Chat 2.0 post, February 2026).
  - Research subagents finish within a single chat turn, in minutes.
  - Asynchronous API jobs hold a connection for about 90 seconds.
- **Contract Intelligence / Vaults** (generally available August 2026) is where
  GC AI ships almost every week:
  - extracted and manual columns
  - "Current Terms" amendment timelines
  - child documents inheriting terms from their governing agreement (September
    2026)
  - Vaults detect online terms incorporated by URL but explicitly **do not fetch
    them**
- **Agent Connectors** cover email, Slack, Jira, Todoist and similar tools,
  and require approval before writing. Slack triage exists only as a Zapier plus
  API recipe.
- **GC AI's own benchmark**, the "In-House Legal Bench" (May 2026), is 100
  tasks, each graded on about 12 attorney-written criteria by an LLM judge that
  is checked against human scoring. One category is "regulatory tracking."
- **GC AI names the gap itself** (compliance-monitoring blog post, July 2026):
  - "A four-person legal team… cannot also map each change to the company's
    contracts, policies, product features, and vendor agreements."
  - It calls that step the one with "the biggest lift."
  - Their suggested workflow for it is manual.

**Competitors:**
- **Harvey:**
  - **Harvey II** (August 2026) works through data-room contracts "overnight,"
    and its tasks can be assigned to lawyers or agents inside persistent
    "Spaces."
  - **Horizon Scanning** (September 2026) watches 12,000+ sources, assesses
    relevance, and flags **internal policies** affected by regulatory changes.
  - **Contract Review Agents** compare incoming redlines with executed contracts.
- **Legora:**
  - Its **Agent** runs subagents for about 40 minutes and "monitors your email,
    documents, and projects and acts the moment something needs attention."
  - **Monitors** assigns owners and tasks for regulatory changes, but assesses
    impact against the *business*, not against specific documents.
- **Regulatory-change tools** (Norm Ai, Compliance.ai/Archer, Ascent, Regology)
  serve financial services, map rules to policies and controls, and don't read
  contracts.
- **Contract lifecycle tools** (Ironclad, LinkSquares, Evisort) track
  obligations inside the contract portfolio but aren't driven by external
  change.

**The unoccupied space.** No one has productised an external change mapped to a
clause-level analysis of the company's **own contract portfolio**, with a
materiality judgement per document and a record that persists across runs.
Harvey comes closest, but at the level of policies. No public benchmark exists
for regulatory change rippling through a contract portfolio.

## 4. The user

**Who:** in-house counsel, typically a solo GC or a team of 2–5 lawyers at a
mid-market company in any industry.
- About 40% of legal departments have 1–5 people.
- Manufacturing is the largest industry.
- 59% of the companies are private.
- The median is about 3 lawyers per $1B of revenue.
- 70% of chief legal officers also own risk, compliance or privacy.

**Pressures:**
- Regulatory compliance is the top driver of growing workload.
- Legal spend is falling as a share of revenue.
- Outside counsel costs $700–$1,200 an hour, and only about 20% of outside
  matters stay on budget.
- AI is widely used, but mostly one document at a time: summaries and clause
  lookups.

**What they won't trust or delegate:**
- final legal judgement and risk acceptance
- unverified citations (hallucination sanctions keep piling up)
- anything sent externally without approval

**What "good" looks like to them:**
- pinpoint citations
- conservative "needs review" flags instead of guesses
- an explicit statement of what was and wasn't reviewed
- prioritisation by materiality and deadline, not a flat list
- an audit trail
- **in a sweep, a missed document is worse than a false alarm**

## 5. Legal background (first principles)

A business contract is usually a **stack** of documents:

- **MSA (Master Services / Supply / Purchase Agreement).** The umbrella
  contract, signed once. It sets the permanent terms:
  - price mechanics
  - **limitation of liability**: the most either side can owe
  - **indemnities**: who pays if a third party sues
  - confidentiality, termination and governing law
  - **notice procedures**
- **SOW (Statement of Work), order form or purchase order (PO).** A specific
  deal under the MSA, setting scope, price, quantities and dates. There can be
  many of them. Each inherits the MSA's terms unless it overrides them.
- **Amendment.** A later signed change to the MSA or to a child document.
- **Order-of-precedence clause.** Decides which document wins a conflict.
- **Incorporated by reference.** A web page (such as a supplier's online terms of
  sale) becomes part of the contract, sometimes "as updated from time to time."
- **Change-in-law / price-adjustment clause.** Says what happens to price or
  obligations when the law changes, e.g. pass-through of new duties on 30 days'
  notice.
- **Defined terms.** "Taxes" or "Duties" may or may not include tariffs; the
  definition controls the answer.
- **Incoterms / shipping terms.** Often a single line in a PO, and they decide
  who pays import duties. Under **DDP** the seller pays; under **FOB** or **EXW**
  the buyer does.
- **Force majeure.** Excuses performance for extraordinary events. Courts rarely
  treat tariffs as force majeure, so it's a common false lead.
- **Most-favoured-nation (MFN) clause.** Promises a counterparty pricing at least
  as good as anyone else gets.
- **Fixed-price customer contracts.** Lock the company's own selling price, so
  it can't pass new costs downstream.

A company has **hundreds of these stacks**, and they reference each other.
When something external changes, its effect on any one contract depends on
several clauses spread across several documents in the stack.

## 6. What a GC does today when something changes

The eight steps a GC works through:

| # | Step | What it involves |
|---|---|---|
| 1 | **Understand the change** | What changed, whether it's in force (proposed, final, effective, stayed, vacated), the effective date, who it applies to |
| 2 | **Applicability** | Whether it applies to *this* company: states, industry, size thresholds, what the company buys, sells and imports |
| 3 | **Scoping** | Which of the company's documents could be touched: the candidate population |
| 4 | **Per-document analysis** | Reading each stack's relevant clauses and following the hops: MSA → PO/SOW override → defined terms → shipping terms → change-in-law → notice deadlines |
| 5 | **Materiality & prioritisation** | Dollars at stake, deadlines running, which items matter most |
| 6 | **Decide the response** | Do nothing, renegotiate, send notice, update templates, escalate to outside counsel, brief the CFO. This is risk judgement. |
| 7 | **Execute** | Draft notices and redlines, get approvals, send, negotiate |
| 8 | **Track to close** | Watch deadlines and responses, and keep a dated record of reasonable steps |

**How it's done today without the tool:**
- **Steps 1–2** come from law-firm client alerts and newsletters, which GCs admit
  they mostly don't read unless the alert says why it matters to *their*
  company.
- **Steps 3–5 are the bottleneck.** A small team realistically handles them in
  one of three ways:
  - skip the sweep and react when a counterparty raises it
  - spot-check the largest contracts from memory
  - pay outside counsel to review the portfolio
- **The costs:**
  - Missed notice windows forfeit rights.
  - Cost increases get absorbed that the contract would have allowed the
    company to pass through.
  - Surcharges or refunds are handled inconsistently, which creates class-action
    exposure.
  - Industry studies put average contract value erosion at about 8.6–9.2%
    (WorldCC/IACCM).
- **Steps 6–8** are judgement and follow-through, usually tracked in a
  spreadsheet or email.

## 7. Scope [DECIDED]

- **Core: steps 1–5, fully automated end to end.**
  - Understand the change, determine applicability, scope the portfolio,
    analyse each document, and assess materiality and priority.
  - The output notifies the GC of the highest-value areas to investigate.
  - The goal is to replace the GC's work on steps 1–5 entirely, while letting the
    GC drill into any dimension.
- **Extension: step 6.** Apply a level of GC judgement to the materiality
  findings. Likely within the project's scope, but not the starting point.
- **Future direction: steps 7 and 8.** Independent extensions, likely outside
  this project's scope. Recorded only to show where the build could eventually
  go.
- **Eval goal:** show performance at the level of an attorney peer, from
  understanding the change through materiality.
  - A "peer" answer key has to exist for that claim to be defensible.
  - Planted ground truth is correct by construction.
  - Real-event reference answers are written by a non-attorney and must be
    labelled that way.
  - Scope any claim to "matches the answer key on these dimensions."

## 8. The use case and its triggers

**Generalisation requirement [DECIDED].**
- The feature must work for **any legal change**: case law, statute or
  regulation.
- Tariffs are the **evaluation trigger**, not the product's domain.
- Nothing about the problem may assume that relationships between documents are
  supplier or supply-chain relationships. That pattern is specific to tariffs,
  which are an unusually *economic* kind of change. See §8a.

**Evaluation trigger domain: tariff changes rippling through supply and customer
contracts.** [DECIDED as the proposed direction; confirm the specific events]

**Demo company:** a home-services / plumbing company.
- About 400 employees, operating in CA, WA, IL and TX.
- Copper pipe and fittings are its main input.
- It buys through distributors and suppliers, and sells service and installation
  work, some of it under fixed-price contracts.
- This matches the "physical-world company" example from the call.

**Two triggers against the same corpus, pushing the ripple in opposite
directions:**

| | Trigger A: a tariff is imposed | Trigger B: a court removes tariffs (case law) |
|---|---|---|
| Event | Section 232 50% tariff on copper products, including pipe and tube (effective August 2025) [VERIFY scope and dates] | U.S. Supreme Court ruling against the IEEPA tariffs (reported February 2026) [VERIFY] |
| Source type | Presidential proclamation / Federal Register notice (HTML) | Court opinion (HTML/PDF) |
| GC question | Who absorbs the cost? Which suppliers can pass it through, on what notice? Are we stuck with fixed prices on the customer side? What deadlines are running? | Who is owed refunds? Which surcharges did we pass through that now must be unwound? Which price-adjustment clauses work in reverse? |

**Why this trigger was chosen:**
- **Realistic and public.** Both sources are real, recent HTML pages.
- **Stated precisely.** Each change can be stated exactly, which keeps step-1
  ground truth crisp.
- **Needs multi-hop reasoning.** Answering "does this hit us under this
  contract?" means combining clauses from several documents:

  | Hop | Question | Where it lives |
  |---|---|---|
  | Change-in-law / price adjustment | Can the supplier pass the tariff through, on what notice? | MSA |
  | Override | Does a PO or SOW fix the price for the term? | Child document plus the precedence clause |
  | Defined terms | Does "Taxes" or "Duties" include tariffs? | Definitions section |
  | Incoterms | Who is importer of record and who pays duty (DDP vs FOB/EXW)? | Often one line in a PO |
  | Force majeure | Does it excuse performance? (Usually not; a trap that shouldn't be flagged) | MSA |
  | Customer side | Can costs pass downstream, or are prices fixed? | Customer contracts |
  | MFN | Does one price change trigger others? | MSA or pricing exhibit |
  | Deadlines | Notice windows to object, renegotiate or terminate | Notice clause |

- **Covers every way a change can reach a contract.** A clause can be affected:
  - directly
  - through a defined term
  - through a cross-reference
  - through order of precedence
  - because a protective clause is *missing*

  Look-alike clauses that shouldn't be flagged can be included too.
- **Naturally quantitative.** Materiality comes down to contract value, share of
  goods that are imported, who bears the duty, and deadlines.
- **Cross-industry.** Any company that buys or sells physical goods is exposed.
- **Covers Jonathon's case-law example directly** (Trigger B). Two triggers on
  one corpus also show that the approach generalises.
- **Alternatives considered:**
  - Noncompete law changes: cross-industry, but the affected documents are
    employment agreements, so the corpus would be mostly synthetic.
  - Anti-indemnity statutes: very crisp rules and a strong fit for construction
    and plumbing, but narrower across industries.
- **Trigger principle.** The trigger is not the focus of the build, but it must
  be realistic. Triggers should be **replayable**: stored as fixed snapshots
  behind their URLs, so every run and every model sees identical input. Live
  fetching is optional.

## 8a. How a change reaches documents: relationship levels and link types

**No document is actually amended within scope.** Amending is step 7. So a
"ripple" here means a *dependency between findings*: a conclusion about one
document becomes a fact needed to analyse another.

**Levels:**

| Level | Unit | Relationship | Status |
|---|---|---|---|
| **L0** | A single file | None | **Not viable.** A PO or SOW can't be read legally without its MSA. |
| **L1** | A contract **stack** (MSA + children + amendments + incorporated terms) | A fixed, known tree per relationship: parent/child, precedence, incorporation, defined terms | **Required core.** This is domain-agnostic and generalises to any change. |
| **L2** | Effects across stacks | A finding in one stack is an input to another stack that may not mention the change at all | The literal "rippling effects" from the call. **[OPEN] scope level:** L1 only, L1 plus one hop through named link types, or full L2 |

**L2 link types, general across legal domains.** The relevant links depend on
the change: different changes activate different links. There's no fixed
supplier graph.

| Link type | Mechanism | Tariff example | Non-economic (case law / regulation) example |
|---|---|---|---|
| **Economic flow** | Cost or benefit passes between parties | Supplier passes the tariff through, and we're stuck on fixed-price customer contracts. The refund chain runs in reverse. | Staffing firm: a minimum-wage increase feeds into client bill-rate clauses |
| **Risk-allocation chain** | Liability passes through indemnities, additional-insured and hold-harmless clauses | Supplier indemnity for customs penalties | A court ruling that exposes brokers to negligent-selection claims: the shipper indemnity, the carrier back-indemnity, and insurance |
| **Mirror / flow-down** | One contract is written to match another | A subcontract mirroring the prime contract's price terms | Government or prime-contract clauses that must flow down to subcontracts |
| **Parity terms** | "No less favourable than" | A concession to Customer X triggers Customer Y's MFN | Any MFN or most-favoured-customer term |
| **Template / clause lineage** | Documents share an origin, not a counterparty | — | A ruling that voids a class-action waiver affects every contract signed on that template |
| **Compensating protection** | Losing one clause shifts weight onto another document | — | A noncompete ban makes NDAs, non-solicits and IP-assignment agreements the main protection. Are they adequate? |
| **Consistency** | Documents that must stay mutually consistent | — | Privacy policy ↔ DPAs ↔ customer contract representations. Handbook ↔ offer letters ↔ arbitration agreements |
| **Party / entity** | The same counterparty or its affiliates appear across stacks | — | A sanctions designation or bankruptcy |
| **Timing chains** | A notice or event under one contract starts a clock under another | Supplier's price-increase notice starts our customer notice window | A breach notice received from a vendor starts our customer notification deadlines |

**Characteristics of the problem:**
- **Most case-law changes are clause-type changes** (enforceability or
  interpretation of a kind of clause). Their first-order effect is decided per
  stack by three things: whether the clause is present, the governing law or
  jurisdiction, and the facts. That's L1 fan-out. [INFERRED]
- **Tariffs lean more heavily on L2 economic-flow links than a typical case-law
  change does.** So a tariff-only evaluation over-represents the supply-chain
  pattern. [INFERRED]
- **Non-economic L2 effects are mostly other link types:** compensating
  protection, consistency, template lineage and risk-allocation chains.
- **Jurisdiction and governing law** are *attributes* of a stack, not links.
  They drive scoping and applicability, not propagation.

**Evaluating generalisation [DECIDED 2026-09-25]:** a second evaluation slice
uses a noncompete trigger on the same corpus, alongside tariffs.

**Original reasoning:**
- Tariffs are the primary evaluation trigger.
- The brief's judging criteria include generalisation.
- One option is a small second slice that uses a **clause-enforceability**
  case-law or statute trigger on the *same* corpus. An example: a noncompete ban
  covering hourly workers, with the sale-of-business exception as a decoy.
- In a single-company corpus, the employment documents that are distractors for
  the tariff trigger become the relevant documents for that trigger.

## 9. Inputs

1. **Trigger.** One or more URLs to the change source, with snapshotted content:
   either an old/new pair or a single new document.
2. **Company profile.** Industry, states of operation, headcount and revenue
   band, what the company buys and sells, and how much it imports.
3. **Custom prompt.** What the GC cares about, including materiality thresholds
   (for example, "flag exposure over $50k or notice windows under 30 days").
   This makes materiality evaluable: material *relative to the GC's stated
   policy*.
4. **Corpus.** The company's document stacks (MSAs with their POs, SOWs and
   amendments), customer contracts, subcontracts, templates, policies, and any
   web pages incorporated by reference.

## 10. Outputs

**User-facing:**

| Output | Step | What the GC can drill into |
|---|---|---|
| **Change record**: what changed, effective date, legal status, who it applies to | 1 | Quote and location in the source |
| **Applicability determination**, with concise reasoning | 2 | Which profile facts drove it |
| **Scope trace**: a compact list of the documents examined, each with a one-line note from the searching agent. Exact shape to be settled in system design. | 3 | The document list |
| **Per-stack findings**: affected / not affected / needs review | 4 | Verbatim clause quotes with exact locations, the chain of hops (e.g. "PO is silent → MSA §7.2 governs → 'Duties' includes tariffs"), concise reasoning |
| **Prioritised impact list**: materiality determination and rationale, deadline | 5 | The facts behind the determination (value, exposure, who bears it) |
| **Coverage statement**: what was reviewed, what couldn't be parsed, what was out of scope | 3–5 | File list |

**Transparency requirements:**
- Every determination has concise reasoning and exact citations. This includes
  determinations that something is **not** material, which are logged so the GC
  can audit what was dismissed and evals can measure misses.
- Citations are verbatim and located precisely enough to check.

**Constraint on scores [DECIDED].**
- LLMs will not assign numeric scores or confidence values.
- Materiality from the LLM is a determination with a rationale.
- Numeric materiality scores or confidence exist only if a classifier model is
  used. [OPEN: whether to use one]
- Arithmetic on contract facts (e.g. value × exposure) isn't an LLM-assigned
  score.

**Internal, not user-facing [DECIDED].**
- A complete, persisted **end-to-end trace** of every run: all decisions, tool
  calls, intermediate outputs and reasoning.
- It's used to debug, to analyse eval performance, and to support other future
  use cases.
- It is never shown to end users.

## 11. What the build must demonstrate

**The legal problem it solves:**
- It turns an unread external alert into a prioritised, cited account of exactly
  which of *this company's* contracts are affected, how, by how much and by
  when.
- It does the portfolio sweep (steps 3–5) that small teams skip or pay outside
  counsel for.
- It surfaces pass-through rights and notice windows before they lapse, and
  refunds or surcharges before they become liability.
- It leaves the GC with a defensible record of what was checked.

**The technical problems that make this genuinely long-running agent work, not
a chat answer:**
- **Scale.** Hundreds of document stacks exceed any single context window, and
  each needs careful reading, not keyword matching.
- **Unknown path.** The hops a given stack needs aren't known in advance: follow
  a defined term, check precedence, find the PO's shipping terms. The agent has
  to decide what to look up next.
- **Cross-document hierarchy.** MSA → child documents → amendments →
  incorporated web pages, with the precedence rules between them.
- **Absence detection.** Sometimes the finding is that a protective clause is
  *missing*.
- **Verifiability.** Every claim must rest on verbatim, checkable citations. A
  fabricated citation is disqualifying.
- **Legal status.** Laws are often stayed, vacated or replaced (2024–26 had many
  examples), so "is this in force?" is part of the answer.
- **Exhaustiveness vs precision.** Misses are worse than false alarms, but a
  flood of false alarms is useless. Coverage has to be explicit.
- **Consistency.** Determinations across hundreds of documents must follow one
  standard, and repeated runs should agree.
- **Duration and robustness.** The runtime is tens of minutes or more, so work
  has to survive failures, bad tool outputs and unparseable files without
  losing progress. The result arrives in the background, without the user
  prodding it along.
- **Cost vs quality.** Evaluating more than one model means demonstrating the
  trade-off with data.
- **Generality.** The same approach should apply to other triggers (a court
  ruling, a regulation, a vendor-terms change, an incident) and to other
  in-house workflows. That's one of the brief's judging criteria.

## 12. Evaluation requirements (what, not how)

**Scenario format.** Each scenario is a trigger (old/new source), a company
profile, a custom prompt and a corpus snapshot, plus an answer key covering
steps 1–5.

**Composition:**
- **Mostly planted variations**, where the ground truth is known by
  construction. These vary each hop: direct hit, defined term, precedence,
  Incoterms, missing clause, look-alike decoys.
- **A separately reported slice of real-event cases.**
- **Adversarial cases:** cosmetic-only source changes, false premises,
  unparseable files, duplicate triggers.
- **A substantial share of "should not flag" cases.**

**Dimensions (multi-dimensional, not one pass/fail):**
- change-record accuracy, including legal status
- applicability correctness
- scope recall
- per-document affected/not-affected precision, recall and false-alarm rate
- hop-chain correctness
- citation faithfulness (a hard gate)
- materiality determination against the GC's stated thresholds
- prioritisation order
- coverage-statement accuracy
- consistency across repeated runs
- cost and latency per model

**Defensibility.** Be able to explain why each scenario is or isn't in the set.
Keep a held-out split so prompt iteration doesn't overfit.

**House style.** GC AI grades with criteria written per task (their own bench
uses about 12 per task), so aligning with that format is sensible.

**Optional baseline.** Run the same scenarios through the GC AI trial account
and score it on the same rubric.

## 13. Corpus sources (for a realistic vault, fast)

Documents generated entirely by AI underrepresent real scale and complexity.
Real sources:

- **CUAD, the Contract Understanding Atticus Dataset (The Atticus Project,
  2021, CC BY 4.0).**
  - **Real** commercial contracts, not synthetic, drawn from public SEC EDGAR
    filings [VERIFY source statement in the CUAD paper].
  - **510 contracts**, each as a PDF and a TXT file.
  - **41 clause categories**, including liability cap, most-favoured-nation,
    price restrictions, termination, renewal/notice periods, governing law,
    anti-assignment, change of control, audit rights, insurance and exclusivity.
  - **13,000+ expert annotations** by The Atticus Project's attorney advisers
    and law students.
  - Covers about 25 contract types, including supply, distribution,
    manufacturing, service, license, franchise, outsourcing and strategic
    alliance.
  - Available on Hugging Face (`theatticusproject/cuad`).
  - **Limits:**
    - The contracts are standalone. They don't come as MSA/PO/amendment families.
    - Because they were filed publicly, pricing is often redacted ("[***]").
- **Related datasets from The Atticus Project:** MAUD (merger agreements) and
  ACORD (clause retrieval). These are less directly relevant.
- **SEC EDGAR full-text search** (sec.gov/edgar/search). Free, covers 2001 to
  the present, and filters by form type.
  - Public companies file material contracts as **Exhibit 10**, and they file
    **amendments to the same agreement over years**. For one real company, you
    can reconstruct genuine contract families: agreement → Amendment No. 1, 2, 3.
  - This is the closest free thing to a real vault with relationships between
    documents.
  - Relevant filers include copper tube and plumbing-products manufacturers and
    distributors (e.g. Mueller Industries, Ferguson, Watsco) [VERIFY which have
    useful exhibits].
  - The same limits apply: only material contracts are filed, and pricing is
    redacted.
- **Public-sector contracts.** Cities, counties and states publish procurement
  contracts as public records.
  - These include real "on-call plumbing / HVAC services" master agreements
    with task orders, amendments and change orders: literally the MSA → child
    structure.
  - They often come as scanned PDFs, which is realistic messiness.
- **Supplier online terms of sale.** Industrial and plumbing distributors
  publish their standard terms as HTML. These are real incorporated-by-reference
  documents that fit the "HTML happy case."
- **Trigger sources.** Federal Register (API), Supreme Court and CourtListener
  opinions (API), agency pages.
- **Where synthetic material is realistic:** short child documents such as POs,
  order forms and SOWs that reference real MSAs, and planted clause variations
  for evals. Real documents supply the complexity; synthetic ones supply the
  relationships and controlled ground truth. [OPEN: final mix]

## 14. Open items

- [OPEN] Relationship scope level (§8a): L1 only, L1 plus one-hop L2 through
  named link types, or full L2. L2 cases should be present in the corpus
  either way, so misses are measurable.
- [OPEN] Harness framework. The brief suggests starting from an open-source
  harness; Vercel's "eve" and Mario Zechner's "pi" are the likely referents.
- [OPEN] The corpus mix and size.
- [OPEN] Whether to use a classifier for materiality scores or confidence.
- [OPEN] Which models to compare.
- [OPEN] Whether to use the GC AI trial account as an eval baseline.
- [OPEN] Extension ordering after the core: step 6 judgement, then a proactive
  monitored-URL trigger, then steps 7–8.
- [VERIFY] Dates and scope of the Section 232 copper tariff. The date and
  holding of the Supreme Court IEEPA ruling, and the state of refund litigation.
  The CUAD source statement. The GC AI feature claims and dates listed in §3.
- [UNKNOWN] A "tasks" source appeared in GC AI's chat-history filter
  (September 2026). What that feature is hasn't been determined; check the trial
  account.
