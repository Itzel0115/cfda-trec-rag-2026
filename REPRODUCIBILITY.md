# Reproducibility

## Preserved implementation

The repository includes the selected Retrieval policy chain, the distinct
official-run RAG fork, example configurations, Node lockfiles, deterministic
finalization and validation tools, documentation, and synthetic format
fixtures.

## Reproduction levels

1. **Architecture:** the complete system flow is described in
   docs/architecture.md, docs/retrieval.md, and docs/rag.md.
2. **Deterministic local processing:** supplied candidate pools and outputs can
   be processed with retrieval/tools/merge_deep_tail.py,
   retrieval/tools/apply_deep_cut.py, retrieval/tools/finalize_submissions.py,
   and the validators.
3. **External runtime:** Retrieval requires a compatible Pyserini/ClimbMix
   index service; RAG additionally requires a compatible sidecar, model
   assets, provider service, and credentials.
4. **Historical competition run:** exact end-to-end reproduction is not
   guaranteed because provider, index, sidecar, and producer versions were not
   frozen as a single executable environment.

## Configuration and interfaces

retrieval/configs/vfs.example.json records the selected VFs values, including
RRF k=60, Query2Doc, facet retrieval, protected head depth 100, three-signal
head fusion, tau=0.20, and maximum output depth 5,000.

rag/configs/w5c.example.json records the bounded acquisition policy: 12
initial documents, up to 10 new documents per iteration, 60-document maximum,
six-iteration maximum, passage/evidence processing, citation verification,
and output validation.

Topic input is a two-column TSV containing an identifier and narrative.
Retrieval output is a six-column TREC-style run. RAG output is JSONL with
metadata, references, and sentence-level answer objects. Synthetic examples
under examples/ demonstrate these shapes.

## Known limitations

External indexes, model assets, sidecar behavior, and LLM provider responses
are not locally frozen. The Retrieval and RAG source trees are intentionally
distinct, and the exact historical sidecar and Deep-CE producer versions are
not fully established. The report's effectiveness numbers are development
diagnostics; official-run structural statistics are separate.
