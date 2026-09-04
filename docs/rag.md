# RAG Notes

The source under `rag/src/` is the official-run RAG fork. It is intentionally
separate from `retrieval/src/`, even where modules are identical.

## Bounded acquisition

The selected W5c policy starts with 12 documents, adds up to 10 unseen
documents per iteration, stops when sufficient or when the budget reaches 60
documents, and allows at most six iterations. The runner records query,
retrieval, judge, and answer state in a runtime output directory when executed
with approved services; those generated outputs are not bundled here.

## Sidecar contract

The external sidecar is expected to provide compatible interfaces for:

- `/rerank`: reorder a fixed list of candidate document IDs;
- `/passages`: return query-relevant excerpts for a document;
- `/sentence_evidence`: return evidence excerpts for cited sentences;
- `/llm`: optional bridge for a configured LLM provider in historical modes.

The exact sidecar version used for each official topic is not proven. This
repository therefore documents the contract and does not bundle the ambiguous
historical sidecar implementation.

## LLM roles and citations

The documented official runtime used `gpt-5.6-sol` for sufficiency/query,
answer generation, and verify/revise. Citation normalization and validation
are deterministic after generation, subject to the provider-produced answer.
Official output validation enforces metadata, references, citation, and word
count rules; it does not evaluate answer quality.
