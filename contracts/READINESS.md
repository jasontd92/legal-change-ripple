# Readiness Gates

Flipped by the **system implementation** (`README.md` §6). Each entry
records the date, contract version, and the run id that passed the gate's
contract tests.

| Gate | Status | Date | Contract version | Evidence (run id / sign-off) |
|---|---|---|---|---|
| G0 Contract frozen | **System-side frozen, awaiting eval sign-off.** Schemas, enums, id rules, and the normaliser spec are unchanged at 0.1.0 | 2026-09-29 | 0.1.0 | TS normaliser matches `contracts/normalize/test_vectors.json` 6/6, and the Python reference prints no FAIL. Stub pipeline artifacts validate against the schemas. Eval still signs the freeze. |
| G1 Unit-ready | not started | – | – | – |
| G2 E2E-ready | not started | – | – | – |
| G3 Full readiness | not started | – | – | – |
