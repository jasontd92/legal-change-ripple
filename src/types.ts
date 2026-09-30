import type {
  Applicability,
  CompanyGate,
  Determination,
  Direction,
  FindingType,
  LegalStatus,
  Materiality,
  ResponseType,
  Urgency,
} from "./enums.js";

export type Span = {
  file: string;
  start: number;
  end: number;
  section_label?: string;
  quote?: string;
};

export type ScenarioInput = {
  scenario_id: string;
  trigger: { group: string; versions: string[] };
  as_of: string;
  profile: string;
  custom_prompt?: string | null;
  corpus_root: string;
};

export type ChangeItem = {
  id: string;
  summary?: string;
  substantive: boolean;
  dismissal_reason?: string | null;
  anchor: Span;
  legal_status: LegalStatus;
  effective_date?: string | null;
  applies_to?: {
    jurisdictions?: string[];
    entity_types?: string[];
    product_classes?: string[];
    thresholds?: string[];
  };
};

export type ChangeRecord = {
  items: ChangeItem[];
  company_gate: CompanyGate;
  company_gate_reason?: string;
  source_chars_read?: number;
};

export type ScopeDecision = {
  stack_id: string;
  in_scope: boolean;
  reason: string;
};

export type ScopeTrace = { stacks: ScopeDecision[] };

export type Labels = {
  urgency: Urgency;
  materiality: Materiality;
  direction: Direction;
  response_type: ResponseType;
  materiality_test?: string;
  missing_fact?: string | null;
  label_source?: "self" | "jev";
  label_probabilities?: Record<string, unknown> | null;
};

export type Finding = {
  id: string;
  change_ref: string;
  finding_type: FindingType;
  hop_chain?: { span: Span; inference: string }[];
  citations: { trigger: Span; clause: Span };
  absence?: { clause_type: string; searched_files: string[] } | null;
  labels: Labels;
  facts?: {
    deadline_rule?: Record<string, unknown> | null;
    deadline_date?: string | null;
    exposure?: Record<string, unknown> | null;
  };
  reasoning: string;
  open_questions?: string[];
};

export type CrossReference = {
  target_description: string;
  target_stack_id?: string | null;
  span?: Span;
};

export type StackFinding = {
  stack_id: string;
  applicability: Applicability;
  applicability_reason?: string;
  determination: Determination;
  findings: Finding[];
  files_read: string[];
  files_unparseable: string[];
  cross_references: CrossReference[];
};

export type ReportItem = {
  rank: number;
  stack_id: string;
  finding_id: string;
  change_ref: string;
  labels: Labels;
  category?: FindingType;
  group?: Direction;
  headline?: string;
  amount?: number | null;
  what?: string;
  why?: string;
  when?: string;
  rationale: string;
  citations: { trigger: Span; clause: Span };
};

export type ImpactReport = {
  items: ReportItem[];
  not_material: { stack_id: string; finding_id: string; reason: string }[];
  cross_links: {
    a: string;
    b: string;
    type: string;
    resolves_cross_reference?: string | null;
  }[];
  cross_reference_resolutions?: Record<string, unknown>[];
  change_item_closure: {
    change_ref: string;
    status: "addressed" | "unaddressed";
    reason?: string;
  }[];
};

export type CoverageStatement = {
  reviewed_stacks: string[];
  excluded_stacks: Record<string, unknown>[];
  unparseable_files: string[];
  out_of_scope: string[];
};

export type TokenUse = {
  input: number;
  cached_input: number;
  cache_write?: number;
  output: number;
  reasoning?: number;
};

export type ToolCallRecord = {
  tool: string;
  file?: string | null;
  chars_returned?: number | null;
  file_chars?: number | null;
  ok: boolean;
  error?: string | null;
  injected_fault?: boolean;
};

export type AgentRecord = {
  agent_id: string;
  role: "orchestrator" | "subagent" | "classifier" | "judge";
  stack_id?: string | null;
  model: string;
  provider?: string | null;
  tokens: TokenUse;
  peak_context_tokens?: number;
  cost_usd?: number | null;
  retries: number;
  tool_calls: ToolCallRecord[];
};

export type StageRecord = {
  stage: "0" | "1" | "1b" | "3" | "4" | "5";
  status: string;
  started_at: string;
  ended_at: string;
  injected?: boolean;
};

export type RunTrace = {
  run_id: string;
  contract_version: string;
  scenario: ScenarioInput;
  model_config: ModelConfig;
  status: "completed" | "failed" | "resumed_completed" | "partial";
  stages: StageRecord[];
  agents: AgentRecord[];
  compactions?: number;
};

export type ModelConfig = {
  orchestrator: string;
  subagent: string;
  classifier: string;
  provider_pin?: string | null;
};

export type HarnessConfig = {
  model_config: ModelConfig;
  scenario?: {
    as_of?: string;
    profile?: string;
    corpus_root?: string;
  };
  faults?: {
    tool_error?: { tool: string; nth_call: number };
    kill_after?: { stage?: string; stack_count?: number };
  };
  cache?: "on" | "off";
  max_tool_calls_per_subagent?: number;
  concurrency?: number;
  ranking?: "deterministic" | "model";
  /**
   * Cap fan-out to these stack ids. Omit it to dispatch every in-scope stack.
   * Stacks outside the list are recorded as out of scope after the model's own scope decision.
   */
  only_stacks?: string[];
  /** USD per 1M tokens. Absent prices leave cost_usd null. */
  prices?: Record<string, { input: number; output: number; cached_input?: number }>;
};

export type IncorporatesEdge = {
  source_doc_id: string;
  target_doc_id: string;
  clause_heading: string;
  section: string;
  quote: string;
  version_pin: string | null;
};

export type ToolOutcome = {
  model: unknown;
  telemetry: Partial<ToolCallRecord> & { tool: string; ok: boolean };
};
