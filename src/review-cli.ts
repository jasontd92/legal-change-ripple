import { readFileSync } from "node:fs";
import { continueReview, openReview, type ReviewRequest } from "./review.js";

type Call =
  | { phase: "open"; request: ReviewRequest }
  | { phase: "continue"; run_id: string };

const call = JSON.parse(readFileSync(0, "utf8")) as Call;
const result = call.phase === "open" ? await openReview(call.request) : await continueReview(call.run_id);
process.stdout.write(JSON.stringify(result));
