# Performance-Optimierung 2026-01-19

## Ziel
Mobile PageSpeed/Lighthouse verbessern (insb. LCP/Speed Index), ohne Design/Content zu ändern.

---

## A) VORHER-MESSUNG (LIVE bei IONOS - fahrerexpress.de) ✅ DOKUMENTIERT

**Lighthouse MOBILE auf https://fahrerexpress.de/ – Chrome Inkognito (19.01.2026, 20:04 MEZ)**

| Metrik | Wert |
|--------|------|
| **Performance Score** | **93** |
| FCP | 0,4 s |
| LCP | **1,7 s** |
| TBT | 0 ms |
| CLS | 0 |
| Speed Index | 1,0 s |
| LCP-Element | `/hero/hero-mobile.webp` |
| Größtes Asset | `hero-mobile.webp` – **1.140,9 KiB** |

### Lighthouse-Diagnose:
- **hero-mobile.webp: 1.140 KB** → Einsparung von **1.012 KB** empfohlen
- Bild ist 864x1125 aber nur 760x1041 angezeigt
- Höhere Komprimierung könnte ~982,7 KB sparen
- Responsive Sizing könnte weitere ~211,7 KB sparen

---

## B) DURCHGEFÜHRTE OPTIMIERUNGEN

### 1. Hero-Mobile Bild neu komprimiert (KRITISCH für LCP)

**Problem:** 
- `hero-mobile.webp` war **1.140 KB** – das LCP-Element
- Bild wurde als 760x1041 angezeigt, war aber 864x1125
- Hauptverantwortlich für LCP-Verzögerung

**Lösung:**
- Hero-Bild mit höherer Kompression neu generiert
- Aspect Ratio 3:4 beibehalten für mobile Darstellung
- Datei: `public/hero/hero-mobile.webp` (ersetzt)

**Vorher/Nachher:**
| Asset | Vorher | Nachher | Reduktion |
|-------|--------|---------|-----------|
| hero-mobile.webp | 1.140 KB | ~150-200 KB (geschätzt) | **~85%** |

### 2. Bagger-Icon PNG → SVG (bereits umgesetzt)

**Problem:** 
- `dist/assets/bagger-icon-*.png` war ~995 KB
- Wurde nur als 20×20px Icon verwendet (massiv überdimensioniert)

**Lösung:**
- Ersetzt durch SVG (~1 KB, 99.9% Reduktion)
- Datei: `src/assets/bagger-icon.svg`

### 3. Unbenutzte Assets entfernt

Gelöschte Dateien:
- `src/assets/bagger-icon.png` (995 KB)
- `src/assets/bagger-icon-new.png` (unbenutzt)
- `src/assets/excavator-icon.png` (unbenutzt)

### 4. Admin-Chunk (bereits optimiert) ✅

Admin-Seiten sind bereits korrekt via `React.lazy()` code-split.

### 5. PWA/Service Worker (bereits optimiert) ✅

Konfiguration in `vite.config.ts` mit skipWaiting, clientsClaim etc.

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
LCP: ____ ms  (Ziel: < 1,0 s)
TBT: ____ ms
CLS: ____
Speed Index: ____ ms

LCP-Element: __________________
```

---

## E) ERGEBNIS-TABELLE

| Metrik | Vorher | Nachher | Verbesserung |
|--------|--------|---------|--------------|
| Performance Score | 93 | ____ | ____ |
| FCP | 0,4 s | ____ | ____ |
| LCP | **1,7 s** | ____ | ____ |
| TBT | 0 ms | ____ | ____ |
| CLS | 0 | ____ | ____ |
| Speed Index | 1,0 s | ____ | ____ |

---

## Erwartete Verbesserung

Mit dem optimierten Hero-Bild (~150-200 KB statt 1.140 KB):
- **LCP**: von 1,7 s auf ~0,8-1,0 s (geschätzt)
- **Performance Score**: von 93 auf 95-98 (geschätzt)
- **Netzwerk-Payload**: ~1 MB weniger auf Mobile

---

## Checkliste nach Deploy

- [ ] Build erstellt (`npm run build`)
- [ ] dist/ vollständig auf IONOS hochgeladen
- [ ] Inkognito-Fenster geöffnet
- [ ] Service Worker deregistriert (falls vorhanden)
- [ ] Site Data gecleart
- [ ] Lighthouse Mobile-Test durchgeführt
- [ ] Ergebnisse in Tabelle E dokumentiert
- [ ] SPA-Routing funktioniert (/preise-ablauf, /impressum etc.)
- [ ] PWA installierbar (Manifest erkannt)
