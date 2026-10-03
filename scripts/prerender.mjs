/**
 * Statisches Prerendering der öffentlichen SEO-Unterseiten (nach `vite build`).
 *
 * - Startseite "/" wird NICHT vorgerendert.
 * - Ausgabe: dist/prerender/<route>.html (keine Ordner mit Routennamen → keine
 *   Apache-DirectorySlash-Weiterleitungen). Bestehende Dateien in dist/ werden
 *   weder verändert noch gelöscht.
 * - Kopfbereich = unverändertes dist/index.html (OpenAI-Pixel, GTM, gtag bleiben
 *   exakt einmal enthalten); nur Title + die von useSEO pro Route gesetzten Tags
 *   werden übernommen. Tracking-Skripte werden beim Rendern nicht ausgeführt.
 * - Bricht mit Exit-Code 1 ab, wenn eine Seite nicht korrekt erzeugt werden kann.
 */
import http from "node:http";
import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const PRERENDER_ROUTES = [
  "/lkw-fahrer-buchen",
  "/ersatzfahrer-lkw",
  "/lkw-fahrer-kurzfristig",
  "/mietfahrer",
  "/fahrer-fuer-speditionen",
  "/kraftfahrer-mieten",
  "/baumaschinenfuehrer-buchen",
  "/fluessigboden-service",
  "/begleitfahrzeuge-bf3",
  "/bf3-ablauf-kosten",
  "/preise-und-ablauf",
  "/wissenswertes",
  "/projekte",
  "/vermittlung",
  "/versicherung",
  "/fahrer-infos",
];

// Seiten ohne H1 im bestehenden Inhalt (keine Inhaltsänderung erlaubt)
const NO_H1 = new Set(["/fahrer-infos"]);

// Pflichtprüfung: bekannter H1-Text muss im HTML stehen
const MUST_CONTAIN = {
  "/ersatzfahrer-lkw": "Ersatzfahrer LKW – wenn Ihr Fahrer krank ist oder ausfällt",
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, "../dist");
const OUT = path.join(DIST, "prerender");

function fail(msg) {
  console.error("\n[prerender] FEHLER: " + msg);
  console.error("[prerender] Produktionsbuild abgebrochen – Landingpages wären sonst nur <div id=\"root\"></div>.\n");
  process.exit(1);
}

const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp",
  ".avif": "image/avif", ".ico": "image/x-icon", ".woff2": "font/woff2", ".woff": "font/woff",
};

// Statische Tags aus index.html, die useSEO pro Route neu setzt → im vorgerenderten
// Kopf durch die routenspezifischen Werte ersetzen (sonst doppelt/mit Startseiten-Werten).
const STATIC_OVERRIDDEN = [
  /\s*<meta name="description"[^>]*>/,
  /\s*<meta name="robots"[^>]*>/,
  /\s*<meta property="og:type"[^>]*>/,
  /\s*<meta property="og:url"[^>]*>/,
  /\s*<meta property="og:title"[^>]*>/,
  /\s*<meta property="og:description"[^>]*>/,
  /\s*<meta property="og:image"[^>]*>/,
  /\s*<meta property="og:locale"[^>]*>/,
  /\s*<meta name="twitter:card"[^>]*>/,
  /\s*<meta name="twitter:title"[^>]*>/,
  /\s*<meta name="twitter:description"[^>]*>/,
  /\s*<meta name="twitter:image"[^>]*>/,
];

