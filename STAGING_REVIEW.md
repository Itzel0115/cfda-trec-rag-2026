# CFDA TREC RAG 2026 — Sanitized Staging Review

## 1. Status

PASS-WITH-WARNINGS. The staging tree contains the canonical final report and
still contains no competition data, credentials, external symlinks, or
internal absolute paths. Team permission for personal archival use is now
confirmed. Public release remains subject to licensing, data-term, sidecar,
and external model/provider review.

## 2. Staging Repository Statistics

Before report migration the staging tree was 670,668 regular-file bytes across
95 files. After migration it contains 123 regular files, 39 directories
including the root, and zero symlinks, totaling 1,189,161 regular-file bytes.
The report directory contributes 493,931 bytes across 27 files. The tree
remains intentionally source-and-documentation scale rather than
delivery-bundle scale.

## 3. Included Components

The staging tree includes the active Retrieval source, the separate official
RAG fork, the minimum VFs policy dependency chain, separate Node manifests and
locks, deterministic finalization utilities, local validators, portable wrapper
scripts, sanitized example configurations, synthetic format examples, and
newly written architecture/portability/reproducibility documentation.
It also includes the canonical final report PDF and the minimum coherent
LaTeX source package required to inspect or compile it.

## 4. Excluded Components

The tree excludes `artifacts/`, official data, qrels, nuggets, checklists,
candidate pools, submissions, run traces, snapshots, specs, experiments,
weekly materials, internal handoff documents, review notes, model caches,
checkpoints, report-production bundles, source ZIPs, prior report versions, and credentials. No original
bundle manifest was copied.

## 5. Retrieval Architecture

The selected VFs path is represented as topics → Query2Doc/facet query routes →
BM25 service retrieval → weighted RRF (`k=60`, anchor/follow-up weights from
the selected policy) → protected top-100 CE/dense/BM25 head fusion → deep-tail
CE handling → rank-1 anchored variable-depth finalization → local validation.
The source remains under `retrieval/src/`, with VFs and its required V0–V2/VF
imports under `retrieval/versions/`.

## 6. RAG Architecture

The selected W5c path is represented as topics → BM25-seeded bounded acquisition
→ external sidecar rerank/passages/evidence interfaces → iterative sufficiency
and follow-up decisions → initial 12, +10, cap 60, max 6 → dense evidence and
answer generation → citation verification/revision → official schema
validation. The authoritative source remains the separate `rag/src/` fork.

## 7. Source Migration Summary

`SOURCE_MIGRATION_MAP.tsv` records every regular staging file, including the
report source. Active source,
policy dependencies, tests, and deterministic tools are exact copies unless
listed as sanitized. Sanitized files are wrappers/configs or path-only test
adjustments. Two pilot-only RAG controller modules were omitted because they
were not part of the selected final runtime.

## 8. Portability Changes

Launchers derive paths from their own staging location and require explicit
inputs or environment variables. Original environment-file sourcing,
server-specific defaults, and internal filesystem paths were removed from
staging wrappers. No staging symlink points outside the repository.

## 9. Configuration Sanitization

`retrieval/configs/vfs.example.json` and `rag/configs/w5c.example.json` are
new examples reconstructed from source/audit evidence. They preserve selected
algorithmic policy values while using placeholders for topics, data, services,
indexes, and model assets. They are not original competition configs.

## 10. Synthetic Fixtures

The two example topics, two retrieval rows, and two RAG JSONL records are
fictional. They contain no official topic IDs or text. The retained Python
format validator accepts the synthetic retrieval and RAG examples; it emits
only the expected fixed-depth warning for the illustrative retrieval output.

## 11. Dependency Status

Separate Retrieval and RAG `package.json`, lockfile, and TypeScript config
boundaries are retained. Python requirements are limited to the deep-CE
utility requirements file. Node dependencies were not installed and
`node_modules/` is absent, so TypeScript checking was skipped. Runtime still
requires external retrieval/index services, sidecar services, LLM providers,
and model assets.

## 12. Secret Scan

No assigned secret values or credential files were found. Environment variable
names and token lookups remain where required by the runtime contract; the
included `.env.example` contains empty placeholders only.

## 13. Internal Path Scan

The final staging scan found zero historical internal filesystem path
references. Public package-registry URLs in lockfiles and local loopback
sidecar defaults are not historical internal filesystem paths.

## 14. Competition Data Scan

No official topic records, qrels, nuggets, checklists, candidate pools,
submissions, or run traces were copied. DocID-shaped strings in synthetic
fixtures and validator regexes are format demonstrations, not competition
records.

## 15. Personal/Internal Information Scan

No private names, email addresses, phone numbers, review discussions, internal
hostnames, or administrative handoff files were copied. Team attribution is
described generically because exact contribution ownership requires confirmation.

## 16. Large File Scan

No staging file exceeds 1 MiB and there are no files above 5 MiB. Package locks
are the largest retained generated-looking files and remain useful dependency
metadata; model/data/run artifacts were excluded.

## 17. Symlink Scan

Zero symlinks and zero broken symlinks are present.

## 18. Static Validation Results

- Shell syntax checks: pass.
- Python AST syntax check: pass for all migrated Python files.
- Deterministic `apply_deep_cut` test: pass.
- Official-format validator unit tests: 6 pass.
- Synthetic Retrieval/RAG format validation: compliant; one expected warning.
- JSON/JSONL parsing: pass.
- Report dependency trace: all 23 recursively reachable local source files
  resolved; no unresolved local report dependency.
- Report PDF hash: 346,559-byte archive and staging hashes match exactly
  (`14967a6dbb52590d9e12f2282ee32b3e5a69ac8be467069a700ef2f83d60741e`).
- Report compile smoke test: pass in a temporary directory; generated output
  was 14 pages and was not used to replace the frozen PDF.
- Freeze checksum list: generated and verified for all other regular staging
  files; generated-manifest self-reference is explicitly excluded.
- TypeScript static check: skipped because dependencies were not locally available;
  no installation was attempted.

## 19. Algorithmic Integrity Check

No intentional ranking, fusion, query, iteration, citation, validation, cutoff,
output-schema, or model-role algorithm changes were made. Changes are limited
to approved path/configuration portability, staging import/test path layout,
omission of non-final pilot modules, and new documentation/examples.

## 20. Reproducibility Limitations

The tree supports architecture inspection and deterministic local
transformation/validation. Exact external retrieval/model reproduction and
byte-identical official-run reproduction are not guaranteed because corpus
indexes, provider snapshots, model checkpoints, historical sidecar state, and
some competition inputs are not included.

## 21. Attribution / License Limitations

`ATTRIBUTION.md` records team-work and preserves report authorship without
guessing contribution ownership or licenses. The retained ACL style and
bibliography files remain third-party support assets with their original
headers. No project-wide license was added. Third-party code/model terms,
report-style terms, and data redistribution terms must be confirmed before any
public visibility.

## 22. Human Review Remaining

Remaining review covers TREC/ClimbMix data and output terms, sidecar
provenance, deep-CE/model terms, package and report-source licensing, provider
naming, and whether any source module should be retained only in a private
archive rather than considered for public release.

## 23. GitHub Readiness

READY-WITH-HUMAN-REVIEW for private Git initialization after the team permission
confirmation. Public release remains not approved pending the review items
above. Git was not initialized here.

## 24. Recommended Next Step

Have the team review `ATTRIBUTION.md`, `REPRODUCIBILITY.md`, the source
migration map, external-service/model wording, and competition-data exclusions.
Only after approval should a later phase perform any final source restructuring
or local Git initialization.
