#!/usr/bin/env bash
# Portable official-format gate. All inputs are explicit; no competition data
# or internal repository path is assumed.
set -euo pipefail
if [[ $# -ne 3 ]]; then echo "Usage: $0 <retrieval.tsv> <rag.jsonl> <topics.tsv>" >&2; exit 2; fi
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for input in "$@"; do [[ -s "$input" ]] || { echo "missing validation input: $input" >&2; exit 2; }; done
python3 "$HERE/official_format_check.py" "$1" "$2" "$3"
