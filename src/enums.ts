/** Frozen enums. Canonical values live in contracts/schemas/common.schema.json. */
export const LEGAL_STATUS = [
  "in_force",
  "enacted_future_effective",
  "in_force_challenged",
  "stayed_or_enjoined",
  "proposed",
  "vacated_or_repealed",
  "undeterminable",
] as const;

export const COMPANY_GATE = ["proceed", "exit", "uncertain"] as const;

export const APPLICABILITY = ["applies", "does_not_apply", "undeterminable"] as const;

export const DETERMINATION = ["affected", "not_affected", "needs_review"] as const;

export const URGENCY = [
  "forfeitable_clock_running",
  "obligation_clock_running",
  "clock_pending",
  "no_clock",
  "undeterminable",
] as const;

export const MATERIALITY = ["material", "not_material", "undeterminable"] as const;

export const DIRECTION = ["exposure", "recovery", "both", "neutral"] as const;

/** Precedence is this order. Exactly one value per finding. */
export const FINDING_TYPE = [
  "deadline_bound_right",
  "deadline_bound_obligation",
  "liability_or_compliance_exposure",
  "recovery_opportunity",
  "billing_discrepancy",
  "cost_exposure",
  "consistency_gap",
  "clerical_update",
  "watch",
] as const;

export const RESPONSE_TYPE = [
  "send_notice",
  "exercise_pass_through",
  "seek_refund_or_credit",
  "renegotiate",
  "update_template",
  "escalate_outside_counsel",
  "brief_finance",
  "monitor",
  "no_action",
] as const;

export type LegalStatus = (typeof LEGAL_STATUS)[number];
export type CompanyGate = (typeof COMPANY_GATE)[number];
export type Applicability = (typeof APPLICABILITY)[number];
export type Determination = (typeof DETERMINATION)[number];
export type Urgency = (typeof URGENCY)[number];
export type Materiality = (typeof MATERIALITY)[number];
export type Direction = (typeof DIRECTION)[number];
export type FindingType = (typeof FINDING_TYPE)[number];
export type ResponseType = (typeof RESPONSE_TYPE)[number];

export const WATCH_LEGAL = new Set<LegalStatus>(["stayed_or_enjoined", "proposed", "vacated_or_repealed"]);

export const DEFAULT_URGENCY_WINDOW_DAYS = 30;

/** Below this Jev probability, a dimension that has undeterminable abstains. */
export const JEV_ABSTAIN_THRESHOLD = 0.45;