async function main() {
  let template;
  try {
    template = await readFile(path.join(DIST, "index.html"), "utf8");
  } catch {
    fail("dist/index.html fehlt – wurde `vite build` ausgeführt?");
  }
  if (!template.includes('<div id="root"></div>')) fail('Platzhalter <div id="root"></div> nicht in dist/index.html gefunden.');

  // Lokaler Server: Dateien aus dist, sonst SPA-Fallback auf ORIGINAL index.html
  const server = http.createServer(async (req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
    const filePath = path.join(DIST, urlPath);
    try {
      if (filePath.startsWith(DIST) && (await stat(filePath)).isFile()) {
        res.writeHead(200, { "content-type": MIME[path.extname(filePath)] || "application/octet-stream" });
        res.end(await readFile(filePath));
        return;
      }
    } catch {}
    res.writeHead(200, { "content-type": MIME[".html"] });
    res.end(template);
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const origin = `http://127.0.0.1:${server.address().port}`;

  let puppeteer;
  try {
    puppeteer = (await import("puppeteer")).default;
  } catch (e) {
    server.close();
    fail("Paket 'puppeteer' nicht verfügbar (" + e.message + "). Bitte `npm install` ausführen.");
  }

  let browser;
  try {
    browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  } catch (e) {
    server.close();
    fail("Headless-Browser konnte nicht gestartet werden (" + e.message + "). Ggf. `npx puppeteer browsers install chrome` ausführen.");
  }

  const results = [];
  try {
    for (const route of PRERENDER_ROUTES) {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 1800 });
      page.on("pageerror", (e) => console.error("[prerender] Seitenfehler " + route + ": " + e.message));
      await page.setRequestInterception(true);
      // Nur eigene Dateien laden – keine Tracking-/Pixel-/Datenbank-Aufrufe
      page.on("request", (r) => (r.url().startsWith(origin) || r.url().startsWith("data:") ? r.continue() : r.abort()));
      // Inline-Tracking-Snippets (OpenAI-Pixel, GTM, gtag) beim Rendern nicht ausführen
      await page.setJavaScriptEnabled(true);
      await page.evaluateOnNewDocument(() => {
        window.__PRERENDER__ = true;
        try { localStorage.clear(); sessionStorage.clear(); } catch {}
      });

      await page.goto(origin + route, { waitUntil: "networkidle0", timeout: 60000 });
      await page.waitForSelector(NO_H1.has(route) ? "#root main, #root footer" : "#root h1", { timeout: 30000 });
      await page.waitForSelector('script[type="application/ld+json"][data-seo]', { timeout: 30000 });
      // Nach unten scrollen, damit ggf. verzögert geladene Abschnitte erscheinen
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
        window.scrollTo(0, 0);
      });
      await new Promise((r) => setTimeout(r, 800));

      const data = await page.evaluate(() => {
        const root = document.getElementById("root").cloneNode(true);
        // Dynamische Zustände entfernen (Cookie-Banner, Toasts, Dialoge)
        root.querySelectorAll('.consent-banner, [role="dialog"], [data-sonner-toaster], ol[tabindex="-1"] > li').forEach((n) => n.remove());
        const headNodes = [
          ...document.head.querySelectorAll('link[rel="canonical"], link[rel="alternate"][hreflang], meta[data-seo], script[type="application/ld+json"][data-seo]'),
        ].map((n) => n.outerHTML);
        return {
          title: document.title,
          rootHtml: root.innerHTML,
          headNodes,
          h1: document.querySelector("#root h1")?.textContent?.trim() || "",
          canonical: document.querySelector('link[rel="canonical"]')?.href || "",
          description: document.querySelector('meta[name="description"][data-seo]')?.content || "",
        };
      });
      await page.close();

      if (!data.title || (!data.h1 && !NO_H1.has(route)) || !data.canonical || !data.description) fail(`Unvollständige Daten für ${route}: ${JSON.stringify({ title: data.title, h1: data.h1, canonical: data.canonical, description: !!data.description })}`);
      if (!data.canonical.endsWith(route)) fail(`Canonical für ${route} unerwartet: ${data.canonical}`);

      const escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      let html = template.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(data.title)}</title>`);
      for (const re of STATIC_OVERRIDDEN) html = html.replace(re, "");
      html = html.replace("</head>", `    ${data.headNodes.join("\n    ")}\n  </head>`);
      html = html.replace('<div id="root"></div>', `<div id="root">${data.rootHtml}</div>`);

      const must = MUST_CONTAIN[route];
      if (must && !html.includes(must)) fail(`${route}: Pflichttext „${must}“ fehlt im HTML.`);
      if (!NO_H1.has(route) && !html.includes("<h1")) fail(`${route}: keine H1 im HTML.`);
      if ((html.match(/GTM-53BTCC64/g) || []).length !== (template.match(/GTM-53BTCC64/g) || []).length) fail(`${route}: GTM-Anzahl weicht ab.`);
      if ((html.match(/bzrcdn\.openai\.com/g) || []).length !== (template.match(/bzrcdn\.openai\.com/g) || []).length) fail(`${route}: OpenAI-Pixel-Anzahl weicht ab.`);

      results.push({ route, html, h1: data.h1, title: data.title });
    }
  } catch (e) {
    await browser.close().catch(() => {});
    server.close();
    fail(e.stack || String(e));
  }
  await browser.close();
  server.close();

  // Erst schreiben, wenn ALLE Seiten erfolgreich waren
  await mkdir(OUT, { recursive: true });
  for (const r of results) {
    await writeFile(path.join(OUT, r.route.slice(1) + ".html"), r.html, "utf8");
    console.log(`[prerender] ✓ ${r.route}  →  dist/prerender${r.route}.html  |  H1: ${r.h1 || "(Seite hat keine H1)"}`);
  }
  console.log(`[prerender] ${results.length}/${PRERENDER_ROUTES.length} Seiten vorgerendert.`);
}

main();
