# System Architecture

The project contains two related products with separate source trees:
Retrieval produces ranked TREC runs, while Agentic RAG acquires evidence and
produces validated cited answers.

## Retrieval

~~~mermaid
flowchart TD
  T[Topic narrative] --> Q[Original / Query2Doc / facet queries]
  Q --> B[BM25 routes via external Pyserini]
  B --> F[Weighted RRF, k=60]
  F --> H[Protected top-100 CE + dense head fusion]
  H --> D[Deep-CE tail reranking]
  D --> K[Variable depth: tau 0.20, rank-1 anchor]
  K --> V[Deterministic TREC validation/finalization]
~~~

BM25 routes establish candidate membership. Rerankers reorder a fixed
candidate set. The deep prefix is merged with the original pool tail before
the rank-1-anchored variable-depth serializer is applied. Development and
official maximum depths are 1,000 and 5,000 respectively.

## Agentic RAG

~~~mermaid
flowchart TD
  T[Topic narrative] --> S[BM25-seeded retrieval]
  S --> A[Bounded acquisition: initial 12]
  A --> X[Sidecar rerank / passages / checklist]
  X --> J[Sufficiency and follow-up query decision]
  J -->|more evidence| R[Retrieve up to +10 unseen]
  R --> X
  J -->|enough or cap| E[Dense evidence context]
  E --> W[Answer writer]
  W --> C[Verify/revise citations]
  C --> O[Output-schema validation]
~~~

The selected limits are 12 initial documents, up to 10 new documents per
iteration, 60 documents total, and at most six iterations. Runtime
sufficiency/query, writing, and verify/revise roles used gpt-5.6-sol in the
documented configuration. Checklist generation and development evaluation
are separate model roles.

## Source boundary

retrieval/src/ and rag/src/ remain separate because their prompts,
orchestration, LLM construction, and runtime contracts differ.
