# QilyLean Chinese Default + Google Translate On-Demand V1

Date: 2026-08-25
Status: controlled change under R6 / Site System V4

## Decision

Chinese static HTML remains the sole authoritative content source and is restored as the default visitor display language. QilyLean must not automatically translate the page on load, persist a non-Chinese display choice, issue background translation requests, or block navigation while translation is in progress.

## Translation utility

A visually distinct `🌐 Google 翻译｜按需` utility is placed at the far right of the primary navigation. It is a utility control, not a ninth primary navigation item. The control remains idle until the visitor explicitly selects a target language.

On selection, the current canonical QilyLean page URL is handed to Google Translate website translation using an `sl=auto`, selected `tl`, and encoded `u` URL. This intentionally delegates translated-page rendering and subsequent language switching to Google rather than rewriting QilyLean DOM content in the origin page.

## Performance and source integrity

- Default first paint: Chinese static HTML, no translation spinner.
- Automatic translation: disabled.
- QilyLean Worker `/translate` and AI `/chat` fallback: not called by the website translation control.
- Legacy language selection and local translation caches are cleared by the migration runtime.
- `html[data-qily-language]` is normalized to `zh-CN` on the origin site so navigation/Dock self-healing continues to operate on the authoritative Chinese source.
- Images, Canvas and embedded third-party content remain unchanged by the origin page.

## Google integration boundary

Chrome's native address-bar / browser-toolbar translation UI is browser chrome and cannot be embedded into website DOM. The QilyLean control therefore provides a clearly labeled website-side entry to Google Translate's website-translation service. Google service availability is controlled by Google and may vary by region/network.

## Visual acceptance

The Google translation utility must be visibly different from primary navigation: blue two-pixel border, white utility surface, globe mark, explicit `Google 翻译` label, yellow `按需` badge, separate target-language select, complete hover/active/focus-visible states, and responsive compaction without becoming visually confused with a normal navigation link.

## Regression protection

The sitewide materializer owns the cache version and direct runtime marker for every tracked public HTML page. CI validates: Chinese default, no automatic translation network request, no retired spinner, explicit Google translation route, visual distinction, navigation/Dock source-language gates, and sitewide materialization markers.
