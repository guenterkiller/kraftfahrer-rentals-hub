# Komplettes Build-Script für kraftfahrer-mieten.com
# Erstellt einen vollständigen dist-Ordner mit allen erforderlichen Dateien

$ErrorActionPreference = "Stop"

Write-Host "=== Kraftfahrer-Mieten.com - Kompletter Build ===" -ForegroundColor Green

# Arbeitsverzeichnis erstellen
$desktop = [Environment]::GetFolderPath("Desktop")
if ([string]::IsNullOrWhiteSpace($desktop)) { throw "Desktop-Ordner konnte nicht ermittelt werden." }
$workDir = Join-Path $desktop "kraftfahrer-build-temp"
$distDir = Join-Path $desktop "kraftfahrer-fertig"
$originalDir = Get-Location

# Aufräumen falls vorhanden
if (Test-Path $workDir) { Remove-Item $workDir -Recurse -Force }
if (Test-Path $distDir) { Remove-Item $distDir -Recurse -Force }

Write-Host "1. Repository klonen..." -ForegroundColor Yellow
git clone --branch main --single-branch https://github.com/guenterkiller/kraftfahrer-rentals-hub.git $workDir
if ($LASTEXITCODE -ne 0) { throw "Repository konnte nicht geklont werden; kein Build oder Upload-Paket erstellen." }
Set-Location $workDir
if ((git remote get-url origin) -ne "https://github.com/guenterkiller/kraftfahrer-rentals-hub.git") {
    throw "Unerwartetes Repository; kein Build oder Upload-Paket erstellen."
}
$sourceCommit = git rev-parse HEAD
if ($LASTEXITCODE -ne 0) { throw "Quellstand konnte nicht ermittelt werden." }
Write-Host "Quellstand: guenterkiller/kraftfahrer-rentals-hub / main / $sourceCommit" -ForegroundColor Cyan

Write-Host "2. Dependencies installieren..." -ForegroundColor Yellow
npm ci --legacy-peer-deps
if ($LASTEXITCODE -ne 0) { throw "Dependency-Installation fehlgeschlagen." }

Write-Host "3. Production Build erstellen..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { throw "Build oder Prerendering fehlgeschlagen; kein Upload-Paket erstellen." }
node scripts/validate-prerender.mjs dist
if ($LASTEXITCODE -ne 0) { throw "Build enthält unvollständige Prerender-Dateien." }

Write-Host "4. Dist-Ordner vorbereiten..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $distDir -Force

Write-Host "5. Build-Dateien kopieren..." -ForegroundColor Yellow
# Hauptbuild-Ordner (dist) kopieren
Get-ChildItem -LiteralPath "dist" -Force | ForEach-Object {
    Copy-Item -LiteralPath $_.FullName -Destination $distDir -Recurse -Force
}
# Jede Build-Datei inklusive versteckter Dateien muss unverändert im Ziel stehen.
$builtRoot = (Resolve-Path "dist").Path
foreach ($builtFile in (Get-ChildItem -LiteralPath $builtRoot -Recurse -File -Force)) {
    $relative = $builtFile.FullName.Substring($builtRoot.Length + 1)
    $copiedFile = Join-Path $distDir $relative
    if (!(Test-Path -LiteralPath $copiedFile -PathType Leaf)) {
        throw "Build-Datei fehlt im Ziel: $relative"
    }
    if ((Get-FileHash -LiteralPath $builtFile.FullName).Hash -ne (Get-FileHash -LiteralPath $copiedFile).Hash) {
        throw "Build-Datei wurde beim Kopieren verändert: $relative"
    }
}

Write-Host "8. Geprüfte IONOS-Konfiguration unverändert übernehmen..." -ForegroundColor Yellow
$sourceConfig = "public\htaccess-ionos"
if ((Get-FileHash $sourceConfig).Hash -ne (Get-FileHash "public\.htaccess").Hash) {
    throw "Die beiden Apache-Konfigurationen weichen voneinander ab."
}
Copy-Item $sourceConfig "$distDir\.htaccess" -Force
if ((Get-FileHash $sourceConfig).Hash -ne (Get-FileHash "$distDir\.htaccess").Hash) {
    throw "Die finale .htaccess wurde nicht unverändert übernommen."
}

# Validiert ALLE Sitemap-Seiten im tatsächlich finalen Upload-Ordner.
node scripts/validate-prerender.mjs $distDir
if ($LASTEXITCODE -ne 0) { throw "Finales Upload-Paket enthält unvollständige Prerender-Dateien." }

Write-Host "9. Version-Datei aktualisieren..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$buildVersion = "Build: $timestamp - Complete IONOS Distribution - guenterkiller/kraftfahrer-rentals-hub / main / $sourceCommit"
Set-Content -Path "$distDir\version.txt" -Value $buildVersion -Encoding UTF8

Write-Host "10. Validierung..." -ForegroundColor Yellow
$expectedFiles = @(
    "index.html", ".htaccess", "robots.txt", "sitemap.xml", "sw.js", "manifest.webmanifest",
    "admin-check.html", "cookies.html", "datenschutz.html", "version.txt"
)

$missingFiles = @()
foreach ($file in $expectedFiles) {
    if (!(Test-Path "$distDir\$file")) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    throw "Fehlende Dateien: $($missingFiles -join ', ')"
} else {
    Write-Host "✓ Alle kritischen Dateien vorhanden" -ForegroundColor Green
}
foreach ($requiredDir in @("assets", "prerender")) {
    $requiredPath = Join-Path $distDir $requiredDir
    if (!(Test-Path -LiteralPath $requiredPath -PathType Container) -or
        !(Get-ChildItem -LiteralPath $requiredPath -File -Recurse -Force)) {
        throw "Erforderlicher Build-Ordner fehlt oder ist leer: $requiredDir"
    }
}

# Statistiken
$totalFiles = (Get-ChildItem $distDir -Recurse -File).Count
$totalSize = [math]::Round(((Get-ChildItem $distDir -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB), 2)

Write-Host ""
Write-Host "=== BUILD ABGESCHLOSSEN ===" -ForegroundColor Green
Write-Host "Zielordner: $distDir" -ForegroundColor Cyan
Write-Host "Dateien: $totalFiles" -ForegroundColor Cyan  
Write-Host "Größe: $totalSize MB" -ForegroundColor Cyan
Write-Host ""
Write-Host "NÄCHSTE SCHRITTE:" -ForegroundColor Yellow
Write-Host "1. Inhalt von '$distDir' auf IONOS hochladen" -ForegroundColor White
Write-Host "2. DNS sicherstellen: A-Record @ und www → 185.158.133.1" -ForegroundColor White
Write-Host "3. SSL-Zertifikat bei IONOS aktivieren" -ForegroundColor White
Write-Host ""

# Aufräumen
Set-Location $originalDir
Remove-Item $workDir -Recurse -Force

Write-Host "Temp-Dateien bereinigt. Build fertig!" -ForegroundColor Green