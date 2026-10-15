# AGENTS.md

- Overnight-cost copy has matching frontend and function-local text modules and a shared customer/admin email notice selected by tariff key before legacy flags. Why: keeps approved wording consistent without coupling Edge Functions to frontend files or changing tariff calculations.

- All existing sitemap URLs are prerendered after `vite build` by `scripts/prerender.mjs` into `dist/prerender/<route>.html`, with `/` in `prerender/index.html`; the sitemap is the authoritative route list. Why: every indexed page gets full HTTP HTML without route-named directories or changes to the SPA fallback template.
- The prerender step must fail the build (exit 1) when it cannot produce every page. Why: a production upload must never ship landing pages that are only `<div id="root"></div>`.
- Prerendered HTML reuses the built `index.html` head unchanged (tracking snippets exactly once) and only swaps in the useSEO-managed tags and the `#root` markup. Why: avoids duplicate tracking and keeps the head identical to the SPA.
- Both public Apache configurations must be byte-identical; the IONOS packaging script copies the authoritative configuration and validates the final prerender directory without regenerating rewrite rules. Why: packaging must not discard prerender routing or reintroduce internal redirect loops.
- Whole-job cancellation is handled only by the authenticated admin-cancel-job function, with a conditional status claim, assignment cancellation and final parent status readback before mail. Why: separates it from assignment dissolution and prevents duplicate clicks or assignment transitions from sending premature cancellations.
- Cancellation recipient policy and text generation live in the function-local cancellation module with injected delivery dependencies. Why: eligibility and duplicate suppression can be tested without production data or real email.
