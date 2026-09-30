import { runAgent } from "../src/models.js";

const run = await runAgent({
  modelId: "gpt-5.6-luna",
  system: "Reply with the single word pong.",
  messages: [{ role: "user", content: "Reply with the single word pong." }],
  tools: {},
  maxSteps: 1,
  cache: "on",
});
console.log(JSON.stringify({ text: run.text.trim(), usage: run.usage }));
