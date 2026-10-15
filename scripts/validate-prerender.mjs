import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { readRoutes, prerenderName, assertPage } from './prerender-utils.mjs';

export async function validatePrerender(dist) {
  const routes = readRoutes(path.join(dist, 'sitemap.xml'));
  const expected = routes.map(prerenderName).sort();
  const actual = (await readdir(path.join(dist, 'prerender'))).filter((file) => file.endsWith('.html')).sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error('Prerender-Dateien entsprechen nicht vollständig der Sitemap.');
  const config = await readFile(path.join(dist, '.htaccess'), 'utf8');
  const authoritative = await readFile(new URL('../public/htaccess-ionos', import.meta.url), 'utf8');
  if (config !== authoritative) throw new Error('Finale Apache-Konfiguration weicht von der geprüften Quelle ab.');
  const { default: puppeteer } = await import('puppeteer');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setJavaScriptEnabled(false);
    for (const route of routes) {
      const html = await readFile(path.join(dist, 'prerender', prerenderName(route)), 'utf8');
      // DOMParser inspects output without executing scripts or fetching remote assets.
      await page.evaluate((source) => {
        window.__OUTPUT_DOCUMENT__ = new DOMParser().parseFromString(source, 'text/html');
      }, html);
      await page.evaluate(`(${assertPage.toString()})(window.__OUTPUT_DOCUMENT__, ${JSON.stringify(route)})`);
    }
  } finally {
    await browser.close();
  }
  console.log(`[prerender] ${routes.length}/${routes.length} fertige HTML-Dateien samt Canonical, Meta/OG und Inhalt geprüft.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  validatePrerender(path.resolve(process.argv[2] || 'dist')).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}