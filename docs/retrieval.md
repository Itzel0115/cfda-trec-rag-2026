# Retrieval Design

## VFs policy chain

VFs is the selected Retrieval policy. Its wrapper inherits the required
VFs -> VF -> V2 -> V1 -> V0 chain under retrieval/versions/; this is a
structural dependency, not a claim that every historical policy was selected.

## Stages

- Original narrative, Query2Doc, and facet routes produce BM25 candidates
  through an external Pyserini/ClimbMix service.
- Weighted RRF combines routes with k=60 and the configured route weights.
- A protected top-100 head is fused with cross-encoder and dense signals.
- Deep-CE reorders the tail while retaining candidate membership.
- merge_deep_tail.py appends the original pool tail after the deep prefix.
- apply_deep_cut.py derives variable depth from the original pool score,
  using tau=0.20, a rank-1 anchor, minimum 4, and configurable maximum.

The finalization tools are deterministic for supplied input pools. Retrieval
quality and Deep-CE behavior depend on the external index and model assets.
