# legal-change-ripple

Monitored-authority impact review. When a watched legal source changes (a statute, a rule, a vendor's terms), the harness diffs it, finds the contracts and policies in the corpus that depend on it, has agents review each affected document, and writes an impact report. The report is shown in a small web UI.

GC AI Applied AI Engineer take-home submission.

## Repository map

| Path | What it is |
| --- | --- |
| `src/` | Harness: diff, stack building, agent sessions, classification, ranking, server |
| `agent/` | The eve agent definition used by the review host |
| `ui/` | React + Vite report UI (served by `harness serve`) |
| `configs/` | Model configs, one per run profile (`stub.json` needs no API keys) |
| `contracts/` | Versioned artifact schemas and normaliser shared by the system and the evals |
| `corpus/` | The synthetic contract corpus and trigger documents |
| `build/` | Corpus build pipeline (see `build/README.md`) |
| `eval-scenarios/`, `eval-design.md` | Eval design, scenarios, answer keys, scores |
| `scripts/`, `test/` | Scoring scripts and unit tests |
| `system-design.md`, `take-home-context.md`, `use-case-research.md`, `research/` | Design notes and research |
| `chat-logs/` | Claude Code and Cursor transcripts from building this |

## Setup

Requires Node 22 or later (the harness uses `process.loadEnvFile`).

```bash
npm install
npm --prefix ui install
npm run ui:build
```

### API keys

Copy the template and fill in the keys you need:

```bash
cp .env.example .env.local
```

| Variable | Needed for | Where to get it |
| --- | --- | --- |
| `AI_GATEWAY_API_KEY` | Default configs (`o1-glm`, `o2-deepseek`, `j-jev`) and the eve agent. Any model id with a `provider/` prefix goes through the gateway. | Vercel dashboard → AI Gateway → API Keys |
| `TYPESAFE_API_KEY` | Only `configs/j-jev.json` (Jev classifier) | TypeSafe dashboard. The `scripts/step*-jev.ts` scripts also accept `JEV_API_KEY`. |
| `ANTHROPIC_API_KEY` | Optional: `claude-*` model ids (`configs/s-sonnet.json`) | console.anthropic.com |
| `OPENAI_API_KEY` | Optional: `gpt-*` model ids | platform.openai.com |

`.env.local` and `.env` are git-ignored. The harness loads them on start, so there's no need to export anything.

`configs/stub.json` runs the pipeline with a stub model and needs no keys. Use it to check the install.

## Running

```bash
npm run serve            # http://127.0.0.1:8787
```

Pick a trigger in the UI to start a run. The report opens when the run finishes. Runs are written to `runs/<scenario_id>/`, which is git-ignored.

From the CLI:

```bash
./bin/harness run --input scenario.json --config configs/o1-glm.json --out runs/my-run
./bin/harness resume --run runs/my-run
./bin/harness --help
```

The scenario input schema is `contracts/schemas/scenario-input.schema.json`.

Tests and typecheck:

```bash
npm test
npm run typecheck
```

## Direct API keys instead of Vercel AI Gateway

Model routing lives in `languageModel()` in `src/models.ts`, and it's decided by the model id:

| Model id | Provider | Key |
| --- | --- | --- |
| `claude-*` or `anthropic/*` | `@ai-sdk/anthropic` (direct) | `ANTHROPIC_API_KEY` |
| `gpt-*` | `@ai-sdk/openai` (direct) | `OPENAI_API_KEY` |
| anything else with a `provider/` prefix | Vercel AI Gateway | `AI_GATEWAY_API_KEY` |

To go without the gateway:

1. **Use a direct model id in the config.** Set `orchestrator` and `subagent` in a config to a `claude-*` or `gpt-*` id. `configs/s-sonnet.json` already does this. Add the model to `prices` so cost telemetry stays right.
2. **Change the eve agent's model.** `agent/agent.ts` hard-codes `model: "zai/glm-5.3-flash"`. Change it to a direct id too, or the review host still calls the gateway.
3. **Adding another provider directly** (for example Z.ai or DeepSeek without the gateway): install its AI SDK provider, or point `createOpenAI` at an OpenAI-compatible endpoint, and add a branch in `languageModel()` before the gateway fallback:

   ```ts
   import { createOpenAI } from "@ai-sdk/openai";

   const deepseek = createOpenAI({ baseURL: "https://api.deepseek.com/v1", apiKey: process.env.DEEPSEEK_API_KEY });

   // in languageModel(), before `return gateway(modelId)`:
   if (modelId.startsWith("deepseek/")) return deepseek.chat(modelId.slice("deepseek/".length));
   ```

   Update `providerFor()` to match so traces record the right provider.
4. **`provider_pin`** in a config only affects gateway calls (`providerOptions.gateway.only`). Leave it `null` for direct providers.

## Rebuilding the corpus

The built corpus is committed in `corpus/`. The raw sources in `build/raw/` (~160 MB) are not. See `build/README.md` to fetch and rebuild them. The LLM steps call `claude -p` and cache their results in `build/cache/`.
