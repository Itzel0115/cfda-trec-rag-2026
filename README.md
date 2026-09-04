# CFDA TREC RAG 2026

A multi-stage Retrieval and Agentic RAG system developed for the TREC RAG 2026
track. The project combines query expansion, multi-route retrieval, weighted
ranking fusion, cross-encoder and dense reranking, dynamic-depth
finalization, and bounded iterative evidence acquisition.

[Technical Report](report/main.pdf) · [Architecture](docs/architecture.md) ·
[Retrieval](docs/retrieval.md) · [Agentic RAG](docs/rag.md) ·
[Reproducibility](REPRODUCIBILITY.md)

## Project at a Glance

| Component | Design |
|---|---|
| Retrieval | Original narrative + Query2Doc + facet routes |
| Fusion | Weighted reciprocal-rank fusion, k=60 |
| Reranking | Protected top-100 head with BM25, cross-encoder, and dense signals; Deep-CE tail |
| Finalization | Rank-1-anchored variable depth, tau=0.20, max depth 5,000 |
| Agentic RAG | Iterative evidence acquisition with sufficiency and follow-up-query decisions |
| Evidence budget | 12 initial documents, up to 10 new documents per iteration, 60-document cap |
| Validation | Citation, answer-schema, rank-continuity, and output-format checks |
| Deliverable | Retrieval system, RAG system, and 14-page technical report |

## Motivation

TREC RAG narratives ask for evidence across multiple aspects of a complex
information need. A single lexical retrieval pass can miss terminology,
facets, or useful documents buried deeper in the candidate pool. This system
therefore combines complementary retrieval routes and reranking signals, then
uses a bounded RAG loop to acquire additional evidence before generating and
validating a cited answer.

## System Overview

### Retrieval Pipeline

~~~text
Narrative
  → Query2Doc / facet queries
  → BM25 retrieval
  → weighted RRF
  → dense + cross-encoder head fusion
  → Deep-CE tail reranking
  → rank-1-anchored variable-depth finalization
~~~

### Agentic RAG Pipeline

~~~text
Narrative
  → BM25 seed retrieval
  → reranking / passage selection
  → sufficiency decision
  → follow-up retrieval of unseen evidence
  → bounded iterative acquisition
  → evidence-constrained generation
  → citation verification / revision
  → schema validation
~~~

The two source products remain separate because the official RAG fork has
different orchestration, prompts, model construction, and runtime contracts.
See the [detailed architecture](docs/architecture.md).

## Retrieval Design

The Retrieval pipeline preserves the original narrative as an anchor while
adding Query2Doc and facet-oriented routes. BM25 candidate lists are combined
with weighted reciprocal-rank fusion (k=60). A protected head is then
reranked using BM25, cross-encoder, and dense signals; this concentrates
higher-precision processing where it has the most leverage.

Deep-CE reorders a deeper prefix without changing candidate membership, while
the original pool tail is preserved. Final output depth is computed from the
original pool score using a rank-1 anchor and relative threshold tau=0.20,
with a configurable ceiling of 5,000 documents. The finalizer serializes
variable-depth TREC runs deterministically for supplied inputs.

Details and configuration are in [docs/retrieval.md](docs/retrieval.md).

## Agentic RAG Design

The selected bounded acquisition policy starts with 12 documents, adds up to
10 unseen documents per iteration, caps evidence acquisition at 60 documents,
and allows at most six iterations. Each loop retrieves, assesses sufficiency,
forms a targeted follow-up query when needed, acquires and reranks new
evidence, and either continues or stops.

The downstream path extracts passages and evidence, generates an answer with
sentence-level citations, verifies and revises citations, and applies
deterministic final schema checks. The documented runtime used gpt-5.6-sol
for sufficiency/query, writing, and verify/revise roles; external services are
configured at runtime. See [docs/rag.md](docs/rag.md).

## Engineering / Research Highlights

- Multi-route query construction exposes both generated vocabulary and
  separately searchable requirements.
- Protected-head fusion separates high-precision ranking from deep-tail
  processing while preserving the candidate pool.
- Rank-1-anchored variable depth adapts the submitted prefix to topic-level
  score structure instead of padding every topic to a fixed depth.
- Bounded evidence acquisition makes the Agentic RAG loop explicit and
  testable under a finite document and iteration budget.
- Deterministic finalization and schema validation turn model-produced
  answers and retrieval outputs into contract-checked deliverables.
- Separate Retrieval and RAG forks preserve task-specific behavior while
  keeping their interfaces and boundaries inspectable.

## Selected Results

The following are diagnostics on the 22-topic development set, not official
organizer effectiveness scores.

| Result | Value |
|---|---:|
| Selected Retrieval: pool Recall@1000 after Deep-CE | 0.3159 |
| Selected Retrieval: Recall@submitted-k | 0.2343 |
| Variable-depth Retrieval: mean submitted depth | 601.45 |
| Variable-depth Retrieval: P@10 | 0.9076 |
| Selected bounded 60-document RAG: all-nugget score | 0.5298 |
| Selected bounded 60-document RAG: Full Support | 97.0% |

The report also documents a close comparison between stored RAG variants:
the 60-document deep-reading configuration reaches all-nugget score 0.5485,
while the selected bounded configuration reaches stronger Full Support
(97.0% versus 95.0%). These are descriptive development comparisons, not a
controlled causal ablation. No organizer-returned official effectiveness
score was available in the report; official-run structural statistics are
reported separately there.

## Technical Report

The [CFDA TREC RAG 2026 Technical Report](report/main.pdf) is the canonical
14-page project report. It covers the system design, experimental protocol,
retrieval and RAG results, ablations and failure analysis, and reproducibility
boundaries. The accompanying LaTeX source is available under report/.

## My Contributions

- I focused on retrieval-side experimentation and validation.
- I investigated ranking and retrieval variants around the integrated system.
- I led technical and reproducibility validation and final deliverable
  preparation.
- I led the drafting, iteration, and finalization of the technical report.

This project was developed collaboratively within the CFDA TREC RAG 2026
team. See [ATTRIBUTION.md](ATTRIBUTION.md) for project and third-party
attribution.

## Repository Structure

~~~text
.
├── retrieval/      # Retrieval implementation, policies, and finalizers
├── rag/            # Agentic RAG implementation and runtime tooling
├── evaluation/     # Output-format and deterministic validation utilities
├── examples/       # Synthetic input/output format examples
├── docs/           # Architecture and implementation notes
├── report/         # Canonical technical report and LaTeX source
├── ATTRIBUTION.md
├── README.md
├── REPRODUCIBILITY.md
└── requirements-deepce.txt
~~~

## Data & Reproducibility

Competition datasets, official test topics, qrels, nuggets, and submission
artifacts are not distributed here. The repository focuses on the system
implementation, configuration, validation tooling, synthetic examples, and
technical report. Deterministic transformations can be run with supplied
inputs; end-to-end reproduction additionally depends on external retrieval
indexes, sidecar services, model assets, and provider credentials. See
[REPRODUCIBILITY.md](REPRODUCIBILITY.md) for interfaces and limitations.

## Setup

~~~bash
(cd retrieval && npm ci)
(cd rag && npm ci)
python3 evaluation/validators/test_apply_deep_cut.py
~~~

The optional Deep-CE utility uses the scoped dependencies in
requirements-deepce.txt. Runtime service variables are documented in
.env.example; values must be supplied through the environment.
