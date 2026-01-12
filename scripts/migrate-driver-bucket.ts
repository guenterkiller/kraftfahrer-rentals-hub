/**
 * Migration Script: Kopiere alle Dateien von "driver-documents" nach "fahrer-dokumente"
 * 
 * Ausführung:
 *   npx tsx scripts/migrate-driver-bucket.ts
 * 
 * Voraussetzungen:
 *   - Node.js 18+
 *   - @supabase/supabase-js installiert (npm install @supabase/supabase-js)
 *   - Umgebungsvariablen gesetzt:
 *       SUPABASE_URL=https://hxnabnsoffzevqhruvar.supabase.co
 *       SUPABASE_SERVICE_ROLE_KEY=<dein-service-role-key>
 * 
 * WICHTIG: Dieses Script LÖSCHT KEINE Dateien. 
 * Nach erfolgreichem Test kann der alte Bucket manuell geleert werden.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://hxnabnsoffzevqhruvar.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Fehler: SUPABASE_SERVICE_ROLE_KEY nicht gesetzt!');
  console.log('Bitte setzen: export SUPABASE_SERVICE_ROLE_KEY="..."');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const SOURCE_BUCKET = 'driver-documents';
const TARGET_BUCKET = 'fahrer-dokumente';

interface MigrationResult {
  totalFiles: number;
  copiedFiles: number;
  skippedFiles: number;
  errors: Array<{ path: string; error: string }>;
}

async function listAllFiles(bucket: string, folder: string = ''): Promise<string[]> {
  const allPaths: string[] = [];
  
  const { data, error } = await supabase.storage.from(bucket).list(folder, {
    limit: 1000,
    sortBy: { column: 'name', order: 'asc' }
  });

  if (error) {
    console.error(`Fehler beim Auflisten von ${bucket}/${folder}:`, error.message);
    return allPaths;
  }

  if (!data || data.length === 0) {
    return allPaths;
  }

  for (const item of data) {
    const fullPath = folder ? `${folder}/${item.name}` : item.name;
    
    if (item.id === null) {
      // Es ist ein Ordner - rekursiv durchsuchen
      const subFiles = await listAllFiles(bucket, fullPath);
      allPaths.push(...subFiles);
    } else {
      // Es ist eine Datei
      allPaths.push(fullPath);
    }
  }

  return allPaths;
}

async function fileExistsInTarget(path: string): Promise<boolean> {
  const { data, error } = await supabase.storage
    .from(TARGET_BUCKET)
    .list(path.split('/').slice(0, -1).join('/'), {
      search: path.split('/').pop()
    });
  
  if (error || !data) return false;
  return data.some(f => f.name === path.split('/').pop());
}

async function copyFile(sourcePath: string): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Datei aus Source-Bucket herunterladen
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(SOURCE_BUCKET)
      .download(sourcePath);

    if (downloadError || !fileData) {
      return { success: false, error: downloadError?.message || 'Download fehlgeschlagen' };
    }

    // 2. Content-Type ermitteln
    const ext = sourcePath.split('.').pop()?.toLowerCase() || '';
    const mimeTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'webp': 'image/webp'
    };
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    // 3. In Target-Bucket hochladen
    const { error: uploadError } = await supabase.storage
      .from(TARGET_BUCKET)
      .upload(sourcePath, fileData, {
        contentType,
        upsert: false // Keine Überschreibung existierender Dateien
      });

    if (uploadError) {
      // Wenn Datei bereits existiert, als "skipped" behandeln
      if (uploadError.message.includes('already exists') || uploadError.message.includes('Duplicate')) {
        return { success: true, error: 'SKIPPED' };
      }
      return { success: false, error: uploadError.message };
    }

    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
}

async function migrate(): Promise<MigrationResult> {
  console.log('🚀 Starte Migration von Bucket "driver-documents" nach "fahrer-dokumente"...\n');

  const result: MigrationResult = {
    totalFiles: 0,
    copiedFiles: 0,
    skippedFiles: 0,
    errors: []
  };

  // 1. Alle Dateien im Source-Bucket auflisten
  console.log('📂 Liste Dateien im Source-Bucket...');
  const files = await listAllFiles(SOURCE_BUCKET);
  result.totalFiles = files.length;

  if (files.length === 0) {
    console.log('✅ Keine Dateien im Source-Bucket gefunden. Migration nicht nötig.');
    return result;
  }

  console.log(`   Gefunden: ${files.length} Dateien\n`);

  // 2. Dateien einzeln kopieren
  console.log('📋 Kopiere Dateien...\n');
  
  for (let i = 0; i < files.length; i++) {
    const filePath = files[i];
    const progress = `[${i + 1}/${files.length}]`;
    
    process.stdout.write(`${progress} ${filePath.substring(0, 60)}... `);
    
    const copyResult = await copyFile(filePath);
    
    if (copyResult.success) {
      if (copyResult.error === 'SKIPPED') {
        console.log('⏭️  (existiert bereits)');
        result.skippedFiles++;
      } else {
        console.log('✅');
        result.copiedFiles++;
      }
    } else {
      console.log(`❌ ${copyResult.error}`);
      result.errors.push({ path: filePath, error: copyResult.error || 'Unbekannter Fehler' });
    }

    // Kleine Pause um Rate-Limiting zu vermeiden
    await new Promise(r => setTimeout(r, 100));
  }

  return result;
}

// Haupt-Ausführung
(async () => {
  const startTime = Date.now();
  
  try {
    const result = await migrate();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION ZUSAMMENFASSUNG');
    console.log('='.repeat(60));
    console.log(`   Gesamt Dateien:    ${result.totalFiles}`);
    console.log(`   Kopiert:           ${result.copiedFiles}`);
    console.log(`   Übersprungen:      ${result.skippedFiles}`);
    console.log(`   Fehler:            ${result.errors.length}`);
    console.log(`   Dauer:             ${duration}s`);
    console.log('='.repeat(60));

    if (result.errors.length > 0) {
      console.log('\n❌ FEHLER-DETAILS:');
      result.errors.forEach(({ path, error }) => {
        console.log(`   - ${path}: ${error}`);
      });
    }

    if (result.copiedFiles === result.totalFiles - result.skippedFiles && result.errors.length === 0) {
      console.log('\n✅ Migration erfolgreich abgeschlossen!');
      console.log('   Der Bucket "driver-documents" kann jetzt manuell geleert werden.');
    } else if (result.errors.length > 0) {
      console.log('\n⚠️  Migration mit Fehlern abgeschlossen. Bitte Fehler prüfen.');
      process.exit(1);
    }

  } catch (e) {
    console.error('\n❌ Kritischer Fehler:', e);
    process.exit(1);
  }
})();
