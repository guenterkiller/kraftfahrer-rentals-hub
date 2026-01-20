# Performance Optimization Report – LCP Hero Image Fix

**Datum:** 2026-01-20  
**Ziel-URL:** https://fahrerexpress.de / https://www.kraftfahrer-mieten.com  
**Fokus:** LCP (Largest Contentful Paint) – Hero Image Optimierung

---

## 📊 VORHER – Baseline (2026-01-20)

**Lighthouse Mobile Ergebnisse (vor Optimierung):**

| Metrik | Wert | Rating |
|--------|------|--------|
| **Performance Score** | ~70 | 🟠 |
| **LCP** | ~9.0s | 🔴 Kritisch |
| **FCP** | ~2.5s | 🟠 |
| **Speed Index** | ~5.5s | 🟠 |
| **TBT** | ~150ms | 🟢 |
| **CLS** | ~0.01 | 🟢 |

**Problem identifiziert:**
- LCP-Element: `/hero/hero-mobile.webp`
- Lighthouse-Hinweis: "Bildübermittlung verbessern – geschätzte Einsparung 999 KiB"
- Originalgröße hero-mobile.webp: **~1.1 MB (1,140 KB)**

---

## ✅ DURCHGEFÜHRTE OPTIMIERUNGEN

### 1. Hero Image Neugenerierung

Beide Hero-Bilder wurden mit optimierten Parametern neu generiert:

| Datei | Dimensionen | Ziel-Größe | Format |
|-------|-------------|------------|--------|
| `hero-mobile.webp` | 768×1024 px | < 150 KB | WebP |
| `hero-desktop.webp` | 1920×1080 px | < 300 KB | WebP |

### 2. LCP-Optimierung im Code

**HeroSection.tsx** – Optimale Attribute für LCP:
```tsx
<img
  src="/hero/hero-mobile.webp"
  loading="eager"              // ✅ Kein Lazy Loading
  fetchpriority="high"         // ✅ Priorisiertes Laden
  decoding="sync"              // ✅ Synchron dekodieren (schnellerer LCP)
  width={768}
  height={1024}
/>
```

**index.html** – Preload mit media-Attribut:
```html
<link rel="preload" as="image" href="/hero/hero-mobile.webp" 
      type="image/webp" media="(max-width: 767px)" fetchpriority="high" />
<link rel="preload" as="image" href="/hero/hero-desktop.webp" 
      type="image/webp" media="(min-width: 768px)" fetchpriority="high" />
```

### 3. Breakpoint-Konsistenz

- Mobile: `(max-width: 767px)` → lädt nur `hero-mobile.webp`
- Desktop: `(min-width: 768px)` → lädt nur `hero-desktop.webp`
- **Keine Doppel-Downloads** durch konsistente Breakpoints

---

## 📏 NACHHER – Beweis der Dateigröße

### Dateigröße nach Optimierung:

**Zu messen nach Build:**
```bash
# PowerShell (Windows)
(Get-Item "dist\hero\hero-mobile.webp").Length / 1KB

# Bash (Linux/Mac)
ls -lh dist/hero/hero-mobile.webp
```

**Erwartete Werte:**
| Datei | Erwartete Größe |
|-------|-----------------|
| hero-mobile.webp | ~80-120 KB |
| hero-desktop.webp | ~150-250 KB |

### Lighthouse Nachher (erwartet):

| Metrik | Vorher | Nachher (Ziel) |
|--------|--------|----------------|
| **Performance** | 70 | > 85 |
| **LCP** | 9.0s | < 3.0s |
| **FCP** | 2.5s | < 2.0s |
| **Speed Index** | 5.5s | < 3.5s |

---

## 📦 DEPLOYMENT-ANLEITUNG FÜR IONOS

### 1. Build erstellen

```bash
npm run build
```

### 2. Dateigröße verifizieren

Nach dem Build die tatsächliche Größe prüfen:

```powershell
# PowerShell
Get-ChildItem "dist\hero\" | Select-Object Name, @{N='KB';E={[math]::Round($_.Length/1KB,1)}}
```

Erwartetes Ergebnis:
```
Name               KB
----               --
hero-mobile.webp   ~100
hero-desktop.webp  ~200
```

### 3. IONOS Upload

1. Gesamten `dist/` Ordner via FTP/SFTP hochladen
2. **WICHTIG:** Webroot komplett überschreiben (nicht nur hinzufügen)
3. Nach Upload: 5 Minuten warten für CDN-Cache-Invalidierung

### 4. Verifizierung nach Upload

1. **Inkognito-Modus** öffnen (Strg+Shift+N / Cmd+Shift+N)
2. DevTools öffnen (F12) → Application Tab
3. Service Workers → "Unregister"
4. "Clear site data" klicken
5. Lighthouse Test starten (Mobile, Throttling: Simulated)

---

## 🔍 LCP-ELEMENT VERIFIZIEREN

Nach dem Deployment sollte im Lighthouse-Report zu sehen sein:

**Largest Contentful Paint element:**
```
/hero/hero-mobile.webp (oder hero-desktop.webp bei Desktop-Test)
```

Das Element bleibt das Hero-Bild, aber die Ladezeit sinkt drastisch.

---

## ✅ CHECKLISTE VOR DEPLOYMENT

- [ ] `npm run build` erfolgreich
- [ ] `dist/hero/hero-mobile.webp` existiert und < 150 KB
- [ ] `dist/hero/hero-desktop.webp` existiert und < 300 KB
- [ ] Keine Konsolenfehler im lokalen Preview
- [ ] Hero-Bild visuell geprüft (keine sichtbare Qualitätsverschlechterung)

---

## 📝 NOTIZEN

- WebP-Format gewählt wegen maximaler Browser-Kompatibilität (>98%)
- AVIF nicht verwendet (ältere iOS/Safari-Versionen noch problematisch)
- `decoding="sync"` statt `async` für schnelleren visuellen LCP
- Bilder sind AI-generiert, frei von Markenlogos

---

**Erstellt von:** Lovable AI  
**Datum:** 2026-01-20
