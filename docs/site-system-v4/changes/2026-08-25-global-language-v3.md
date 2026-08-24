# Global Language V3｜2026-08-25

## Change purpose

Resolve incomplete translation coverage and long Chinese-to-English progressive switching latency reported on public QilyLean pages, while changing the visible default visitor language to English.

## Source-of-truth boundary

Chinese static HTML remains the authoritative source and recovery baseline. V3 does **not** rewrite canonical metadata, sitemap ownership, structured data, evidence records or business facts into AI-generated source content. English is the default runtime presentation language; choosing Simplified Chinese restores the original source text immediately without a translation API call.

## Coverage changes

- Scan normal DOM text plus title / aria-label / aria-description / placeholder / alt.
- Traverse open Shadow DOM roots.
- Traverse same-origin iframe documents; cross-origin iframes remain outside browser security boundaries.
- Observe newly inserted dynamic nodes and accessible nested roots.
- Run delayed quality sweeps after the first pass to catch late-rendered modules and retry partial failures.
- Keep script/style/code/pre/textarea/contenteditable/no-translate content outside translation.
- Pixel text inside images/canvas and inaccessible cross-origin frames are explicitly outside runtime translation coverage.

## Performance changes

- Default visible language becomes English through a new V3 preference key.
- Common navigation / utility / manufacturing terms use a local English seed dictionary and change immediately.
- Remote batches increase to 24 strings / about 5200 characters.
- Up to six batches execute concurrently.
- Failed large batches split recursively; only small failed groups use the slower QilyLean AI chat fallback.
- Browser translation cache expands to 1200 entries per target language.
- Chinese recovery is always local and immediate because Chinese is the preserved source.

## Sitewide materialization

`site-global-language-v3.js` is injected directly into every tracked HTML file by `scripts/materialize-global-language-v3.js`. The main-branch workflow `.github/workflows/materialize-global-language-v3.yml` runs the materializer, validates idempotency and commits generated HTML only when needed. This prevents page-by-page temporary patches and avoids dependence on a stale cached shell loader.

## Acceptance

1. Fresh visitors default to English.
2. Primary navigation terms switch to English immediately from the built-in seed dictionary.
3. Main body content starts translating in parallel rather than two batches at a time.
4. Late-rendered same-origin modules, open Shadow DOM and accessible iframe text are covered by follow-up sweeps.
5. Selecting Simplified Chinese restores source Chinese without network translation.
6. Brand / model / engineering tokens remain protected.
7. Image-pixel text and inaccessible cross-origin iframe content are not falsely claimed as translatable.
