import { readFileSync } from 'node:fs';

export const BASE_URL = 'https://www.kraftfahrer-mieten.com';

export function sitemapRoutes(xml) {
  const locations = [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/g)].map((match) => match[1].trim());
  if (!locations.length) throw new Error('Sitemap enthält keine URLs.');
  const routes = locations.map((location) => {
    const url = new URL(location);
    if (url.origin !== BASE_URL || url.search || url.hash) throw new Error(`Unerwartete Sitemap-URL: ${location}`);
    if (url.pathname !== '/' && !/^\/[a-z0-9-]+$/.test(url.pathname)) throw new Error(`Ungültiger Seitenpfad: ${url.pathname}`);
    return url.pathname;
  });
  if (new Set(routes).size !== routes.length) throw new Error('Doppelte Sitemap-URLs.');
  return routes;
}

export function readRoutes(file) {
  return sitemapRoutes(readFileSync(file, 'utf8'));
}

export function prerenderName(route) {
  return route === '/' ? 'index.html' : `${route.slice(1)}.html`;
}

export function mergeHead(template, data) {
  const escapeHtml = (value) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const attribute = (tag, name) => tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, 'i'))?.[1];
  // Remove only tags actually supplied by the existing route's useSEO hook.
  const owned = new Set(data.headNodes.flatMap((tag) => {
    if (!/^<meta\b/i.test(tag)) return [];
    const name = attribute(tag, 'name');
    const property = attribute(tag, 'property');
    return name ? [`name:${name}`] : property ? [`property:${property}`] : [];
  }));
  let html = template.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(data.title)}</title>`);
  html = html.replace(/<meta\b[^>]*>/gi, (tag) => {
    const name = attribute(tag, 'name');
    const property = attribute(tag, 'property');
    return owned.has(name ? `name:${name}` : `property:${property}`) ? '' : tag;
  });
  html = html.replace(/<link\b[^>]*>/gi, (tag) => {
    const rel = attribute(tag, 'rel');
    return rel === 'canonical' || (rel === 'alternate' && attribute(tag, 'hreflang')) ? '' : tag;
  });
  // Route schema takes precedence over duplicate static entity/FAQ schemas.
  const schemaTypes = (json) => {
    const nodes = Array.isArray(json) ? json : json?.['@graph'] || [json];
    return nodes.flatMap((node) => [].concat(node?.['@type'] || []));
  };
  const routeTypes = new Set(data.headNodes.flatMap((tag) => {
    if (!tag.includes('application/ld+json')) return [];
    return schemaTypes(JSON.parse(tag.replace(/^[\s\S]*?>/, '').replace(/<\/script>[\s\S]*$/, '')));
  }));
  html = html.replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi, (tag, json) => {
    return schemaTypes(JSON.parse(json)).some((type) => routeTypes.has(type)) ? '' : tag;
  });
  return html.replace('</head>', `    ${data.headNodes.join('\n    ')}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${data.rootHtml}</div>`);
}

export function assertPage(document, route) {
  const exactlyOne = (selector) => {
    const nodes = document.querySelectorAll(selector);
    if (nodes.length !== 1) throw new Error(`${route}: ${selector} ist ${nodes.length}× vorhanden.`);
    return nodes[0];
  };
  const canonical = `${BASE_URL}${route}`;
  if (exactlyOne('link[rel="canonical"]').getAttribute('href') !== canonical) throw new Error(`${route}: falscher Canonical.`);
  for (const selector of ['title', 'meta[name="description"]', 'meta[name="robots"]', 'meta[property="og:title"]', 'meta[property="og:description"]', 'meta[property="og:url"]', 'meta[property="og:type"]', 'meta[name="twitter:card"]', 'meta[name="twitter:title"]', 'meta[name="twitter:description"]', 'meta[name="twitter:url"]']) {
    const node = exactlyOne(selector);
    if (!(node.getAttribute('content') || node.textContent).trim()) throw new Error(`${route}: leerer ${selector}.`);
  }
  if (exactlyOne('meta[property="og:url"]').getAttribute('content') !== canonical || exactlyOne('meta[name="twitter:url"]').getAttribute('content') !== canonical) throw new Error(`${route}: falsche Share-URL.`);
  if (/noindex|nofollow/i.test(exactlyOne('meta[name="robots"]').getAttribute('content'))) throw new Error(`${route}: Indexierung gesperrt.`);
  if (!document.querySelector('#root')?.textContent.trim()) throw new Error(`${route}: leere SPA-Hülle.`);
  // /fahrer-infos is an existing redirect page; do not invent a heading or content.
  if (route !== '/fahrer-infos') exactlyOne('#root h1');
  document.querySelectorAll('script[type="application/ld+json"]').forEach((script) => JSON.parse(script.textContent));
}