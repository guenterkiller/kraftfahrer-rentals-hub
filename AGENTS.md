# AGENTS.md

- Public SEO subpages are prerendered after `vite build` by `scripts/prerender.mjs` into `dist/prerender/<route>.html` (route list in the script); the homepage is never prerendered. Why: crawlers get full HTML without JS, and no route-named folders means no Apache trailing-slash redirects.
- The prerender step must fail the build (exit 1) when it cannot produce every page. Why: a production upload must never ship landing pages that are only `<div id="root"></div>`.
- Prerendered HTML reuses the built `index.html` head unchanged (tracking snippets exactly once) and only swaps in the useSEO-managed tags and the `#root` markup. Why: avoids duplicate tracking and keeps the head identical to the SPA.
