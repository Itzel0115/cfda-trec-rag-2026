# Reproducibility Notes

## What is included

The staging repository includes the selected VFs policy chain, the distinct
official RAG source fork, portable finalization and validation tools, Node lock
files, an optional deep-CE requirements file, documentation, and synthetic
format examples.

## What is excluded

Official and development topics, qrels, nuggets, checklists, corpus/index
data, run pools, submissions, traces, model caches/checkpoints, credentials,
weekly materials, snapshots, and internal review documents are excluded.

## Reproduction levels

1. **Architecture reproduction:** supported by `docs/architecture.md`,
   `docs/retrieval.md`, and `docs/rag.md`.
2. **Deterministic local transformation/validation:** supported by
   `retrieval/tools/merge_deep_tail.py`, `retrieval/tools/apply_deep_cut.py`,
   `retrieval/tools/finalize_submissions.py`, and the format checker, when the
   user supplies approved inputs.
3. **External retrieval/model reproduction:** requires an approved Pyserini
   ClimbMix service, sidecar, model assets, and credentials.
4. **Exact competition-run reproduction:** not guaranteed and not claimed.

## Selected configuration

`retrieval/configs/vfs.example.json` records the selected algorithmic values:
RRF `k=60`, anchor weight 1, follow-up weight 0.25, Query2Doc enabled, head
depth 100, protected/splice head behavior, three-signal head fusion, facet
retrieval, `tau=0.20`, and official maximum output depth 5,000.

`rag/configs/w5c.example.json` records initial 12 documents, up to 10 new
documents per iteration, maximum 60 documents, maximum six iterations, dense
evidence settings, citation verification, and official-shape validation.
These are reconstructed example configurations, not copies of competition
runtime files.

## Input/output formats

The topic input is a two-column TSV containing a topic identifier and narrative.
Retrieval output is a six-column TREC-style run. RAG output is JSONL with
`metadata`, `references`, and sentence-level `answer` objects. Synthetic
examples under `examples/` demonstrate these shapes without real TREC records.

## Historical limitations

The final Retrieval and RAG source trees are intentionally distinct. The
official RAG fork has meaningful differences from the Retrieval-side source
tree and must not be merged casually. The sidecar source changed during the
official execution window; the exact per-topic sidecar version is not proven.
The deep-CE source also changed between development and official production.
The Retrieval finalizer and RAG heading repair replay were reconstructed after
submission and are not asserted to be the original scripts.

The external LLM and index provider snapshots are not locally frozen. A
temperature setting of zero does not make provider responses or service data
byte-identical across time. The original competition outputs are deliberately
not included.

## Technical report boundary

`report/main.pdf` is the frozen historical final report. Its accompanying
LaTeX source is included for inspection and possible future compilation. The
report package is separate from end-to-end system reproduction: it describes
experiments whose official datasets, qrels, nuggets, artifacts, services, and
provider snapshots are intentionally not bundled.
