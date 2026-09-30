# Corpus build pipeline

Run from the repo root, in this order. LLM steps call `claude -p --model haiku` and are cached in `build/cache/` by prompt hash, so re-runs are free unless a prompt changes.

1. `python3 build/fetch/fetch.py`: fetch every source in `specs/sources.yaml` into `build/raw/` (raw originals are not committed)
2. `python3 build/fetch/assemble_triggers.py`: write `corpus/triggers/` and verify the expected phrases
3. `python3 build/transform/real.py`: adapt the real documents (`specs/plan_real.yaml`); uses the LLM for entity extraction and domain adaptation
4. `python3 build/transform/web_rewrite.py`: rewrite copyrighted web terms, including version chains; uses the LLM
5. `python3 build/generate/prose.py`: generate clause-heavy documents (`generate/specs_gen.py`); uses the LLM; planted clauses are inserted verbatim
6. `python3 build/transform/facts_fix.py`: enforce the party-facts sheet deterministically
7. `python3 build/transform/fixups.py`: deterministic post-fixes (price sheet, footnotes, residual-name scrub, cluster move)
8. `python3 build/generate/structured.py`: generate structured documents and signed template instances (no LLM)
9. `python3 build/validate/validate.py`: write the manifest, SOURCES and INDEX, and run all checks (exits 1 on any failure)

Status at any as-of date: `python3 corpus/status_at.py [YYYY-MM-DD] [--counts]`. The status fields in `manifest.jsonl` are computed at the profile's as-of date from `build/specs/terms.yaml` and document version families.
Derived trigger scope notes (for image-only annexes) live in `build/specs/derived/` and are copied into `corpus/triggers/` by `assemble_triggers.py`.
