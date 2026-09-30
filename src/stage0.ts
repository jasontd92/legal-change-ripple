import { createHash } from "node:crypto";
import { diffLines, previewFromHunks } from "./diff.js";
import { cosmetic, cpLength, normalize } from "./normalize.js";

export type RawChange = {
  exit: boolean;
  reason: string | null;
  old_file: string | null;
  new_file: string;
  old_sha256: string | null;
  new_sha256: string;
  old_chars: number | null;
  new_chars: number;
  preview: string;
};

/** Formatting-only exit: encoding (contract normaliser) or whitespace and HTML markup. */
export function diffSnapshots(oldText: string | null, newText: string, oldFile: string | null, newFile: string): RawChange {
  const next = normalize(newText);
  const prev = oldText === null ? null : normalize(oldText);
  const newHash = sha(next);
  const oldHash = prev === null ? null : sha(prev);
  const base = {
    old_file: oldFile,
    new_file: newFile,
    old_sha256: oldHash,
    new_sha256: newHash,
    old_chars: prev === null ? null : cpLength(prev),
    new_chars: cpLength(next),
  };
  if (prev !== null && prev === next) {
    return { ...base, exit: true, reason: "The snapshots match after encoding normalisation.", preview: "" };
  }
  if (prev !== null && cosmetic(prev) === cosmetic(next)) {
    return {
      ...base,
      exit: true,
      reason: "The snapshots match after whitespace and markup normalisation.",
      preview: "",
    };
  }
  return {
    ...base,
    exit: false,
    reason: null,
    preview: prev === null ? "First observation of this source. There is no previous snapshot." : previewFromHunks(diffLines(prev, next)),
  };
}

function sha(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}
