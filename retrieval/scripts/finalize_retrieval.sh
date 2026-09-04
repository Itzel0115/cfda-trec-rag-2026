#!/usr/bin/env bash
# Portable replay of the selected Retrieval finalization logic.
# This reconstructs frozen output transformations; it is not the original
# submission-day producer and requires user-supplied candidate pools.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RETRIEVAL_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PYTHON_BIN="${PYTHON_BIN:-python3}"
POOL="${POOL:?Set POOL to the original candidate pool file}"
DEEP="${DEEP:?Set DEEP to the deep-CE candidate pool file}"
OUT="${OUT:-$RETRIEVAL_ROOT/out/retrieval}"

[ -s "$POOL" ] || { echo "missing or empty POOL: $POOL" >&2; exit 2; }
[ -s "$DEEP" ] || { echo "missing or empty DEEP: $DEEP" >&2; exit 2; }
mkdir -p "$OUT"

MERGED="$OUT/.deep_merged.trec"
"$PYTHON_BIN" "$RETRIEVAL_ROOT/tools/merge_deep_tail.py" "$POOL" "$DEEP" --out "$MERGED"

emit() {
  local tag="$1" order="$2" max_depth="$3"
  mkdir -p "$OUT/$tag"
  "$PYTHON_BIN" "$RETRIEVAL_ROOT/tools/apply_deep_cut.py" "$POOL" "$order" \
    --max "$max_depth" --out "$OUT/$tag/r_output_trec_rag_2026.tsv" --tag "$tag"
}

emit cfda-vfs-unc "$POOL" 5000
emit cfda-vfs-cut "$POOL" 1000
emit cfda-vfs-deep "$MERGED" 5000
emit cfda-vfs-deep-cut "$MERGED" 1000

echo "Retrieval finalization replay written under $OUT"
