# Agentic RAG Design

The source under rag/src/ is the official-run RAG fork and is intentionally
separate from retrieval/src/.

## Bounded evidence acquisition

The selected W5c policy starts with 12 documents, adds up to 10 unseen
documents per iteration, stops when sufficient or when the budget reaches 60
documents, and allows at most six iterations. The loop records query,
retrieval, sufficiency, and answer state when run with compatible services.

## Runtime contract

The external sidecar provides compatible interfaces for:

- /rerank: reorder candidate document IDs;
- /passages: return query-relevant excerpts;
- /sentence_evidence: return evidence for cited sentences;
- /llm: optional bridge for configured provider modes.

The downstream writer generates sentence-level citations. Verify/revise
normalizes and checks citations, and deterministic validation enforces
metadata, references, citation, and word-count rules.

## Model roles

The documented runtime used gpt-5.6-sol for sufficiency/query, answer
generation, and verify/revise. Checklist generation and development
evaluation use a separate gpt-oss-120b role. Provider responses and sidecar
behavior remain external runtime dependencies.
