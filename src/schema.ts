import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { Ajv, type ErrorObject, type ValidateFunction } from "ajv";
import addFormats from "ajv-formats";

const applyFormats = addFormats as unknown as (instance: Ajv) => Ajv;
import { findRepo } from "./paths.js";

let validators: Map<string, ValidateFunction> | null = null;

function ajv(): Map<string, ValidateFunction> {
  if (validators) return validators;
  const repo = findRepo();
  const dir = path.join(repo, "contracts", "schemas");
  const compiler = new Ajv({ allErrors: true, strict: false });
  applyFormats(compiler);
  const files = readdirSync(dir).filter((f) => f.endsWith(".schema.json"));
  for (const file of files) {
    const schema = JSON.parse(readFileSync(path.join(dir, file), "utf8")) as Record<string, unknown>;
    delete schema.$id;
    delete schema.$schema;
    compiler.addSchema(schema, file);
  }
  validators = new Map(files.map((file) => [file, compiler.getSchema(file) as ValidateFunction]));
  return validators;
}

export function validateArtifact(schemaFile: string, data: unknown): string[] {
  const validate = ajv().get(schemaFile);
  if (!validate) throw new Error(`Unknown schema ${schemaFile}`);
  if (validate(data)) return [];
  return (validate.errors ?? []).map(formatError);
}

export function assertArtifact(schemaFile: string, data: unknown): void {
  const errors = validateArtifact(schemaFile, data);
  if (errors.length) {
    throw new Error(`${schemaFile} rejected the artifact:\n${errors.join("\n")}`);
  }
}

function formatError(err: ErrorObject): string {
  const where = err.instancePath || "/";
  return `${where} ${err.message ?? "invalid"}${err.params ? ` ${JSON.stringify(err.params)}` : ""}`;
}
