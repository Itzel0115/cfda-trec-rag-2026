# CFDA TREC RAG 2026

## Overview

This repository is a sanitized archival version of the final system developed
by the CFDA TREC RAG 2026 team. The project explored Retrieval and
Retrieval-Augmented Generation (RAG) for the TREC RAG 2026 task: retrieve
useful documents for a narrative and, for the RAG task, produce cited
evidence-grounded answers.

This is a personal archival/portfolio copy of team work. It does not imply
sole authorship or ownership of every component.

## Repository Scope

The staging repository preserves the selected architecture, source modules,
configuration examples, deterministic finalization/validation utilities, and
synthetic format fixtures. It intentionally excludes:

- official TREC test topics and other TREC-provided data;
- qrels and nuggets;
- generated official checklists and submissions;
- candidate pools, run traces, and internal logs;
- model checkpoints and caches;
- credentials, private server paths, and internal review material.

The excluded materials remain outside this staging tree for archival or human
review purposes.

## Final System

The final team system consists of two related but distinct source products.

### Retrieval

```text
topics → Query2Doc/facet queries → BM25 routes → weighted RRF
       → top-100 CE/dense head fusion → deep-tail CE
       → rank-1-anchored variable-depth finalization → TREC run
```

The selected policy is VFs. The source is preserved separately under
`retrieval/`.

### RAG

```text
topics → BM25-seeded acquisition → sidecar rerank/passages/checklist
       → iterative sufficiency/query decisions
       → initial 12, +10 unseen, cap 60, max 6 iterations
       → dense evidence → answer generation
       → citation verification/revision → schema validation → JSONL
```

The official-run RAG fork is preserved separately under `rag/`. It must not be
naively merged with `retrieval/src/`: the two source trees intentionally differ
in orchestration, prompts, LLM construction, and related contracts.

## Retrieval Architecture

VFs combines original narrative and Query2Doc/facet routes over an external
Pyserini ClimbMix index. Candidate routes use weighted reciprocal-rank fusion
with `k=60`. The head is protected and fused with BM25, cross-encoder, and
dense signals. Deep CE can reorder the tail while preserving the original
candidate membership. `apply_deep_cut.py` computes variable output depth from
the original pool score, using `tau=0.20`, a rank-1 anchor, minimum 4, and an
official maximum of 5,000.

## RAG Architecture

W5c uses the separate `rag/src/` fork. It starts with a BM25 seed, uses a
sidecar for reranking and passage/evidence operations, and iteratively decides
whether more evidence is needed. The selected policy is bounded at 12 initial
documents, up to 10 new unseen documents per iteration, 60 documents total,
and six iterations. Runtime generation and verification used
`gpt-5.6-sol`; the provider snapshot is not included.

## Repository Structure

- `retrieval/`: Retrieval-side source, VFs policy chain, finalization tools,
  Node manifests, and portable launcher.
- `rag/`: official RAG fork source, tests, Node manifests, and example launcher.
- `evaluation/validators/`: official-shape checker and deterministic tests;
  no competition outputs are bundled.
- `docs/`: architecture, Retrieval/RAG behavior, portability, and migration
  notes.
- `examples/`: invented topic and output format examples only.
- `report/`: canonical final technical report and sanitized LaTeX source.
- `requirements-deepce.txt`: scoped Python requirements for optional deep CE;
  it is not a complete environment lock.

## External Dependencies

Fresh execution requires user-provided access to an approved Pyserini/ClimbMix
service, an approved sidecar implementing the documented HTTP contract, and
approved LLM/model services. Optional local cross-encoder and dense components
may require model downloads and caches. Credentials must be supplied through
environment variables; no credentials are stored here.

## Setup

Node dependencies are specified separately:

```bash
(cd retrieval && npm ci)
(cd rag && npm ci)
```

Python dependencies for the optional deep CE utility are listed in
`requirements-deepce.txt`. The historical sidecar dependency tree is not
included, and its complete environment was not reproducibly pinned.

## Running

Use only approved external data and services. The example commands do not
provision data or call services by themselves:

```bash
POOL=/path/to/approved/candidate_pool.trec \
DEEP=/path/to/approved/deep_pool.trec \
retrieval/scripts/finalize_retrieval.sh
```

For RAG, supply `TOPICS`, `CHECKLIST`, `QRELS_DIR`, `SIDECAR_URL`,
`PYSERINI_API_URL`, and `OPENAI_API_KEY`, then review
`rag/scripts/run_w5c.example.sh`. Do not use it against official test data
without team and organizer approval.

## Validation

`evaluation/validators/official_format_check.py` implements the retained
official-shape checks. The deterministic cutoff test can run with Python
standard library only:

```bash
python3 evaluation/validators/test_apply_deep_cut.py
```

TypeScript checks require dependencies to be installed locally; installation
is intentionally not performed by this staging build.

## Reproducibility

The repository preserves architecture and deterministic local transformations.
It does not guarantee byte-identical end-to-end competition reproduction.
Retrieval depends on external index/model versions and the RAG path depends on
provider state, sidecar behavior, and credentials. The original sidecar and
deep-CE producer provenance is incomplete, and some finalization steps were
reconstructed after the competition run.

See `REPRODUCIBILITY.md` and `docs/portability.md` for the boundaries.

## Technical Report

The frozen final technical report for the team project is available here:
[Final Technical Report](report/main.pdf). Sanitized LaTeX source is available
under `report/` for structural inspection.

## Data

Competition topics, qrels, nuggets, official checklists, submissions, and run
artifacts are intentionally excluded. The files under `examples/` are
synthetic and are not copied TREC records.

## Limitations

- Provider/model snapshots are not frozen locally.
- Exact historical sidecar provenance is incomplete.
- Deep CE historical producer provenance is incomplete.
- The original competition finalization path was partially reconstructed.
- Official output and official organizer scores are not bundled.

## Attribution

This is team work with multiple contributors and third-party dependencies.
See `ATTRIBUTION.md`. No contribution percentages are inferred.

## License

No project-wide license is provided in this archival repository pending
confirmation of team and third-party licensing.
