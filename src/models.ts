import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { gateway, generateText, streamText, stepCountIs, tool, wrapLanguageModel, type LanguageModel, type LanguageModelMiddleware, type ModelMessage, type ToolSet } from "ai";
import { chatgpt } from "eve/models/openai";
import type { ZodType } from "zod";
import type { TokenUse, ToolCallRecord, ToolOutcome } from "./types.js";

export type AgentTool = {
  description: string;
  inputSchema: ZodType;
  execute: (input: unknown) => Promise<ToolOutcome>;
};

export type AgentRun = {
  text: string;
  messages: ModelMessage[];
  usage: TokenUse;
  peak_context_tokens: number;
  tool_calls: ToolCallRecord[];
  steps: number;
};

export function providerFor(modelId: string): "gateway" | "anthropic" | "openai" | "chatgpt" | "stub" {
  if (modelId === "stub") return "stub";
  if (modelId.startsWith("claude") || modelId.startsWith("anthropic/")) return "anthropic";
  if (modelId === "gpt-5.6-luna" || modelId.startsWith("chatgpt:")) return "chatgpt";
  if (modelId.startsWith("gpt-")) return "openai";
  return "gateway";
}

export function languageModel(modelId: string): LanguageModel {
  if (modelId === "stub") throw new Error("stub is handled in-process and is not a provider model");
  if (modelId.startsWith("anthropic/")) return anthropic(modelId.slice("anthropic/".length));
  if (modelId.startsWith("claude")) return anthropic(modelId);
  if (modelId === "gpt-5.6-luna") return chatgpt("gpt-5.6-luna");
  if (modelId.startsWith("chatgpt:")) return chatgpt(modelId.slice("chatgpt:".length));
  if (modelId.startsWith("gpt-")) return openai(modelId);
  return gateway(modelId);
}

export function emptyUsage(): TokenUse {
  return { input: 0, cached_input: 0, cache_write: 0, output: 0, reasoning: 0 };
}

/** One model request, not one agent step. A provider that goes silent is cut off here and asked again. */
// Non-streaming calls cannot tell "silent" from "still writing", so the limit must fit the longest real answer:
// a whole StackFinding in one commit took more than 2 minutes on GLM. Five minutes matches the old whole-call budget.
const REQUEST_TIMEOUT_MS = 300_000;
const STALL_ATTEMPTS = 2;

/**
 * Retry a single stalled request. Retrying the whole agent call would re-run tools that already
 * recorded items; this repeats only the request that got no answer.
 */
export function stallRetry(onStall: (attempt: number) => void, timeoutMs = REQUEST_TIMEOUT_MS, attempts = STALL_ATTEMPTS): LanguageModelMiddleware {
  return {
    wrapGenerate: async ({ model, params }) => {
      for (let attempt = 1; ; attempt++) {
        const timer = AbortSignal.timeout(timeoutMs);
        const signal = params.abortSignal ? AbortSignal.any([params.abortSignal, timer]) : timer;
        try {
          return await model.doGenerate({ ...params, abortSignal: signal });
        } catch (err) {
          if (!timer.aborted || params.abortSignal?.aborted) throw err;
          if (attempt >= attempts) {
            throw new Error(`The model gave no answer within ${timeoutMs / 1000}s, ${attempts} times in a row.`);
          }
          onStall(attempt);
        }
      }
    },
  };
}

export type AgentEvent =
  | { type: "working"; model: string }
  | { type: "stalled"; model: string; attempt: number }
  | { type: "tool"; phase: "started" | "finished"; tool: string; file?: string | null; ok?: boolean; error?: string | null; input_chars?: number; sent?: Record<string, unknown> };

