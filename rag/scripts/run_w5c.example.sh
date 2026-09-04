#!/usr/bin/env bash
# Portable example launcher for the selected W5c bounded RAG policy.
# It performs no local data provisioning and is intentionally not an official
# test runner. Supply approved topics, checklist, services, and credentials.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RAG_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

: "${TOPICS:?Set TOPICS to an approved topic TSV}"
: "${CHECKLIST:?Set CHECKLIST to an approved generated checklist JSONL}"
: "${QRELS_DIR:?Set QRELS_DIR to an approved qrels directory}"
: "${SIDECAR_URL:?Set SIDECAR_URL to an approved sidecar endpoint}"
: "${PYSERINI_API_URL:?Set PYSERINI_API_URL to an approved Pyserini service}"
: "${OPENAI_API_KEY:?Set OPENAI_API_KEY in the environment; never place its value in files}"

OUT="${OUT:-$RAG_ROOT/out/w5c-example}"
npx --prefix "$RAG_ROOT" tsx "$RAG_ROOT/src/trec-rag-2026/agentic-rag/run_iterative_entry.ts" \
  --run-id w5c-example --output-dir "$OUT" --topics "$TOPICS" \
  --qrels-dir "$QRELS_DIR" --pyserini-base-url "$PYSERINI_API_URL" \
  --team-id example-team --resume --sidecar-url "$SIDECAR_URL" \
  --llm-provider openai_llm --llm-model "${MODEL_NAME:-gpt-5.6-sol}" \
  --layer-rerank --layer-passages --layer-checklist "$CHECKLIST" \
  --layer-verify --verify-mode weaken --answer-style dense \
  --initial-docs 12 --docs-per-iteration 10 --max-documents-read 60 \
  --max-iterations 6
