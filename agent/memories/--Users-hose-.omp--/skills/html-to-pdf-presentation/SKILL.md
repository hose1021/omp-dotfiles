# HTML → PDF presentation pipeline (Russian, omp)

## Proven workflow
1. Build single self-contained HTML: 16:9 or A4-landscape slides, CSS-only visuals, inline SVG/mermaid diagrams (no remote assets, no images — arrows/schemes only per user preference), system fonts with Cyrillic support, dark high-contrast theme (min 18px body).
2. Render in browser tab; verify 0 mermaid syntax errors + screenshot title slide.
3. Export: Chromium `page.pdf()` — for deck use `@page { size: 13.333in 7.5in; margin: 0 }`, print backgrounds, one slide per page; for A4 use page.pdf() landscape.
4. Validate: PDF page count == expected, dimensions correct, extracted text contains key headings, no empty-text pages. NOTE: SVG/mermaid diagrams yield garbage in text-extraction — validate visuals via screenshot instead.
5. Render first/middle/last slides as images; fix clipping/overflow/Cyrillic fallback and re-render before delivery. Keep the HTML source alongside the PDF for future edits.

## Data-grounded variant (omp analytics)
Sources: agent.db:model_perf (samples, output_tokens, gen_ms, ttft_ms), agent.db:usage_history, history.db (~267 prompts), plugins/installed_plugins.json + omp-plugins.lock.json (detect duplicate marketplace installs).

## Fallback
No Chromium → Python PDF stack with embedded Cyrillic font, preserving 16:9.
