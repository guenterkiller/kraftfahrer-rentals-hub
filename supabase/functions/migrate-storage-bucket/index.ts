/**
 * Einmalige Migration: Kopiert alle Dateien von "driver-documents" nach "fahrer-dokumente"
 * 
 * Aufruf: POST /migrate-storage-bucket mit Header x-admin-secret
 * 
 * WICHTIG: Nach erfolgreicher Migration diese Function löschen!
 */
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const SOURCE_BUCKET = 'driver-documents';
const TARGET_BUCKET = 'fahrer-dokumente';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface MigrationResult {
  totalFiles: number;
  copiedFiles: number;
  skippedFiles: number;
  errors: Array<{ path: string; error: string }>;
  details: string[];
}

async function listAllFiles(
  supabase: ReturnType<typeof createClient>,
  bucket: string,
  folder: string = ''
): Promise<string[]> {
  const allPaths: string[] = [];
  
  const { data, error } = await supabase.storage.from(bucket).list(folder, {
    limit: 1000,
    sortBy: { column: 'name', order: 'asc' }
  });

  if (error) {
    console.error(`Error listing ${bucket}/${folder}:`, error.message);
    return allPaths;
  }

  if (!data || data.length === 0) {
    return allPaths;
  }

  for (const item of data) {
    const fullPath = folder ? `${folder}/${item.name}` : item.name;
    
    if (item.id === null) {
      // It's a folder - recurse
      const subFiles = await listAllFiles(supabase, bucket, fullPath);
      allPaths.push(...subFiles);
    } else {
      // It's a file
      allPaths.push(fullPath);
    }
  }

  return allPaths;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Auth check - require a special migration token for this one-time operation
  // This is a one-time migration function, so we use a simple approach
  const migrationToken = req.headers.get('x-migration-token');
  const expectedToken = 'migrate-driver-docs-2026';
  
  if (migrationToken !== expectedToken) {
    console.log('Migration auth failed');
    return new Response(JSON.stringify({ 
      error: 'Unauthorized - provide x-migration-token header' 
    }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  console.log('Migration authorized, starting...');

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const result: MigrationResult = {
    totalFiles: 0,
    copiedFiles: 0,
    skippedFiles: 0,
    errors: [],
    details: []
  };

  try {
    console.log('🚀 Starting migration from driver-documents to fahrer-dokumente...');
    result.details.push('Starting migration...');

    // 1. List all files in source bucket
    const files = await listAllFiles(supabase, SOURCE_BUCKET);
    result.totalFiles = files.length;
    result.details.push(`Found ${files.length} files in source bucket`);

    if (files.length === 0) {
      result.details.push('No files to migrate');
      return new Response(JSON.stringify({ success: true, result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 2. Copy each file
    for (const filePath of files) {
      try {
        console.log(`Processing: ${filePath}`);
        
        // Download from source
        const { data: fileData, error: downloadError } = await supabase.storage
          .from(SOURCE_BUCKET)
          .download(filePath);

        if (downloadError || !fileData) {
          result.errors.push({ path: filePath, error: downloadError?.message || 'Download failed' });
          continue;
        }

        // Determine content type
        const ext = filePath.split('.').pop()?.toLowerCase() || '';
        const mimeTypes: Record<string, string> = {
          'pdf': 'application/pdf',
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'webp': 'image/webp'
        };
        const contentType = mimeTypes[ext] || 'application/octet-stream';

        // Upload to target (upsert: false to avoid overwriting)
        const { error: uploadError } = await supabase.storage
          .from(TARGET_BUCKET)
          .upload(filePath, fileData, {
            contentType,
            upsert: false
          });

        if (uploadError) {
          if (uploadError.message.includes('already exists') || uploadError.message.includes('Duplicate')) {
            result.skippedFiles++;
            result.details.push(`⏭️ Skipped (exists): ${filePath}`);
          } else {
            result.errors.push({ path: filePath, error: uploadError.message });
            result.details.push(`❌ Error: ${filePath} - ${uploadError.message}`);
          }
        } else {
          result.copiedFiles++;
          result.details.push(`✅ Copied: ${filePath}`);
        }

      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        result.errors.push({ path: filePath, error: msg });
        result.details.push(`❌ Error: ${filePath} - ${msg}`);
      }
    }

    console.log('Migration complete:', result);

    return new Response(JSON.stringify({ 
      success: result.errors.length === 0,
      result 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('Migration failed:', msg);
    return new Response(JSON.stringify({ 
      success: false, 
      error: msg,
      result 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
