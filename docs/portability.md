# Portability Notes

This staging tree was built positively from an allowlist. It contains no
official data, run artifacts, caches, snapshots, specification snapshot,
submissions, or internal handoff files.

Runtime paths are supplied through CLI arguments or environment variables.
The portable launcher scripts do not source an internal `.env.local`, assume a
server-specific Python executable, or embed historical server paths.
`.env.example` contains variable names only.

Important variables include `OPENAI_API_KEY`, `NCHC_API_KEY`,
`PYSERINI_API_TOKEN`, `PYSERINI_API_URL`, `SIDECAR_URL`, `MODEL_NAME`,
`TRANSFORMERS_CACHE`, and `DOC_CACHE_DIR`. Values must be injected out of
band. External services and model caches are intentionally not provisioned by
this repository.

The Node source trees retain separate package manifests and lockfiles. The
optional Python deep-CE utility has pinned Torch/Transformers versions, but
the historical sidecar environment is not fully pinned.
