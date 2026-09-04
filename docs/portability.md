# Portability

Runtime paths are supplied through command-line arguments or environment
variables. The launchers do not depend on server-specific Python executables
or internal environment files; .env.example lists variable names only.

External retrieval, sidecar, model, and LLM services are configured out of
band. Common variables include OPENAI_API_KEY, NCHC_API_KEY,
PYSERINI_API_TOKEN, PYSERINI_API_URL, SIDECAR_URL, MODEL_NAME,
TRANSFORMERS_CACHE, and DOC_CACHE_DIR.

The Retrieval and RAG trees retain separate package manifests and lockfiles.
The optional Deep-CE utility has scoped Python requirements; the historical
sidecar environment is not represented by a complete lockfile.
