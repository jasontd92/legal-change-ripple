import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function findRepo(start?: string): string {
  const starts = [start, process.cwd(), path.dirname(fileURLToPath(import.meta.url))].filter(
    (v): v is string => Boolean(v),
  );
  for (const seed of starts) {
    let dir = path.resolve(seed);
    for (;;) {
      if (existsSync(path.join(dir, "contracts", "VERSION")) && existsSync(path.join(dir, "system-design.md"))) {
        return dir;
      }
      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  }
  throw new Error("Could not find the repo root (contracts/VERSION). Run harness from the project directory.");
}

export function contractVersion(repo: string): string {
  return readFileSync(path.join(repo, "contracts", "VERSION"), "utf8").trim();
}

export function writeJson(file: string, value: unknown): void {
  mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(value, null, 2)}\n`);
  renameSync(tmp, file);
}

export function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(file, "utf8")) as T;
}

export function findingName(stackId: string): string {
  return `${stackId.replaceAll("/", "__")}.json`;
}

export function findingPath(runDir: string, stackId: string): string {
  return path.join(runDir, "findings", findingName(stackId));
}

export function repoRelative(repo: string, absOrRel: string): string {
  const abs = path.isAbsolute(absOrRel) ? absOrRel : path.join(repo, absOrRel);
  return path.relative(repo, abs).split(path.sep).join("/");
}

export function absFromRepo(repo: string, rel: string): string {
  return path.join(repo, rel);
}

/** documents/... under the corpus root, as a repo-relative path. */
export function docRepoPath(corpusRoot: string, manifestPath: string): string {
  return `${corpusRoot.replace(/\/$/, "")}/${manifestPath.replace(/^\//, "")}`.replaceAll("//", "/");
}
