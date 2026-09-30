import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { requireRunningClockDate } from "../src/labels.js";
import type { StackFinding } from "../src/types.js";

const dirs = process.argv.slice(2);
for (const dir of dirs) {
  const findingsDir = path.join(dir, "findings");
  const file = readdirSync(findingsDir).find((name) => name.endsWith(".json"));
  if (!file) {
    console.log(`${dir}: no findings`);
    continue;
  }
  const stack = JSON.parse(readFileSync(path.join(findingsDir, file), "utf8")) as StackFinding;
  for (const finding of stack.findings ?? []) {
    const next = requireRunningClockDate(finding.labels, finding.facts?.deadline_date);
    const date = finding.facts?.deadline_date ?? "-";
    const moved = next.urgency !== finding.labels.urgency ? ` -> ${next.urgency}` : "";
    console.log(`${path.basename(dir)} ${finding.id} ${finding.labels.urgency}/${date}${moved}`);
  }
}
