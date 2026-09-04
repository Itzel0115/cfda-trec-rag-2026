# Retrieval Notes

## VFs policy

VFs is the selected Retrieval policy chain. Its policy wrapper inherits the
minimum required chain `VFs -> VF -> V2 -> V1 -> V0` because those files encode
the policy inheritance used by the original TypeScript entrypoint. The files
are retained under `retrieval/versions/`; this is a structural dependency, not
a claim that every historical policy was selected.

## Retrieval stages

- Topic parsing accepts a two-column topic TSV.
- Original narrative, Query2Doc, and facet query routes produce BM25
  candidates through an external Pyserini/ClimbMix service.
- Weighted RRF uses `k=60`, with the documented anchor/follow-up weights.
- A protected top-100 head is fused with cross-encoder and dense signals.
- Deep CE can reorder the tail while retaining candidate membership.
- `merge_deep_tail.py` appends the original pool tail after the deep prefix.
- `apply_deep_cut.py` computes variable depth from the original pool score,
  using `tau=0.20`, the rank-1 score anchor, minimum 4, and configurable max.

## Important boundary

The deep CE model and provider/index state are external. The finalization tools
are deterministic given their input pools, but the historical producer and
submission-day command sequence were not fully preserved.
