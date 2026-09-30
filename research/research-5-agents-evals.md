# Research 5: What warrants long-running agentic work, and how to eval it

Prepared for the GC AI take-home (agent harness + eval set for a multi-step in-house legal workflow).
Research date: 2026-09-23. Synthesis and recommendations are marked **[INFERRED]**; everything else is sourced.

---

## 0. TL;DR

- Every major source says the same thing in different words: **start with the simplest thing (a single call with retrieval), move to a fixed workflow when the steps are known, and use an agent only when you can't predict the steps.** Agents cost more and take longer, so they have to earn that ([Anthropic, Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)).
- Multi-agent fan-out works when the subtasks are **independent** (breadth-first research, many documents). It breaks down when the agents need **shared context or have to make coordinated decisions** ([Anthropic multi-agent research](https://www.anthropic.com/engineering/multi-agent-research-system); [Cognition](https://cognition.com/blog/dont-build-multi-agents)).
- Long-running harnesses rely on **external state** (a progress file, a structured task list in JSON, git, the filesystem as memory), **one unit of work per session**, **a separate evaluator** (models grade their own work too kindly), and **durable execution** so runs survive crashes and can wait for days ([Anthropic long-running harnesses](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents); [harness design](https://www.anthropic.com/engineering/harness-design-long-running-apps); [Manus](https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus)).
- "Vercel's agent framework" is almost certainly **eve** (open-sourced June 2026; durable sessions on Vercel Workflow, cron schedules, approvals, subagents, sandbox, and **built-in `.eval.ts` evals with gate and soft assertions plus LLM judge**). "Pi" is **Mario Zechner's pi / pi-mono** (now Earendil Works): a minimal four-tool harness with an embeddable SDK and multiple providers.
- Legal evals score **several dimensions separately**: rubric points with **negative points for hallucinations** (Harvey BLB), a separate **source score**, weighted accuracy / authoritativeness / appropriateness (Vals), correctness × groundedness (Stanford/Magesh), and **planted perturbations** (CLAUSE). GC AI's own "In-House Legal Bench" uses about 12 attorney-written criteria per task and includes a **"Regulatory tracking"** category.
- Eval method: binary per-criterion checks, a judge calibrated against expert labels (TPR/TNR on a held-out split), balanced positive and negative cases, pass^k for consistency, and a train/dev/test split for prompt hill-climbing.

---

## 1. When does a task truly need a long-running agent?

### 1.1 What the sources say

| Source | Key claim |
|---|---|
| [Anthropic, Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) | "For many applications... optimizing single LLM calls with retrieval and in-context examples is usually enough." Workflows = "LLMs and tools orchestrated through predefined code paths." Agents = "LLMs dynamically direct their own processes and tool usage." "Agentic systems often trade latency and cost for better task performance." Orchestrator-workers fit "complex tasks where you can't predict the subtasks needed"; evaluator-optimizer fits "when we have clear evaluation criteria." |
| [Anthropic, multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system) | Agents use about 4× the tokens of chat; multi-agent about 15×. Token usage explains 80% of performance variance on BrowseComp. Multi-agent beat single-agent Opus 4 by 90.2% on breadth-first queries. Good fit: heavy parallelization, information larger than one context window, many tools. Poor fit: "domains that require all agents to share the same context or involve many dependencies between agents... most coding tasks." |
| [Cognition, Don't build multi-agents](https://cognition.com/blog/dont-build-multi-agents) | "Share context, and share full agent traces." "Actions carry implicit decisions, and conflicting decisions carry bad results." Default to a single-threaded linear agent; add a compression model for long histories. |
| [Anthropic, Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) (Nov 2025) | Core problem: "each new session begins with no memory of what came before"; compaction alone is not enough. Failure modes: trying to one-shot too much, and declaring victory too early. |
| [Anthropic, Harness design for long-running apps](https://www.anthropic.com/engineering/harness-design-long-running-apps) (Mar 2026) | Solo agent: 20 min, $9. Full planner/generator/evaluator harness: 6 h, $200, clearly better output. "Every component encodes an assumption about what the model can't do"; "strip away pieces that are no longer load-bearing" as models improve (sprint decomposition was dropped moving from 4.5 to 4.6). |
| [OpenAI deep research](https://openai.com/index/introducing-deep-research/) / [system card](https://openai.com/index/deep-research-system-card/) | Multi-step browsing plus Python, trained with RL on both auto-gradable tasks and "open-ended assignments guided by detailed rubrics"; it plans, backtracks, and reacts to what it finds. Product pattern: clarify scope up front, run in the background for 5–30 minutes, return a report. |
| [Manus context engineering](https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus) | KV-cache hit rate is "the single most important metric" (cached tokens cost 10× less). Use the filesystem as "unlimited, persistent" context. `todo.md` recitation keeps the plan in recent attention. Keep errors in context. Vary patterns to avoid a few-shot rut. |
| [METR time horizons](https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/), [TH1.1](https://metr.org/blog/2026-1-29-time-horizon-1-1/) | 50% time horizon: Opus 4.5 about 320 min (CI 170–729), GPT-5 about 214 min. Doubling time is about 7 months long-run, about 131 days after 2023. Caveats: very wide CIs, 80% horizons are much shorter than 50%, and results are sensitive to task composition. |

### 1.2 Rubric: does this task warrant a long-running agent? [INFERRED, synthesized from above]

Score each criterion 0/1/2. Roughly 0–4 means a single call or chat, 5–9 means a deterministic pipeline with LLM steps, and 10+ means a long-running agent (orchestrator, with workers only where subtasks are independent).

| # | Criterion | Why it matters | Source anchor |
|---|---|---|---|
| 1 | **Unknown number or shape of steps.** The path depends on what earlier steps find. | Fixed steps mean a workflow is cheaper and more reliable. | Building effective agents |
| 2 | **Fan-out breadth.** Many independent units (documents, jurisdictions, counterparties) that can be processed separately and then merged. | The main justification for subagents: each gets a clean context and compresses its own findings. | Multi-agent research |
| 3 | **Total material is larger than one context window.** | Forces external memory or subagents. | Multi-agent research; Manus |
| 4 | **Search and iterate.** The agent must decide what to look up next (e.g., follow cross-references and defined terms). | Open-ended retrieval is where agents beat pipelines. | Deep research |
| 5 | **A checkable verification loop exists.** A clear criterion lets an evaluator loop improve results. | Evaluator-optimizer only pays off with clear criteria, and self-evaluation is biased. | Harness design; Building effective agents |
| 6 | **Waiting on external events or time.** The task reacts to source updates, a counterparty reply, or approval. | Needs durable execution with sleep/hooks, not a chat session. | Vercel Workflow; LangGraph interrupt |
| 7 | **State must persist across sessions.** A monitor that remembers baselines and past decisions. | Needs a progress file / DB and the initializer + worker pattern. | Long-running harnesses |
| 8 | **Latency is tolerable, and the value per run justifies about 15× the tokens.** | Agent cost is justified by the value of the task. | Multi-agent research (15×); harness design ($9 vs $200) |
| 9 | **The user shouldn't have to prod it along.** The job has a trigger and a deliverable, not a conversation. | This is exactly GC AI's stated gap (chat that users must drive). | GC AI brief |
| 10 | **Low coupling between parallel decisions.** Subtasks don't make conflicting implicit choices. | If coupling is high, use a single-thread agent (Cognition). | Cognition |
| 11 | **Human checkpoint is natural and valuable.** A material decision or outbound action needs sign-off. | Approvals and interrupts are first-class in eve and LangGraph. | eve; LangGraph |

**Counter-indicators** (prefer a pipeline or chat): the output is a single short answer; all input fits in context; the steps are known and fixed; mistakes are cheap to catch in the UI; the user wants an interactive back-and-forth.

**Applied to the candidate use case** (monitored sources + company documents → material change → ripple analysis → actions) [INFERRED]:
- **Trigger/monitor and diff:** mostly a *deterministic pipeline* (fetch, normalize, diff, hash). Cheap LLM triage for "is this change material?" Scores low on #1 and high on #6/#7, so use durable scheduling, not an agent.
- **Ripple analysis across the contract/policy corpus:** the *agentic core*. Unknown scope (defined terms, cross-references, affiliates), fan-out over many documents (#2, #3), search/iterate (#4). Use an orchestrator with per-document workers; the workers are independent reads, so Cognition's concern mostly doesn't apply as long as the final synthesis happens in one thread.
- **Recommend/draft actions:** a single-thread synthesis step with an evaluator pass (#5), then a human approval interrupt (#11).
- This split is itself a good trade-off story: "agent only where it earns its cost."

---

## 2. Harness patterns for long-running work

### 2.1 Patterns

| Pattern | What it is | Source |
|---|---|---|
| Orchestrator–worker subagents | Lead plans and spawns parallel workers, each with a clean context, that return condensed findings. The lead saves its plan to memory before the context fills up. | [Multi-agent research](https://www.anthropic.com/engineering/multi-agent-research-system) |
| Initializer + incremental worker | First session creates `init.sh`, `claude-progress.txt`, `feature_list.json` (all `passes:false`), and a git commit. Later sessions read the progress file and git log, pick one item, test it, commit, and update progress. JSON is used because the model is "less likely to inappropriately change or overwrite JSON" than Markdown. | [Long-running harnesses](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) |
| Planner / generator / evaluator | GAN-style. The evaluator actually exercises the output (Playwright), because "agents tend to respond by confidently praising the work." Before each chunk, generator and evaluator agree on "sprint contracts" (testable criteria). | [Harness design](https://www.anthropic.com/engineering/harness-design-long-running-apps) |
| Context resets vs compaction | Resets (clean window + structured handoff) beat in-place compaction when models show "context anxiety" and wrap up too early. | Harness design |
| Filesystem as memory, recitation | Store bulky observations as files and keep only paths/URLs in context (restorable compression). Rewrite `todo.md` to keep the plan in recent attention. | [Manus](https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus) |
| Keep errors in context | Failed tool calls stay visible so the model adapts. | Manus |
| KV-cache discipline | Stable prefix, append-only context, deterministic serialization. Mask tools instead of removing them. | Manus |
| Checkpoints / resume | Resume from the last checkpoint instead of restarting. Rainbow deploys avoid breaking in-flight runs. | Multi-agent research |
| Durable execution | Steps are recorded and replayed. Automatic retries. Sleep for minutes to months. Wait on hooks/webhooks. Survives deploys. | [Vercel Workflows](https://vercel.com/docs/workflows), [Workflow SDK](https://workflow-sdk.dev/), [Temporal + OpenAI Agents SDK](https://docs.temporal.io/develop/python/integrations/openai-agents) (GA Mar 2026; model calls run as Activities so they retry and aren't repeated on replay), [Temporal + AI SDK](https://temporal.io/blog/building-durable-agents-with-temporal-and-ai-sdk-by-vercel) |
| Checkpoint ≠ durable | LangGraph, CrewAI, and ADK checkpoint state but don't detect failures, restart automatically, or deduplicate. | [Diagrid critique](https://www.diagrid.io/blog/checkpoints-are-not-durable-execution-why-langgraph-crewai-google-adk-and-others-fall-short-for-production-agent-workflows) |
| Human-in-the-loop interrupts | LangGraph `interrupt()` plus a checkpointer and thread_id waits indefinitely. **The node re-executes on resume, so code before `interrupt()` must be idempotent.** eve: any action can require approval, and the agent "wait[s], indefinitely if it has to, without consuming any compute." | [LangGraph interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts); [eve blog](https://vercel.com/blog/introducing-eve) |
| Budgets / timeouts | Scale effort to query complexity (simple: 1 agent, 3–10 tool calls; complex: 10+ subagents). Put explicit budgets in the prompt. eve evals have `timeoutMs`. | Multi-agent research; [eve evals](https://eve.dev/docs/evals/overview) |
| Handling bad tool outputs | Keep errors visible (Manus); retry transient failures in durable steps (Temporal/Workflow); the evaluator verifies the end state. | Manus; Temporal |
| Idempotency | Side-effecting steps (send email, file ticket, write redline) need idempotency keys, because replay or resume can re-run them. [INFERRED from LangGraph re-execution note + Diagrid dedupe point] | |

### 2.2 The frameworks the brief probably means

**Vercel eve** ([blog](https://vercel.com/blog/introducing-eve), [changelog](https://vercel.com/changelog/introducing-eve-an-open-source-agent-framework), [GitHub](https://github.com/vercel/eve), [docs](https://vercel.com/docs/eve), [eve.dev](https://eve.dev/docs), [InfoQ](https://www.infoq.com/news/2026/06/vercel-eve-agents/), [The Register](https://www.theregister.com/devops/2026/06/19/vercel-debuts-eve-open-source-agent-framework-tries-to-fix-shadow-ai-with-passport/5258726)). Apache-2.0, announced at Ship London in June 2026. Vercel says it runs more than 100 internal agents, handling about a third of its deploys.
- An agent is a directory: `agent/agent.ts` (`defineAgent({model})`), `instructions.md`, `tools/*.ts` (`defineTool` + Zod; the filename is the tool name), `skills/` (Markdown loaded on demand), `subagents/` (own instructions, tools, sandbox, clean context), `channels/` (Slack, Teams, HTTP, GitHub, ...), `schedules/` (`defineSchedule` or Markdown with `cron` frontmatter, deployed as Vercel Cron), `memory.ts` (cross-session memory slots), `sandbox/`, `connections/` (MCP/OpenAPI), `hooks/` ([agent files](https://eve.dev/docs/reference/agent-files)).
- Durable sessions on the Workflow SDK. "Each step checkpointed." Sessions resume after crashes, deploys, and long pauses. Session API: `POST /eve/v1/session`, which returns `continuationToken` and streams NDJSON.
- Approvals: one field on a tool. Pauses without using compute. There is an auto-approval guide using Jev ([kb](https://vercel.com/kb/guide/auto-approve-tool-calls-eve-jev)).
- Models go through AI Gateway (`provider/model` strings, provider fallback), so **multi-model comparison is a one-line config change**, which helps with the "evaluate more than one model" requirement.
- **Evals built in** ([eve evals](https://eve.dev/docs/evals/overview)): `evals/**/*.eval.ts` with `defineEval({ test(t) {...} })`. `t.send()`, `t.succeeded()`, `t.calledTool()`, `t.check(value, includes/equals/matches)`, `t.judge(...)` (LLM judge; default judge model set in `evals.config.ts`; `{on: turn.session.transcript}` grades a multi-turn transcript). **Gates vs soft assertions** (`.gate()`, `.soft()`, `.atLeast(threshold)`). Default-export an array to fan out over a dataset. `eve eval --url` runs against a deployment. `--strict` fails CI on soft-threshold misses. `mockModel()` for deterministic fixtures. `setup/teardown`. Braintrust reporter.
- OpenTelemetry traces (model and tool calls in order).

**Pi** ([Wikipedia](https://en.wikipedia.org/wiki/Pi_(AI_agent)), [npm](https://www.npmjs.com/package/@mariozechner/pi-coding-agent), [implicator](https://www.implicator.ai/pi-is-not-a-claude-code-rival-it-is-a-harness-rebellion/)). By Mario Zechner (pi-mono), transferred to Earendil Works in May 2026 (`@earendil-works` packages from v0.74.0). A deliberately minimal core: short system prompt, four tools (read, write, edit, bash), a multi-provider LLM layer (OpenAI, Anthropic, Google, Bedrock, OpenRouter, Ollama, LM Studio; you can switch models mid-session), an agent runtime, a TUI, and an **SDK to embed the runtime**. Extensions, skills, and prompt templates are TypeScript. No built-in durable execution, scheduling, or evals: you'd bring those (e.g., wrap in Workflow SDK/Temporal and Inspect/Promptfoo). [INFERRED: Pi signals "minimal harness, I own the loop"; eve signals "production primitives out of the box."]

**Claude Agent SDK** ([agent loop docs](https://code.claude.com/docs/en/agent-sdk/agent-loop)). Automatic compaction, `resume` by session_id, subagents with separate context windows, hooks (PreCompact, SessionStart, SubagentStop). A caveat: resuming after compaction rehydrates the *summary*, not the full history. Not durable by itself.

**LangGraph**. Checkpointers per super-step, `interrupt()`, time travel. Durable-ish, but see the Diagrid critique.

**Durable backends**: Vercel Workflow (`'use workflow'`/`'use step'`, sleep, hooks, `DurableAgent`, GA with more than 100M runs), Temporal (OpenAI Agents SDK integration GA, AI SDK integration), and Inngest (similar step functions; not deeply verified here).

**[INFERRED] Choice framing for the take-home**: eve gives cron monitoring, durable waits, approvals, subagent fan-out, multi-model via Gateway, and a native eval runner in one place. That lines up closely with GC AI's four signals (background jobs, evals, model comparison, product ownership). The risk is that eve is beta and Vercel-centric. A defensible alternative is Claude Agent SDK or Pi for the loop, wrapped in the Workflow SDK or Temporal for durability, plus Inspect or Promptfoo for evals. Both choices are defensible if you explain the trade-off.

---

## 3. Legal AI evaluation landscape

| Benchmark | What | How it scores | Takeaway for our eval |
|---|---|---|---|
| [LegalBench](https://arxiv.org/abs/2308.11462) (Guha et al., NeurIPS 2023) | 162 tasks, 6 IRAC-derived reasoning types (issue-spotting, rule-recall, rule-application, rule-conclusion, interpretation, rhetorical) | Mostly classification or extraction; accuracy/F1 | Use the IRAC taxonomy to tag eval items by reasoning type. |
| [CUAD](https://huggingface.co/datasets/theatticusproject/cuad-qa) | 510 contracts, 41 clause categories, 13k+ labels | Span extraction, precision/recall (AUPR) | **Free real-contract corpus** with clause labels for building the "company documents" side. |
| [ContractNLI](https://arxiv.org/abs/2110.01799) | About 607 NDAs, document-level NLI (entail/contradict/neutral) plus evidence spans | Accuracy plus evidence-span F1 | Model for "does this clause conflict with the new rule?" |
| [MAUD](https://arxiv.org/abs/2301.00876) | Merger agreement deal-point questions (ABA survey) | Multiple choice | Hardest in LegalBench-RAG. |
| [LegalBench-RAG](https://github.com/zeroentropy-ai/legalbenchrag) | 6,858 queries over 714 docs (PrivacyQA, CUAD, MAUD, ContractNLI); answers are **(file, char span)** | Precision@k / Recall@k on spans; mini version has 776 queries | **Score retrieval of affected clauses separately from reasoning.** |
| [CLAUSE](https://arxiv.org/abs/2511.00340) (EACL 2026) | More than 7,500 **perturbed** CUAD/ContractNLI contracts; 10 anomaly categories (statutory contradictions + internal inconsistencies), grounded by RAG over statutes, expert-reviewed | Detection F1 + explanation quality; best F1 about 63.7% | **Direct precedent for planted-change eval construction.** |
| [ContractEval](https://arxiv.org/abs/2508.03080) | Clause-level risk identification on CUAD | F1, including a "no related clause" case | Include negative / no-risk cases. |
| [Harvey BigLaw Bench](https://www.harvey.ai/blog/introducing-biglaw-bench) ([sources](https://www.harvey.ai/blog/biglaw-bench-sources), [GitHub](https://github.com/harveyai/biglaw-bench)) | Transactional + litigation tasks | Bespoke rubric per task: **positive points weighted by importance, negative points for hallucinations/errors/tone/irrelevance**; answer score = net points / max positive = "% of lawyer-quality work product." Separate **source score** = % of substantive points backed by a valid source | **Use this scoring shape**: net rubric score plus an independent citation score. |
| [Vals VLAIR Feb 2025](https://www.vals.ai/industry-reports/vlair-2-27-25) | 7 tasks (extraction, doc Q&A, summarization, redlining, transcript, chronology, EDGAR), more than 500 Am Law 100 questions, lawyer baseline | LLM judge given the reference answer plus **one correctness element at a time**, pass/fail per check; score = % checks passed; humans re-verified failures; citation accuracy scored separately for EDGAR; latency reported | **Atomic per-check judging** plus a human baseline plus human review of failures. |
| [Vals VLAIR Oct 2025 (research)](https://www.vals.ai/industry-reports/vlair-10-14-25) | 200 US research questions; AI 80% vs lawyers 71% | **Accuracy 50% (0–3), Authoritativeness 40% (0–3), Appropriateness 10% (0–2)**; blind, 2+ graders, third-party check on zeros | Weighted dimensions. |
| [Magesh et al., JELS 2025](https://arxiv.org/abs/2405.20362) ([PDF](https://dho.stanford.edu/wp-content/uploads/Legal_RAG_Hallucinations.pdf)) | Preregistered test of Lexis+ AI, Westlaw AI-AR, Ask Practical Law AI | Two axes: **correctness × groundedness**. Hallucination = incorrect OR **misgrounded** (cites a source that doesn't support the claim). Ungrounded or refusal = **incomplete**. Lexis 65% accurate; tools hallucinated 17–33%. Query types include false-premise and jurisdiction/time-specific | **Include false-premise items**, and keep "misgrounded" separate from "incomplete." |
| [How much do legal RAG systems still hallucinate? (2026)](https://arxiv.org/abs/2608.14210) | Configurations across retrievers and LLMs | Hallucination under 10% for the best (BM25+GPT-5), about 50% for the worst | Hallucination is still material, so citation faithfulness has to be a gate. |
| [LegalAgentBench](https://arxiv.org/abs/2412.17259) (ACL 2025) | Chinese legal; 17 corpora, 37 tools, 300 tasks (multi-hop, writing) | Final success plus **progress rate** via keyword milestones in the trajectory | Precedent for **partial-credit trajectory scoring**. |
| [GraphCompliance GCS-300](https://arxiv.org/abs/2510.26309) | GDPR; 300 semi-synthetic scenarios grounded in real enforcement decisions | Compliance judgment accuracy | Precedent for **semi-synthetic scenarios grounded in real sources** for regulatory change. |
| **GC AI In-House Legal Bench** ([gc.ai blog](https://gc.ai/blog/ai-legal-technology)) | 100 tasks, 10 categories incl. **Regulatory tracking**, Risk assessment, Contract analysis | Answer key of **about 12 criteria per task**, written by attorneys (80+ combined years); pass rate. GC AI 86.8%, GPT-5.5 79.8%, Opus 4.7 68.4%, Gemini 3.1 Pro 57.5% (vendor-reported) | **This is their house style**: criterion-level answer keys. Mirror it and extend it to agentic dimensions. |

No public benchmark was found that specifically targets *regulatory change → contract portfolio impact*. The closest are CLAUSE (perturbation), GraphCompliance (regulation-grounded scenarios), and LegalBench-RAG (span retrieval). [INFERRED] That gap is the take-home's opening: nobody has published this benchmark, so a well-designed small one is itself a contribution.

---

## 4. Eval methodology for agentic outputs

### 4.1 Principles (Anthropic, [Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents), Jan 2026)
- Vocabulary: task, trial, grader, transcript, outcome, suite. Combine **code graders** (fast, objective, brittle), **model graders** (nuance, need calibration), and **human graders** (gold standard, slow).
- Start with **20–50 tasks drawn from real failures**. Early effects are large, so small n is fine. Two experts should independently reach the same verdict on each task. A 0% pass rate on a frontier model usually means the task is broken.
- **Grade outcomes, not paths** (don't penalize a valid alternative route). **Give partial credit.** **Use balanced sets** (should-flag and should-not-flag cases). **Isolate trials** with clean environments.
- Separate **capability evals** (start with low pass rates, hill-climb them) from **regression evals** (about 100% pass, used as a safety net). Watch for saturation.
- **pass@k vs pass^k**: at 90% per trial, pass^10 is about 35%. For a background monitor that runs unattended, **pass^k (consistency) is the metric that matters.** Also see [τ-bench](https://arxiv.org/abs/2406.12045) (pass^k; end-state DB comparison; GPT-4 at about 25% on pass^8).
- Read transcripts. You can't tell whether a grader works without doing so.
- The multi-agent research team started with about 20 queries and used an LLM judge rubric covering **factual accuracy, citation accuracy, completeness, source quality, tool efficiency**, plus human review for edge cases (e.g., a bias toward SEO-farm sources) ([multi-agent](https://www.anthropic.com/engineering/multi-agent-research-system)).

### 4.2 LLM-as-judge done defensibly
- **Binary per-criterion checks over Likert scales** ([Hamel, LLM judge](https://hamel.dev/blog/posts/llm-judge/); [evals FAQ](https://hamel.dev/blog/posts/evals-faq/)). Vals uses the same atomic check-at-a-time design.
- **Calibrate against expert labels**: split the labeled traces into train (few-shot examples for the judge), dev (iterate), and test (touched once). Report **TPR and TNR**, not raw agreement. "Critique shadowing" means one domain expert gives pass/fail plus a written critique, and the critiques become the judge's few-shot examples.
- **Criteria drift** ([Shankar et al., Who Validates the Validators](https://arxiv.org/abs/2404.12272)): criteria emerge while grading, so expect to revise the rubric after looking at outputs, and version it.
- **Known judge biases** ([Zheng et al., MT-Bench](https://arxiv.org/abs/2306.05685)): position (swap order in pairwise and average), verbosity, and self-preference. [INFERRED] Use a judge from a *different model family* than the candidate models, or at least measure self-preference, because you're comparing models.
- **Pairwise comparison** for subjective dimensions (memo quality, drafting). Use absolute binary checks for objective ones.
- **Error analysis first**: open coding, then axial coding into a failure taxonomy, until saturation (about 100 traces) (Hamel FAQ). Write one judge per failure mode.
- **Synthetic data along dimensions**: define axes, enumerate tuples, then render them into natural language (Hamel FAQ).

### 4.3 Planted changes / fault injection
- CLAUSE is the published precedent: take real CUAD/ContractNLI contracts, inject 10 anomaly types grounded in statutes, then have experts review.
- [INFERRED] It's essentially mutation testing: because you planted the change, you know exact ground truth (which clauses in which docs are affected, and how). That gives **recall and precision without expensive labeling**. The expert's job shifts from *finding* issues to *verifying the plant is realistic and correctly labeled*, which is much cheaper.

### 4.4 Trajectory evals
- End-state first (Anthropic). Track trajectory metrics as *secondary* signals: tool calls, tokens, $ cost, wall-clock, number of documents opened vs relevant (retrieval efficiency), redundant calls, and retries after errors. Use LegalAgentBench-style **progress milestones** for partial credit. Use eve's `t.calledTool()` for required actions (e.g., must call `request_approval` before `send_notice`).

### 4.5 Hill-climbing a system prompt without overfitting
- Use GEPA/DSPy-style train/val/test splits: mutate prompts on train, select on val, report on an untouched test set ([DSPy GEPA](https://dspy.ai/current/getting-started/gepa-optimization/), [GEPA paper](https://arxiv.org/abs/2507.19457)). DSPy notes prompt optimizers overfit small train sets and suggests roughly 20/80 train/val for some optimizers.
- [INFERRED] Practical version for a 3-day build: about 60 items split 20 dev / 20 val / 20 held-out test. Log every prompt version and its scores (a prompt changelog). Report dev-vs-test gap as an overfitting signal. Run k≥3 trials per item and report mean ± CI, because small deltas within noise are not wins.

### 4.6 Regression across model versions
- Pin the suite. Run every candidate model through the same harness (eve via AI Gateway strings, Inspect `--model`, or Promptfoo providers matrix). Compare a per-dimension scorecard plus cost/latency plus pass^k. Re-run when a model is updated. Regression tier gates CI; capability tier tracks the frontier.
- Per the Anthropic harness-design lesson: when a model improves, **re-test whether harness components are still load-bearing** (ablate the evaluator loop or subagents and see if the score drops). [INFERRED] That's an impressive thing to show.

### 4.7 Tooling
| Tool | Fit |
|---|---|
| [eve evals](https://eve.dev/docs/evals/overview) | Native if you build on eve. Gates/soft/judge, dataset fan-out, CI exit codes, Braintrust reporter. |
| [Inspect AI](https://inspect.aisi.org.uk/) (UK AISI) | Python; Task = dataset + solver + scorer; agent solvers, sandboxes, tool approval, `--epochs` for repeated trials; used by METR. Strong for rigorous multi-model runs. |
| [Promptfoo](https://www.promptfoo.dev/) | YAML/CLI, provider matrix, free CI gate (non-zero exit code on failure); no production monitoring. |
| [Braintrust](https://www.braintrust.dev/) | Eval-first; experiment diffing, datasets, human review UI; about $2.50 per 1k scores past the free tier ([comparison](https://www.morphllm.com/comparisons/braintrust-vs-langsmith)). |
| LangSmith | Trace-first; best with LangGraph; trace-to-dataset. |
| OpenAI Evals | Tied to the OpenAI provider; less useful for cross-vendor comparison. |

---

## 5. A proposed eval set for "monitored sources + company docs → material change → ripple exposure → actions" [INFERRED throughout, grounded in sections 3–4]

### 5.1 Unit of evaluation
One **scenario** = (baseline source version, new source version, company corpus snapshot) → expected output (materiality verdict, affected-document/clause set with reasons, severity per item, recommended actions, citations). Each scenario is one agent run, graded with k=3 trials.

### 5.2 Corpus construction (cheap but defensible)
1. **Company corpus**: about 20–40 real public contracts from CUAD (MSAs, licenses, distribution, NDAs via ContractNLI) plus 3–5 synthetic internal policies (privacy policy, DPA template, vendor-onboarding checklist) written to reference those contracts. Real text keeps it realistic, and CUAD labels give clause locations for free.
2. **Source changes**, three kinds:
   - **Real historical diffs**: e.g., a real regulation or ToS version pair (a public ToS/privacy-policy revision from archived snapshots; a state privacy law amendment). Ground truth is expert-labeled, but only for a few scenarios (about 5) because it's expensive.
   - **Planted changes (bulk)**: take a real source text and mutate it with a controlled edit from a taxonomy (below). Because the author designed the plant, the affected clauses are known *by construction*: link each plant to specific CUAD clause categories (e.g., change the "data breach notification window 72h → 24h" and every DPA/MSA clause with a notification-period term is affected). An LLM proposes the plant and the candidate affected set; a human (the candidate, ideally with a lawyer spot-check) verifies. Mirrors CLAUSE.
   - **Planted conflicts on the company side**: edit a company contract so it newly conflicts (or newly stops conflicting) with an unchanged rule. This tests the ripple analysis independently of change detection.
3. **Label record per scenario**: `material: bool`, `affected: [{doc, clause_span, why, severity: high/med/low}]`, `not_affected_decoys: [...]`, `required_actions: [...]`, `forbidden_claims: [...]` (plausible but wrong), `rationale`.

### 5.3 Change taxonomy (coverage axes; enumerate tuples, then render)
- **Change type**: numeric threshold change (deadline, cap, fee); scope expansion or contraction (new covered entities/data types); new obligation; removed obligation or safe harbor; definition change (a term used in many contracts); effective-date or transition change; jurisdiction added; purely cosmetic change or renumbering (**should be judged non-material**).
- **Ripple shape**: direct clause hit; indirect via a defined term; via cross-reference or incorporation by reference; via an order of precedence (the policy overrides the contract); affected by *absence* (a missing clause is now required); no affected docs.
- **Difficulty**: number of affected docs (0, 1, 3, 10+), decoys that look similar but aren't affected (e.g., same keyword, different context), conflicting documents.
- **Adversarial/robustness**: false-premise source ("new law requires X" when it doesn't), a source fetch that returns garbage or an HTML error page (bad tool output), duplicate re-notification of the same change (idempotency), a prompt-injection string inside a monitored page.

### 5.4 Scoring dimensions (scorecard, not a single pass/fail)
| Dimension | Metric | Grader |
|---|---|---|
| D1 Materiality triage | Accuracy / F1 on material vs non-material; **false-alarm rate** on cosmetic changes | Code (exact label) |
| D2 Ripple recall | % of ground-truth affected (doc, clause) found | Code (span/ID overlap, LegalBench-RAG style) |
| D3 Ripple precision | % of flagged items that are truly affected (decoys count against) | Code |
| D4 Severity calibration | Weighted agreement with labeled high/med/low; penalize high→low misses more than over-calls | Code |
| D5 Reasoning correctness | Per-item binary "is the stated why correct?" | LLM judge (calibrated; atomic checks à la Vals) |
| D6 Citation faithfulness | % of claims with a quote that exists verbatim in the cited doc (code) **and** supports the claim (judge); misgrounded is a hard gate, following Magesh/BLB source score | Code + judge |
| D7 Hallucination / forbidden claims | Count of `forbidden_claims` or invented docs/clauses; **negative points** à la BLB | Code + judge |
| D8 Actionability | Rubric: owner, deadline, concrete next step, draft language where applicable | Judge (binary per criterion) |
| D9 Process safety | Required approval before outbound action; no duplicate actions on re-run | Code (trajectory: `calledTool` order, idempotency) |
| D10 Efficiency | Tokens, $/scenario, wall-clock, docs opened ÷ docs relevant | Code |
| D11 Consistency | pass^3 on D1–D3 | Code |
| D12 Style/appropriateness | Pairwise vs baseline memo; low weight (Vals uses 10%) | Pairwise judge, position-swapped |

**Headline score** (BLB-style): net rubric points ÷ max positive points, reported next to an independent citation score and cost. **Hard gates**: any fabricated citation, or missing a high-severity affected item, fails the scenario regardless of other points.

### 5.5 Composition and size (defensible for a 3-day build)
- About **40–60 scenarios**. About 70% planted (cheap, exact ground truth). About 15% real historical diffs (realism check, expert-labeled). About 15% negatives and adversarial (cosmetic changes, false premise, bad fetch, injection). **At least 25% should be should-not-flag cases**, so the monitor isn't rewarded for crying wolf (Anthropic balanced-set principle).
- Split: dev (for prompt iteration) / val (for selecting a version) / **held-out test** (reported once). Stratify by change type and ripple shape.
- Tag every scenario with its taxonomy tuple so failures can be analyzed per slice (e.g., "misses definition-change ripples").
- **Judge calibration set**: about 30 hand-labeled outputs for D5/D6/D8. Report TPR/TNR of the judge before trusting it.

### 5.6 In scope vs out of scope, and why
- **In scope**: detection, ripple mapping, severity, cited reasoning, recommended actions, the approval gate, and robustness to bad inputs. These are the steps where the agent adds value and where errors are costly.
- **Out of scope** (state it explicitly): legal correctness of the underlying regulation's interpretation beyond the planted ground truth; multi-jurisdiction conflict-of-laws; the quality of the final negotiated contract; UI and latency SLAs; web-scale crawling reliability. Reason: these need expert labeling beyond the budget, or they aren't agent behavior.
- **Known limitations** to own: planted changes can be cleaner than real regulatory prose (distribution shift), which is why the real-diff slice exists and should be reported separately. The planted set was authored with LLM help, which could favor the same model family, so use a different family for plant generation than the models under test, or rotate. Small n means wide CIs, so report them.

### 5.7 Model comparison protocol
- Run at least 2–3 candidate models (e.g., one Anthropic, one OpenAI, one Google or cheaper tier) through the *identical* harness, with k=3 trials each. Report the per-dimension scorecard, pass^3, $/scenario, and p50/p95 latency. Choose the model on a stated weighting (e.g., recall on high-severity items and citation faithfulness first, cost second). Show the Pareto frontier (quality vs $). Optionally route: a cheap model for D1 triage, a strong model for the ripple and synthesis steps (motivated by eval data, not assumed).
- Ablations that demonstrate judgment: (a) single call with everything stuffed into context vs agent; (b) with and without the evaluator/verifier pass; (c) with and without subagent fan-out. Report the quality delta per dollar. This directly answers "does this need to be long-running?" with data.

---

## Sources (consolidated)
- Anthropic: [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) · [Multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system) · [Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) · [Harness design for long-running apps](https://www.anthropic.com/engineering/harness-design-long-running-apps) · [Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) · [cwc-long-running-agents repo](https://github.com/anthropics/cwc-long-running-agents) · [Agent SDK loop](https://code.claude.com/docs/en/agent-sdk/agent-loop)
- [Cognition: Don't build multi-agents](https://cognition.com/blog/dont-build-multi-agents) · [Manus context engineering](https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus) · [OpenAI deep research](https://openai.com/index/introducing-deep-research/) · [METR](https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/) · [METR TH1.1](https://metr.org/blog/2026-1-29-time-horizon-1-1/)
- Vercel: [eve blog](https://vercel.com/blog/introducing-eve) · [eve GitHub](https://github.com/vercel/eve) · [eve docs](https://vercel.com/docs/eve) · [eve evals](https://eve.dev/docs/evals/overview) · [eve agent files](https://eve.dev/docs/reference/agent-files) · [Workflows](https://vercel.com/docs/workflows) · [Workflow SDK](https://workflow-sdk.dev/)
- Pi: [Wikipedia](https://en.wikipedia.org/wiki/Pi_(AI_agent)) · [npm](https://www.npmjs.com/package/@mariozechner/pi-coding-agent)
- Durable: [Temporal × OpenAI Agents SDK](https://docs.temporal.io/develop/python/integrations/openai-agents) · [Temporal × AI SDK](https://temporal.io/blog/building-durable-agents-with-temporal-and-ai-sdk-by-vercel) · [LangGraph interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts) · [Diagrid: checkpoints ≠ durable](https://www.diagrid.io/blog/checkpoints-are-not-durable-execution-why-langgraph-crewai-google-adk-and-others-fall-short-for-production-agent-workflows)
- Legal: [LegalBench](https://arxiv.org/abs/2308.11462) · [LegalBench-RAG](https://github.com/zeroentropy-ai/legalbenchrag) · [CUAD](https://huggingface.co/datasets/theatticusproject/cuad-qa) · [CLAUSE](https://arxiv.org/abs/2511.00340) · [ContractEval](https://arxiv.org/abs/2508.03080) · [Harvey BLB](https://www.harvey.ai/blog/introducing-biglaw-bench) · [BLB sources](https://www.harvey.ai/blog/biglaw-bench-sources) · [Vals VLAIR Feb 2025](https://www.vals.ai/industry-reports/vlair-2-27-25) · [Vals research Oct 2025](https://www.vals.ai/industry-reports/vlair-10-14-25) · [Magesh et al.](https://arxiv.org/abs/2405.20362) · [Legal RAG hallucination 2026](https://arxiv.org/abs/2608.14210) · [LegalAgentBench](https://arxiv.org/abs/2412.17259) · [GraphCompliance](https://arxiv.org/abs/2510.26309) · [GC AI In-House Legal Bench](https://gc.ai/blog/ai-legal-technology)
- Eval method: [Hamel LLM judge](https://hamel.dev/blog/posts/llm-judge/) · [Hamel evals FAQ](https://hamel.dev/blog/posts/evals-faq/) · [Shankar, Who validates the validators](https://arxiv.org/abs/2404.12272) · [Zheng, MT-Bench judge](https://arxiv.org/abs/2306.05685) · [τ-bench](https://arxiv.org/abs/2406.12045) · [DSPy GEPA](https://dspy.ai/current/getting-started/gepa-optimization/) · [Inspect AI](https://inspect.aisi.org.uk/) · [Braintrust vs LangSmith](https://www.morphllm.com/comparisons/braintrust-vs-langsmith)
