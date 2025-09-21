# Komplettes Build-Script für kraftfahrer-mieten.com
# Erstellt einen vollständigen dist-Ordner mit allen erforderlichen Dateien

$ErrorActionPreference = "Stop"

Write-Host "=== Kraftfahrer-Mieten.com - Kompletter Build ===" -ForegroundColor Green

# Arbeitsverzeichnis erstellen
$workDir = "C:\Users\brasi\Desktop\kraftfahrer-build-temp"
$distDir = "C:\Users\brasi\Desktop\website-dist-komplett"

# Aufräumen falls vorhanden
if (Test-Path $workDir) { Remove-Item $workDir -Recurse -Force }
if (Test-Path $distDir) { Remove-Item $distDir -Recurse -Force }

Write-Host "1. Repository klonen..." -ForegroundColor Yellow
git clone https://github.com/brasilio-thomazo/fahrerexpress.de.git $workDir
Set-Location $workDir

Write-Host "2. Dependencies installieren..." -ForegroundColor Yellow
npm install

Write-Host "3. Production Build erstellen..." -ForegroundColor Yellow
npm run build

Write-Host "4. Dist-Ordner vorbereiten..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $distDir -Force

Write-Host "5. Build-Dateien kopieren..." -ForegroundColor Yellow
# Hauptbuild-Ordner (dist) kopieren
Copy-Item "dist\*" $distDir -Recurse -Force

Write-Host "6. Public-Dateien hinzufügen/überschreiben..." -ForegroundColor Yellow
# Alle statischen Dateien aus public
Copy-Item "public\*" $distDir -Recurse -Force

Write-Host "7. Spezielle Dateien sicherstellen..." -ForegroundColor Yellow

# Wichtige Dateien einzeln kopieren falls nicht vorhanden
$criticalFiles = @(
    "public\.htaccess",
    "public\admin-check.html", 
    "public\cookies.html",
    "public\datenschutz.html",
    "public\manifest.json",
    "public\robots.txt",
    "public\sitemap.xml",
    "public\version.txt",
    "public\favicon.ico",
    "public\favicon.png",
    "public\placeholder.svg"
)

foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        $destFile = $file -replace "^public\\", ""
        $destPath = Join-Path $distDir $destFile
        Copy-Item $file $destPath -Force
        Write-Host "  ✓ $destFile" -ForegroundColor Green
    }
}

# Ordner sicherstellen
$criticalDirs = @("assets", "lovable-uploads", "styles", "uploads")
foreach ($dir in $criticalDirs) {
    $srcPath = "public\$dir"
    $destPath = Join-Path $distDir $dir
    if (Test-Path $srcPath) {
        Copy-Item $srcPath $destPath -Recurse -Force
        Write-Host "  ✓ Ordner: $dir" -ForegroundColor Green
    }
}

Write-Host "8. .htaccess für IONOS anpassen..." -ForegroundColor Yellow
$htaccessContent = @"
# Kraftfahrer-Mieten.com - IONOS Hosting Configuration
Options -MultiViews
RewriteEngine On

# Bypass admin-check.html (serve static)
RewriteRule ^admin-check\.html$ - [L]

# MIME types
AddType image/jpeg .jpg .jpeg
AddType image/png .png
AddType image/webp .webp

# Security headers
<IfModule mod_headers.c>
  Header set Accept-Ranges none
  Header always set X-Content-Type-Options nosniff
  Header always set X-Frame-Options DENY
  Header always set X-XSS-Protection "1; mode=block"
</IfModule>

# Canonical 301 redirects (HTTPS)
RewriteRule ^index\.html$ https://www.kraftfahrer-mieten.com/ [R=301,L]
RewriteRule ^impressum\.html$ https://www.kraftfahrer-mieten.com/impressum [R=301,L]
RewriteRule ^datenschutzerklaerung\.html$ https://www.kraftfahrer-mieten.com/datenschutz [R=301,L]

# Remove .html extension redirects
RewriteCond %{REQUEST_URI} \.html$ [NC]
RewriteCond %{REQUEST_URI} !^/admin-check\.html$ [NC]
RewriteRule ^(.+)\.html$ https://www.kraftfahrer-mieten.com/$1 [R=301,L]

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^ https://www.kraftfahrer-mieten.com%{REQUEST_URI} [R=301,L]

# SPA routing
RewriteBase /
RewriteRule ^index\.html$ - [L]

# Admin routes
RewriteRule ^admin$ /index.html [L]
RewriteRule ^admin/login$ /index.html [L]

# Fallback for SPA
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/(robots\.txt|sitemap\.xml|favicon\.ico|assets/|uploads/|lovable-uploads/|styles/)
RewriteRule . /index.html [L]
"@

Set-Content -Path "$distDir\.htaccess" -Value $htaccessContent -Encoding UTF8

Write-Host "9. Version-Datei aktualisieren..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$buildVersion = "Build: $timestamp - Complete IONOS Distribution"
Set-Content -Path "$distDir\version.txt" -Value $buildVersion -Encoding UTF8

Write-Host "10. Validierung..." -ForegroundColor Yellow
$expectedFiles = @(
    "index.html", ".htaccess", "robots.txt", "sitemap.xml", "manifest.json",
    "admin-check.html", "cookies.html", "datenschutz.html", "version.txt"
)

$missingFiles = @()
foreach ($file in $expectedFiles) {
    if (!(Test-Path "$distDir\$file")) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "WARNUNG: Fehlende Dateien:" -ForegroundColor Red
    $missingFiles | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
} else {
    Write-Host "✓ Alle kritischen Dateien vorhanden" -ForegroundColor Green
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
Set-Location "C:\"
Remove-Item $workDir -Recurse -Force

Write-Host "Temp-Dateien bereinigt. Build fertig!" -ForegroundColor Green