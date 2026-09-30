import { TypeSafeClient, choice, type EntryType } from "@typesafe-ai/sdk";
import {
  DIRECTION,
  FINDING_TYPE,
  JEV_ABSTAIN_THRESHOLD,
  MATERIALITY,
  RESPONSE_TYPE,
  URGENCY,
  type Direction,
  type FindingType,
  type Materiality,
  type ResponseType,
  type Urgency,
} from "./enums.js";
import { emptyUsage } from "./models.js";
import type { Finding, TokenUse } from "./types.js";

const URGENCY_HELP: Record<Urgency, string> = {
  forfeitable_clock_running: "A right or claim is lost if this deadline, which is already running, passes.",
  obligation_clock_running: "A duty is due on a clock that is already running. Missing it is a breach; the right itself is not forfeited.",
  clock_pending: "The clock starts on a known future event that has not happened yet.",
  no_clock: "No deadline.",
  undeterminable: "A clock may exist, but the date or the triggering fact is missing.",
};

const MATERIALITY_HELP: Record<Materiality, string> = {
  material: "Shifts a recurring cost or benefit, changes the value of a right, creates a compliance or breach risk, starts a clock, or meets a threshold the GC stated.",
  not_material: "None of the materiality tests fire.",
  undeterminable: "A test might fire, but a fact needed to know is missing.",
};

const DIRECTION_HELP: Record<Direction, string> = {
  exposure: "The company is worse off or takes on a new burden.",
  recovery: "The company can get money or a right back.",
  both: "There is both a burden and a recovery.",
  neutral: "No shift in who bears the cost or the right.",
};

export type Classification = {
  labels: Finding["labels"];
  finding_type: FindingType;
  usage: TokenUse;
  model: string;
};

export async function classifyFinding(opts: {
  finding: Finding;
  company: string;
  asOf: string;
}): Promise<Classification> {
  const client = new TypeSafeClient();
  const finding = opts.finding;
  const response = await client.systemOne({
    state: JSON.parse(JSON.stringify({
      as_of: opts.asOf,
      company: opts.company,
      reasoning: finding.reasoning,
      trigger_quote: finding.citations.trigger.quote ?? "",
      clause_quote: finding.citations.clause.quote ?? "",
      facts: finding.facts ?? null,
      open_questions: finding.open_questions ?? [],
    })) as EntryType,
    questions: {
      urgency: choice("What urgency category fits this evidence? Use undeterminable when the missing fact is named or obvious.", Object.fromEntries(URGENCY.map((k) => [k, URGENCY_HELP[k]]))),
      materiality: choice("Does a materiality test fire?", Object.fromEntries(MATERIALITY.map((k) => [k, MATERIALITY_HELP[k]]))),
      direction: choice("Which way does the value move for the company?", Object.fromEntries(DIRECTION.map((k) => [k, DIRECTION_HELP[k]]))),
      finding_type: choice(
        `Pick exactly one finding type. Precedence, first match wins: ${FINDING_TYPE.join(", ")}. recovery_opportunity is a right to recover. billing_discrepancy is a charge outside the contract or on a lapsed basis.`,
        Object.fromEntries(FINDING_TYPE.map((k) => [k, k.replaceAll("_", " ")])),
      ),
      response_type: choice(
        "Pick exactly one next response. Do not plan the action; label it.",
        Object.fromEntries(RESPONSE_TYPE.map((k) => [k, k.replaceAll("_", " ")])),
      ),
    },
  });
  const answers = response.answers;
  const missing: string[] = [];
  const urgency = abstain(answers.urgency.choice, answers.urgency.probabilities, answers.urgency.confidence, "urgency", missing) as Urgency;
  const materiality = abstain(answers.materiality.choice, answers.materiality.probabilities, answers.materiality.confidence, "materiality", missing) as Materiality;
  const direction = answers.direction.choice as Direction;
  const finding_type = answers.finding_type.choice as FindingType;
  const response_type = answers.response_type.choice as ResponseType;
  if (answers.finding_type.confidence < JEV_ABSTAIN_THRESHOLD) {
    missing.push(`finding_type confidence ${answers.finding_type.confidence.toFixed(2)} below ${JEV_ABSTAIN_THRESHOLD}`);
  }
  const probabilities = {
    urgency: answers.urgency.probabilities,
    materiality: answers.materiality.probabilities,
    direction: answers.direction.probabilities,
    finding_type: answers.finding_type.probabilities,
    response_type: answers.response_type.probabilities,
  };
  return {
    finding_type,
    labels: {
      urgency,
      materiality,
      direction,
      response_type,
      materiality_test: finding.labels.materiality_test,
      missing_fact: missing.length ? missing.join("; ") : finding.labels.missing_fact ?? null,
      label_source: "jev",
      label_probabilities: probabilities,
    },
    usage: {
      input: response.usage.input_tokens,
      cached_input: 0,
      output: response.usage.output_tokens,
      reasoning: 0,
    },
    model: response.model,
  };
}

function abstain(
  choiceValue: string,
  probabilities: Record<string, number>,
  confidence: number,
  dimension: string,
  missing: string[],
): string {
  const top = Math.max(0, ...Object.values(probabilities));
  const low = confidence < JEV_ABSTAIN_THRESHOLD || top < JEV_ABSTAIN_THRESHOLD;
  if (low && "undeterminable" in probabilities) {
    missing.push(`${dimension} confidence ${confidence.toFixed(2)} below ${JEV_ABSTAIN_THRESHOLD}`);
    return "undeterminable";
  }
  return choiceValue;
}

export function classifierUsagePlaceholder(): TokenUse {
  return emptyUsage();
}
