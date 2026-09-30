import assert from "node:assert/strict";
import { test } from "node:test";
import { diffLines, excerptRows, hunkForRange, lineBounds, myersDiff, previewFromHunks, type Edit } from "../src/diff.js";
import { diffSnapshots } from "../src/stage0.js";

function applyEdits(source: string[], edits: Edit[]): string[] {
  const out: string[] = [];
  let index = 0;
  for (const edit of edits) {
    if (edit.op === "equal" || edit.op === "delete") {
      assert.equal(source[index], edit.text);
      if (edit.op === "equal") out.push(edit.text);
      index += 1;
    } else {
      out.push(edit.text);
    }
  }
  assert.equal(index, source.length);
  return out;
}

test("myers edit script round-trips", () => {
  const cases: [string[], string[]][] = [
    [[], []],
    [[], ["a"]],
    [["a"], []],
    [["a", "b", "c"], ["a", "b", "c"]],
    [["a", "b", "c"], ["a", "x", "c"]],
    [["a", "b", "c"], ["b", "c", "d"]],
    [["a", "a"], ["a"]],
    [["a"], ["a", "a"]],
    [["The duty is 10 percent."], ["The duty is 25 percent."]],
    [["alpha", "beta", "gamma"], ["alpha", "BETA", "gamma", "delta"]],
  ];
  for (const [left, right] of cases) {
    assert.deepEqual(applyEdits(left, myersDiff(left, right)), right);
  }
  let seed = 17;
  const next = () => {
    seed = (seed * 16807) % 2147483647;
    return seed;
  };
  for (let round = 0; round < 40; round++) {
    const left = Array.from({ length: next() % 35 }, () => String(next() % 6));
    const right = Array.from({ length: next() % 35 }, () => String(next() % 6));
    assert.deepEqual(applyEdits(left, myersDiff(left, right)), right);
  }
});

test("a changed word is marked inside the line, and the rest is not", () => {
  const hunks = diffLines("The duty is 10 percent.\n", "The duty is 25 percent.\n");
  assert.equal(hunks.length, 1);
  const removed = hunks[0]?.rows.find((row) => row.mark === "-");
  const added = hunks[0]?.rows.find((row) => row.mark === "+");
  assert.ok(removed?.spans.some((span) => span.kind === "del" && span.text === "10"));
  assert.ok(added?.spans.some((span) => span.kind === "ins" && span.text === "25"));
  const plain = added?.spans.filter((span) => span.kind === "same").map((span) => span.text).join("") ?? "";
  assert.match(plain, /The duty is/);
  assert.match(plain, /percent/);
  assert.equal(added?.spans.some((span) => span.kind === "ins" && span.text.includes("The duty")), false);
});

test("a shared word stays plain when the sentence is rewritten around it", () => {
  const hunks = diffLines(
    "Section 2. The Department will investigate whether copper imports impair national security.\n",
    "Section 2. The duty on copper tube is 25 percent ad valorem, effective August 1, 2025.\n",
  );
  const added = hunks[0]?.rows.find((row) => row.mark === "+");
  assert.ok(added?.spans.some((span) => span.kind === "same" && span.text.includes("copper")));
  assert.ok(added?.spans.some((span) => span.kind === "ins" && span.text === "25"));
  assert.equal(added?.spans.some((span) => span.kind === "ins" && span.text.includes("copper")), false);
});

test("a reflowed paragraph still highlights the new word", () => {
  const hunks = diffLines("alpha beta gamma\ndelta\n", "alpha BETA gamma delta\n");
  const added = hunks.flatMap((hunk) => hunk.rows).filter((row) => row.mark === "+");
  assert.ok(added.some((row) => row.spans.some((span) => span.kind === "ins" && span.text === "BETA")));
});

test("identical snapshots produce no hunks", () => {
  assert.deepEqual(diffLines("same\n", "same\n"), []);
});

test("a citation window stays short inside a long rewrite", () => {
  const oldLines = Array.from({ length: 80 }, (_, index) => `old line ${index}`);
  const newLines = Array.from({ length: 80 }, (_, index) => `new line ${index}`);
  newLines[40] = "The duty is 25 percent.";
  const next = newLines.join("\n");
  const hunks = diffLines(oldLines.join("\n"), next);
  const bounds = lineBounds(next);
  const line = bounds[40];
  assert.ok(line);
  const hunk = hunkForRange(hunks, line.start, line.end);
  assert.ok(hunk);
  assert.ok(hunk.rows.length > 40);
  const excerpt = excerptRows(hunk, bounds, line.start, line.end);
  assert.ok(excerpt.rows.length < 20);
  assert.equal(excerpt.truncated, true);
  assert.ok(excerpt.rows.some((row) => row.spans.some((span) => span.text.includes("25"))));
});

test("a quote lands on the hunk that contains it", () => {
  const next = "unchanged\nThe duty is 25 percent.\nalso unchanged\n";
  const hunks = diffLines("unchanged\nThe duty is 10 percent.\nalso unchanged\n", next);
  const bounds = lineBounds(next);
  const line = bounds[1];
  assert.ok(line);
  const hit = hunkForRange(hunks, line.start, line.end);
  assert.equal(hit?.id, hunks[0]?.id);
  assert.equal(hunkForRange(hunks, 0, 0), null);
});

test("stage 0 preview is a myers hunk, not a line bag", () => {
  const raw = diffSnapshots(
    "Section 2. The Department will investigate whether copper imports impair national security.\n",
    "Section 2. The duty on copper tube is 25 percent ad valorem, effective August 1, 2025.\n",
    "old.txt",
    "new.txt",
  );
  assert.equal(raw.exit, false);
  assert.match(raw.preview, /^\+/m);
  assert.match(raw.preview, /25 percent/);
  assert.equal(raw.preview.includes("Lines present only"), false);
  assert.match(previewFromHunks([]), /no differing lines/);
});
