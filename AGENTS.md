# AGENTS.md

- Public SEO subpages are prerendered after `vite build` by `scripts/prerender.mjs` into `dist/prerender/<route>.html` (route list in the script); the homepage is never prerendered. Why: crawlers get full HTML without JS, and no route-named folders means no Apache trailing-slash redirects.
- The prerender step must fail the build (exit 1) when it cannot produce every page. Why: a production upload must never ship landing pages that are only `<div id="root"></div>`.
- Prerendered HTML reuses the built `index.html` head unchanged (tracking snippets exactly once) and only swaps in the useSEO-managed tags and the `#root` markup. Why: avoids duplicate tracking and keeps the head identical to the SPA.
- Whole-job cancellation is handled only by the authenticated admin-cancel-job function, with a conditional status claim, assignment cancellation and final parent status readback before mail. Why: separates it from assignment dissolution and prevents duplicate clicks or assignment transitions from sending premature cancellations.
- Cancellation recipient policy and text generation live in the function-local cancellation module with injected delivery dependencies. Why: eligibility and duplicate suppression can be tested without production data or real email.
