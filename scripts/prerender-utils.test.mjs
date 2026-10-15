import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { sitemapRoutes, readRoutes, prerenderName, mergeHead } from './prerender-utils.mjs';

test('all existing sitemap routes including homepage are covered exactly once', () => {
  const routes = readRoutes(new URL('../public/sitemap.xml', import.meta.url));
  assert.equal(routes.length, 21);
  assert.ok(routes.includes('/'));
  assert.ok(routes.includes('/lkw-ueberfuehrung'));
  assert.equal(prerenderName('/'), 'index.html');
  assert.equal(prerenderName('/lkw-ueberfuehrung'), 'lkw-ueberfuehrung.html');
});

test('invalid hosts and duplicate routes fail closed', () => {
  assert.throws(() => sitemapRoutes('<loc>https://example.org/</loc>'));
  assert.throws(() => sitemapRoutes('<loc>https://www.kraftfahrer-mieten.com/</loc><loc>https://www.kraftfahrer-mieten.com/</loc>'));
});

test('merge removes only overridden technical tags and preserves tracking and body text', () => {
  const template = '<html><head><title>Alt</title><meta name="description" content="Alt"><meta property="og:url" content="Alt"><meta property="og:image" content="bestehendes-bild"><script>TRACKING_EXACT</script></head><body><div id="root"></div></body></html>';
  const html = mergeHead(template, { title: 'Unverändert & korrekt', rootHtml: '<h1>Bestehender Text</h1>', headNodes: ['<meta name="description" content="Freigegeben">', '<meta property="og:url" content="https://www.kraftfahrer-mieten.com/lkw-ueberfuehrung">'] });
  assert.equal((html.match(/name="description"/g) || []).length, 1);
  assert.equal((html.match(/property="og:url"/g) || []).length, 1);
  assert.ok(html.includes('bestehendes-bild'));
  assert.ok(html.includes('<script>TRACKING_EXACT</script>'));
  assert.ok(html.includes('<h1>Bestehender Text</h1>'));
});

test('Apache copies match and packaging cannot regenerate or silently continue failed builds', () => {
  const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
  const config = read('public/.htaccess');
  assert.equal(config, read('public/htaccess-ionos'));
  assert.ok(config.includes('RewriteRule ^$ prerender/index.html [END]'));
  assert.ok(config.includes('RewriteRule ^([a-z0-9-]+)$ prerender/$1.html [END]'));
  assert.ok(config.includes('RewriteRule ^([a-z0-9-]+)/+$ /$1 [R=301,L]'));
  const packaging = read('build-complete-dist.ps1');
  assert.ok(!packaging.includes('$htaccessContent'));
  assert.ok(packaging.includes('node scripts/validate-prerender.mjs $distDir'));
  assert.match(packaging, /npm run build\s+if \(\$LASTEXITCODE -ne 0\)/);
});