export async function runAgent(opts: {
  modelId: string;
  system: string;
  messages: ModelMessage[];
  tools: Record<string, AgentTool>;
  maxSteps: number;
  stopWhen?: () => boolean;
  providerPin?: string | null;
  cache: "on" | "off";
  onEvent?: (event: AgentEvent) => void;
}): Promise<AgentRun> {
  const usage = emptyUsage();
  const tool_calls: ToolCallRecord[] = [];
  let peak = 0;
  const aiTools: ToolSet = {};
  for (const [name, def] of Object.entries(opts.tools)) {
    aiTools[name] = tool({
      description: def.description,
      inputSchema: def.inputSchema,
      execute: async (input) => {
        const file = fileOf(input);
        opts.onEvent?.({ type: "tool", phase: "started", tool: name, file });
        try {
          const outcome = await def.execute(input);
          tool_calls.push({
            tool: name,
            file: outcome.telemetry.file ?? null,
            chars_returned: outcome.telemetry.chars_returned ?? null,
            file_chars: outcome.telemetry.file_chars ?? null,
            ok: outcome.telemetry.ok,
            error: outcome.telemetry.error ?? null,
            injected_fault: outcome.telemetry.injected_fault === true,
          });
          opts.onEvent?.({
            type: "tool",
            phase: "finished",
            tool: name,
            file: outcome.telemetry.file ?? file,
            ok: outcome.telemetry.ok,
            error: outcome.telemetry.error ?? null,
          });
          return outcome.model;
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          opts.onEvent?.({ type: "tool", phase: "finished", tool: name, file, ok: false, error: message });
          throw err;
        }
      },
    });
  }
  // A call the SDK cannot parse or validate never reaches execute. Record it here so it shows on the trace.
  const onStepFinish = (step: { toolCalls?: unknown[] }) => {
    for (const call of step.toolCalls ?? []) {
      const bad = call as { invalid?: boolean; toolName?: string; input?: unknown; error?: unknown };
      if (!bad.invalid) continue;
      const tool = bad.toolName ?? "unknown";
      const error = `invalid tool call: ${describe(bad.error)}`.slice(0, 600);
      tool_calls.push({ tool, file: null, chars_returned: null, file_chars: null, ok: false, error, injected_fault: false });
      opts.onEvent?.({ type: "tool", phase: "finished", tool, file: null, ok: false, error, input_chars: inputChars(bad.input), sent: offending(bad.error, bad.input) });
    }
  };
  const system = opts.cache === "off" ? `${opts.system}\n\nCache-bust: ${crypto.randomUUID()}` : opts.system;
  const beat = setInterval(() => opts.onEvent?.({ type: "working", model: opts.modelId }), 5_000);
  try {
    const base = languageModel(opts.modelId);
    const model = typeof base === "string" || providerFor(opts.modelId) === "chatgpt"
      ? base
      : wrapLanguageModel({ model: base, middleware: stallRetry((attempt) => opts.onEvent?.({ type: "stalled", model: opts.modelId, attempt })) });
    const request = {
      model,
      system,
      messages: opts.messages,
      tools: aiTools,
      stopWhen: [() => opts.stopWhen?.() === true, stepCountIs(opts.maxSteps)],
      // Per step, not per loop: recording one item per call adds steps, and a slow provider step should not sink the whole agent.
      timeout: { stepMs: REQUEST_TIMEOUT_MS * STALL_ATTEMPTS + 30_000, totalMs: 2_400_000 },
      maxRetries: 2,
      providerOptions: opts.providerPin ? { gateway: { only: [opts.providerPin] } } : undefined,
      onStepFinish,
    };
    // The ChatGPT subscription endpoint rejects a non-streaming request.
    if (providerFor(opts.modelId) === "chatgpt") {
      const result = streamText(request);
      const [text, total, steps, produced] = await Promise.all([
        result.text,
        result.totalUsage,
        result.steps,
        result.responseMessages,
      ]);
      addUsage(usage, total);
      for (const step of steps) {
        const input = step.usage?.inputTokens ?? 0;
        if (input > peak) peak = input;
      }
      if (peak === 0) peak = usage.input;
      return { text, messages: produced, usage, peak_context_tokens: peak, tool_calls, steps: steps.length };
    }
    const result = await generateText(request);
    const total = result.totalUsage ?? result.usage;
    addUsage(usage, total);
    for (const step of result.steps ?? []) {
      const input = step.usage?.inputTokens ?? 0;
      if (input > peak) peak = input;
    }
    if (peak === 0) peak = usage.input;
    // responseMessages holds every step; response.messages is only the last one.
    const produced = result.responseMessages ?? [];
    return { text: result.text, messages: produced, usage, peak_context_tokens: peak, tool_calls, steps: result.steps?.length ?? 0 };
  } finally {
    clearInterval(beat);
  }
}

/** The SDK message prints the whole rejected value before the issues. Keep the issues, which say what was wrong. */
function describe(error: unknown): string {
  const text = (error instanceof Error ? error.message : String(error)).replace(/\s+/g, " ");
  const at = text.indexOf("Error message:");
  const head = text.split(" Value:")[0] ?? text;
  return at >= 0 ? `${head} ${text.slice(at)}` : text;
}

/** The values the model sent at the paths the validator rejected, so a bad enum shows what was tried. */
function offending(error: unknown, input: unknown): Record<string, unknown> | undefined {
  const text = error instanceof Error ? error.message : String(error);
  const paths = [...text.matchAll(/"path":\s*\[([^\]]*)\]/g)].map((m) => (m[1] ?? "").split(",").map((p) => p.trim().replace(/^"|"$/g, "")).filter(Boolean));
  if (paths.length === 0 || !input || typeof input !== "object") return undefined;
  const out: Record<string, unknown> = {};
  for (const keys of paths) {
    let at: unknown = input;
    for (const key of keys) at = at && typeof at === "object" ? (at as Record<string, unknown>)[key] : undefined;
    out[keys.join(".")] = typeof at === "string" ? at.slice(0, 120) : at === undefined ? "(missing)" : typeof at;
  }
  return out;
}

function inputChars(input: unknown): number {
  return typeof input === "string" ? input.length : JSON.stringify(input ?? null).length;
}

function fileOf(input: unknown): string | null {
  if (input && typeof input === "object" && "file" in input && typeof input.file === "string") return input.file;
  return null;
}

function addUsage(into: TokenUse, usage: { inputTokens?: number; outputTokens?: number; inputTokenDetails?: { cacheReadTokens?: number; cacheWriteTokens?: number }; outputTokenDetails?: { reasoningTokens?: number } } | undefined): void {
  if (!usage) return;
  into.input += usage.inputTokens ?? 0;
  into.cached_input += usage.inputTokenDetails?.cacheReadTokens ?? 0;
  into.cache_write = (into.cache_write ?? 0) + (usage.inputTokenDetails?.cacheWriteTokens ?? 0);
  into.output += usage.outputTokens ?? 0;
  into.reasoning = (into.reasoning ?? 0) + (usage.outputTokenDetails?.reasoningTokens ?? 0);
}
