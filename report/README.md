# Technical Report

This directory contains the canonical final technical report produced for the
CFDA TREC RAG 2026 team project.

## Contents

- `main.pdf` — frozen final historical artifact.
- `main.tex` — report entry point.
- `sections/` — main report sections.
- `tables/` — report tables included by the sections and appendix.
- `figures/` — native LaTeX/TikZ figure sources.
- `appendices/` — included parameter, results, and prompt appendices.
- `references.bib` — bibliography database.
- `acl.sty` and `acl_natbib.bst` — local ACL report-format support files.

## Historical Artifact

`main.pdf` is copied byte-for-byte from the canonical final report in the
immutable archive. The LaTeX sources are included for inspection and future
structural use. No scientific claims, reported numbers, author order, or
citations were changed.

## Reproduction

The source entry point is `main.tex`; it inputs files under `sections/`,
`tables/`, `figures/`, and `appendices/`, and uses `references.bib`. A complete
LaTeX toolchain and the packages listed in `main.tex` are required. The frozen
PDF is authoritative and is never replaced by a local rebuild.

## External Data

The report describes experiments using competition and development material
that is not included here. TREC topics, qrels, nuggets, candidate pools,
submissions, traces, and generated experiment artifacts are intentionally
excluded.

## Attribution

Report authorship and author order are preserved exactly from the canonical
final artifact. This personal archival repository does not change team
authorship.

## Licensing

The ACL style and bibliography support files retain their original headers and
respective terms. No project-wide license is granted by this repository.
