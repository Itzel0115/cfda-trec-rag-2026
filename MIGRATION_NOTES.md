# Migration Notes

This staging tree was built positively from an allowlist. It is a sanitized
archival representation of the final CFDA TREC RAG 2026 team system, not a
copy of the original delivery bundle.

## Included

- `retrieval/src/` and the minimum `V0`–`VFs` policy chain required by the
  selected VFs implementation.
- `rag/src/` from the official RAG fork, excluding two pilot-only controller
  modules.
- Separate Node manifests, tests, deterministic finalization utilities, and
  local format validators.
- Portable launch/finalization wrappers, example configurations, synthetic
  format fixtures, and newly written architecture/reproducibility documents.

## Intentionally excluded

Competition data, qrels, nuggets, checklists, candidate pools, submissions,
run traces, generated artifacts, model caches/checkpoints, snapshots,
experiments, weekly materials, internal handoff documents, organizer specs,
review notes, credentials, and the generated technical-report PDF are not
included. The stale original bundle manifest is also not included.

## Source migration map

Most migrated source is an exact copy. The following files are sanitized copies:

| Original repository path | Staging path | Modification | Notes |
| --- | --- | --- | --- |
| `code/scripts/finalize_retrieval.sh` | `retrieval/scripts/finalize_retrieval.sh` | PATH-ONLY / CONFIGURATION-ONLY | Repository-relative tool paths; explicit input environment variables; no internal defaults. |
| `code/rag/scripts/w5c_official119.sh` | `rag/scripts/run_w5c.example.sh` | PATH-ONLY / CONFIGURATION-ONLY | Portable example launcher; official topic/checklist defaults and environment-file sourcing removed. |
| `code/scripts/validate_submission.sh` | `evaluation/validators/validate_submission.sh` | PATH-ONLY / CONFIGURATION-ONLY | Requires explicit input arguments. |
| `code/scripts/check_golden_artifacts.sh` | `evaluation/validators/check_golden_artifacts.sh` | PATH-ONLY / CONFIGURATION-ONLY | Requires explicit local arguments; no bundled golden/submission data. |
| `code/tools/deep_ce_rerank.py` | `retrieval/tools/deep_ce_rerank.py` | DOCUMENTATION-ONLY | Removed hard-coded server Python path from usage text; model remains external. |
| `code/package.json` | `retrieval/package.json` | CONFIGURATION-ONLY | Retained Retrieval-local scripts and removed cross-tree delivery scripts. |
| `code/tsconfig.json` | `retrieval/tsconfig.json` | CONFIGURATION-ONLY | Scope narrowed to the Retrieval source, versions, and tests. |
| `code/tools/tests/test_official_format_check.py` | `evaluation/validators/test_official_format_check.py` | PATH-ONLY | Test paths point to the staging validator/source layout. |
| `code/src/llm/config.ts` | `retrieval/src/llm/config.ts` | CONFIGURATION-ONLY | NCHC service URL is now required from runtime configuration. |
| `code/src/trec-rag-2026/retrieval/dense_rerank.ts` | `retrieval/src/trec-rag-2026/retrieval/dense_rerank.ts` | CONFIGURATION-ONLY | NCHC base URL default removed; environment configuration is authoritative. |
| `code/src/trec-rag-2026/agentic-rag/citation_reattribute.ts` | `retrieval/src/trec-rag-2026/agentic-rag/citation_reattribute.ts` | CONFIGURATION-ONLY | NCHC base URL default removed; environment configuration is authoritative. |
| `code/rag/src/llm/config.ts` | `rag/src/llm/config.ts` | CONFIGURATION-ONLY | NCHC service URL is now required from runtime configuration. |

No algorithmic change was intentionally made. The source migration map records
every regular migrated file and marks newly authored docs/configs/examples as
`NEW-DOC` or `NEW-EXAMPLE`.

## Portability and configuration

Internal absolute paths and original environment-file sourcing were removed
from staging launchers. Service URLs, tokens, indexes, model identifiers, and
input paths are supplied through arguments, environment variables, or example
configuration placeholders. No secret values were copied.

## Open questions

Sidecar implementation provenance, exact historical deep-CE model/provider
state, competition-data redistribution terms, third-party licenses, and team
authorship wording require human confirmation. The staging tree therefore
does not claim exact byte-identical official-run reproduction or a project-wide
license.

## Technical Report Migration

The canonical report was selected from the immutable archive's `report/`
directory using its `README.md`, `main.tex`, section structure, and final
`main.pdf`. The older initial report, snapshot report copies, Overleaf ZIP,
review notes, cleanup/provenance manifests, and generated LaTeX products were
excluded.

The frozen final PDF is included as `report/main.pdf` and remains byte-identical
to the archive artifact. The included report source consists of `main.tex`,
all recursively required sections, tables, figures, appendices,
`references.bib`, and the distributed `acl.sty`/`acl_natbib.bst` support files.
No report-source path sanitization was necessary: the copied source contained
no historical internal filesystem paths or private service endpoints. Included
report source files are recorded as `EXACT`.

The source compiled successfully in a temporary directory with the locally
available LaTeX toolchain and produced a 14-page PDF. That generated PDF was
not substituted for the frozen artifact; environment-dependent PDF bytes
remain a known distinction. Report reproduction is separate from reproduction
of experiments using excluded competition data and external services.

`STAGING_FREEZE_SHA256SUMS.txt` is generated as the deterministic local freeze
list after all staging edits. To avoid a self-referential checksum cycle, it
excludes itself and the generated `STAGING_MANIFEST.tsv`; the manifest records
the freeze file separately.
