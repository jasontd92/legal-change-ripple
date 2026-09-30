import { defineWorkflowTool } from "eve/tools";
import { z } from "zod";

type ReviewRequest = {
  config: string;
  custom_prompt?: string | null;
  as_of?: string;
  source_url?: string | null;
  trigger_group?: string | null;
  versions?: string[];
  scenario_id?: string;
};

type ReviewStep = {
  id: string;
  label: string;
  state: "running" | "done" | "failed";
  detail: string;
};

type ReviewStream = {
  run_id: string;
  status: "running" | "completed" | "failed" | "partial" | "unchanged" | "resumed_completed";
  steps: ReviewStep[];
};

type AdvanceResult = {
  run_id: string;
  done: boolean;
  status: ReviewStream["status"];
  step: ReviewStep | null;
  steps?: ReviewStep[];
  next_id: string | null;
  next_label: string | null;
};

const inputSchema = z.object({
  config: z.string().describe("Harness config path, relative to the repo. Example: configs/o1-glm.json"),
  custom_prompt: z.string().nullable().optional(),
  as_of: z.string().optional(),
  source_url: z.string().nullable().optional(),
  trigger_group: z.string().nullable().optional(),
  versions: z.array(z.string()).optional(),
  scenario_id: z.string().optional(),
});

export default defineWorkflowTool({
  description: "Run one Meridian impact review. Diffs the authority, applies the company gate, scopes stacks, reviews each in-scope stack, and ranks the report. Call once. Do not invent findings.",
  inputSchema,
  label: {
    start() {
      return "Impact review";
    },
    delta(_input, partial) {
      const steps = stepsOf(partial);
      const live = [...steps].reverse().find((step) => step.state === "running");
      return live ? `Impact review · ${live.label}` : "Impact review";
    },
  },
  toModelOutput(output) {
    const body = output as ReviewStream;
    return { type: "text", value: `run_id=${body.run_id || "none"} status=${body.status}. The page shows the report. Do not invent findings.` };
  },
  async *execute(input) {
    "use workflow";
    const request: ReviewRequest = {
      config: input.config,
      custom_prompt: input.custom_prompt ?? null,
      as_of: input.as_of,
      source_url: input.source_url ?? null,
      trigger_group: input.trigger_group ?? null,
      versions: input.versions,
      scenario_id: input.scenario_id,
    };
    let steps: ReviewStep[] = [{ id: "diff", label: "Change", state: "running", detail: runningDetail("diff") }];
    yield { run_id: "", status: "running", steps } satisfies ReviewStream;
    let result = await runReviewStep({ phase: "open", step: 0, request });
    steps = finished(result);
    let snapshot: ReviewStream = { run_id: result.run_id, status: result.done ? result.status : "running", steps };
    yield snapshot;
    if (result.done) return snapshot;
    for (let step = 1; step < 200; step++) {
      const id = result.next_id ?? `step-${step}`;
      const label = result.next_label ?? "Working";
      yield { ...snapshot, status: "running", steps: [...steps, { id, label, state: "running", detail: runningDetail(id) }] };
      result = await runReviewStep({ phase: "continue", step, run_id: result.run_id });
      steps = [...steps, ...finished(result)];
      snapshot = { run_id: result.run_id, status: result.done ? result.status : "running", steps };
      yield snapshot;
      if (result.done) return snapshot;
    }
    snapshot = {
      run_id: result.run_id,
      status: "failed",
      steps: [...steps, { id: "limit", label: "Stopped", state: "failed", detail: "The review exceeded the step limit." }],
    };
    return snapshot;
  },
});

/** A stack batch reports each stack it finished; other units report one step. */
function finished(result: AdvanceResult): ReviewStep[] {
  if (result.steps?.length) return result.steps;
  return result.step ? [result.step] : [];
}

function stepsOf(value: unknown): ReviewStep[] {
  if (!value || typeof value !== "object" || !("steps" in value) || !Array.isArray(value.steps)) return [];
  return value.steps as ReviewStep[];
}

function runningDetail(id: string): string {
  if (id === "diff") return "Comparing the two snapshots.";
  if (id === "gate") return "Checking the change against the company profile.";
  if (id === "scope") return "Choosing which agreements this change can reach.";
  if (id === "report") return "Ranking what the company should see.";
  if (id.startsWith("stack:")) return "Reading the agreement and writing a finding.";
  return "Working.";
}

async function runReviewStep(call: { phase: "open"; step: number; request: ReviewRequest } | { phase: "continue"; step: number; run_id: string }): Promise<AdvanceResult> {
  "use step";
  const host = await import("../review-host.js");
  return host.runReviewCli(call);
}
