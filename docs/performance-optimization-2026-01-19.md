# Performance-Optimierung 2026-01-19

## Ziel
Mobile PageSpeed/Lighthouse verbessern (insb. LCP/Speed Index), ohne Design/Content zu ändern.

---

## A) VORHER-MESSUNG (LIVE bei IONOS - fahrerexpress.de)

**⚠️ WICHTIG: Messung muss VOR dem Deployment auf der LIVE-Seite erfolgen!**

### Durchführung (Chrome Inkognito):
1. Öffne https://fahrerexpress.de/ in Chrome Inkognito-Fenster
2. DevTools öffnen (F12) → Lighthouse Tab
3. Einstellungen: Mobile, Performance, Standard-Throttling
4. Messung starten und Ergebnisse dokumentieren:

```
Baseline Messung (VORHER):
==========================
Datum/Uhrzeit: ________________

Performance Score: ____
FCP: ____ ms
LCP: ____ ms
TBT: ____ ms
CLS: ____
Speed Index: ____ ms

LCP-Element: __________________
Top 3 größte Assets:
1. _________________ (_____ KB)
2. _________________ (_____ KB)
3. _________________ (_____ KB)

Service Worker aktiv: ☐ Ja  ☐ Nein
```

---

## B) DURCHGEFÜHRTE OPTIMIERUNGEN

### 1. Bagger-Icon PNG → SVG (KRITISCH für LCP)

**Problem:** 
- `dist/assets/bagger-icon-*.png` war ~995 KB
- Wurde nur als 20×20px Icon verwendet (massiv überdimensioniert)
- Icon wurde im sichtbaren Bereich der /preise-ablauf Seite geladen

**Lösung:**
- Ersetzt durch SVG (~1 KB, 99.9% Reduktion)
- Datei: `src/assets/bagger-icon.svg`
- Import in `src/pages/PreiseUndAblauf.tsx` aktualisiert

**Vorher/Nachher:**
| Asset | Vorher | Nachher | Reduktion |
|-------|--------|---------|-----------|
| bagger-icon | ~995 KB (PNG) | ~1 KB (SVG) | **99.9%** |

### 2. Unbenutzte Assets entfernt

Gelöschte Dateien:
- `src/assets/bagger-icon.png` (995 KB)
- `src/assets/bagger-icon-new.png` (unbenutzt)
- `src/assets/excavator-icon.png` (unbenutzt)

**Gesamtersparnis:** ~2 MB im Source-Bundle

### 3. Admin-Chunk (bereits optimiert)

Admin-Seiten sind bereits korrekt via `React.lazy()` code-split:
- `const Admin = lazy(() => import("./pages/Admin"))`
- `const AdminLogin = lazy(() => import("./pages/AdminLogin"))`

**Status:** ✅ Keine Änderung nötig - Admin-Chunk wird NICHT im Initial Load geladen.

### 4. PWA/Service Worker (bereits optimiert)

Konfiguration in `vite.config.ts`:
- `skipWaiting: true` - Neue SW-Version aktiviert sofort
- `clientsClaim: true` - Übernimmt Clients sofort
- `cleanupOutdatedCaches: true` - Alte Caches werden entfernt
- `NetworkFirst` für JS-Chunks - Vermeidet 404 bei neuen Deployments

**Status:** ✅ Keine Änderung nötig.

---

## C) DEPLOY zu IONOS

### Build erstellen:
```bash
npm run build
```

### Upload-Anweisung:
1. Gesamten Inhalt des `dist/` Ordners auf IONOS Webroot hochladen
2. **WICHTIG:** Alle Dateien ÜBERSCHREIBEN (nicht nur hinzufügen)
3. `.htaccess` aus `dist/` übernehmen (wird vom Build automatisch kopiert)

### Nach Upload - Cache-Check:
1. Chrome Inkognito öffnen
2. DevTools → Application → Service Workers
3. Falls alter SW aktiv: "Unregister" klicken
4. DevTools → Application → Clear Storage → "Clear site data"
5. Seite neu laden

---

## D) NACHHER-MESSUNG (LIVE bei IONOS)

**⚠️ WICHTIG: Messung erst NACH dem Upload und Cache-Clear durchführen!**

```
Nachher Messung:
================
Datum/Uhrzeit: ________________

Performance Score: ____
FCP: ____ ms
LCP: ____ ms
TBT: ____ ms
CLS: ____
Speed Index: ____ ms

LCP-Element: __________________
```

---

## E) ERGEBNIS-TABELLE

| Metrik | Vorher | Nachher | Verbesserung |
|--------|--------|---------|--------------|
| Performance Score | ____ | ____ | ____ |
| FCP | ____ ms | ____ ms | ____ ms |
| LCP | ____ ms | ____ ms | ____ ms |
| TBT | ____ ms | ____ ms | ____ ms |
| CLS | ____ | ____ | ____ |
| Speed Index | ____ ms | ____ ms | ____ ms |

---

## Checkliste nach Deploy

- [ ] Build erstellt (`npm run build`)
- [ ] dist/ vollständig auf IONOS hochgeladen
- [ ] Inkognito-Fenster geöffnet
- [ ] Service Worker deregistriert (falls vorhanden)
- [ ] Site Data gecleart
- [ ] Lighthouse Mobile-Test durchgeführt
- [ ] Ergebnisse dokumentiert
- [ ] SPA-Routing funktioniert (/preise-ablauf, /impressum etc.)
- [ ] PWA installierbar (Manifest erkannt)
