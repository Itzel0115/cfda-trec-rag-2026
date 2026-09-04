#!/usr/bin/env bash
# Validate explicitly supplied files. No official submissions are bundled.
set -euo pipefail
if [[ $# -ne 4 ]]; then echo "Usage: $0 <retrieval-1.tsv> <retrieval-2.tsv> <rag.jsonl> <topics.tsv>" >&2; exit 2; fi
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
"$HERE/validate_submission.sh" "$1" "$3" "$4"
"$HERE/validate_submission.sh" "$2" "$3" "$4"
