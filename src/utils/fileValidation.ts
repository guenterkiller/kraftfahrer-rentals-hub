// File validation utilities for driver registration
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export function validateFiles(files: File[]): string[] {
  const errors: string[] = [];
  
  for (const file of files) {
    // Check MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      errors.push(`„${file.name}": nur JPG/PNG/PDF erlaubt.`);
      continue;
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`„${file.name}": größer als 10 MB.`);
      continue;
    }
    
    // Check file extension
    if (!/\.(jpe?g|png|pdf)$/i.test(file.name)) {
      errors.push(`„${file.name}": unzulässige Dateiendung.`);
      continue;
    }
    
    // File is valid
    errors.push(`„${file.name}": ✓ OK`);
  }
  
  return errors;
}

export function safeName(name: string): string {
  const parts = name.toLowerCase().split(/\.(?=[^.]+$)/);
  const base = (parts[0] ?? '').replace(/\s+/g, '_').replace(/[^a-z0-9._-]/g, '');
  const ext = (parts[1] ?? '').replace(/[^a-z0-9]/g, '');
  return `${base}.${ext}`;
}

export async function uploadViaEdge(
  file: File, 
  fahrerId: string, 
  typ: 'fuehrerschein' | 'fahrerkarte' | 'zertifikat'
): Promise<{ success: true; path: string; url: string | null }> {
  const fd = new FormData();
  fd.append("fahrer_id", fahrerId);
  fd.append("dokument_typ", typ);
  fd.append("file", file, safeName(file.name));

  const url = `https://hxnabnsoffzevqhruvar.supabase.co/functions/v1/upload-fahrer-dokumente`;
  const res = await fetch(url, { method: "POST", body: fd });
  const json = await res.json();
  
  if (!res.ok || !json.success) {
    const detail = typeof json.error === 'string' ? json.error : JSON.stringify(json.error);
    throw new Error(detail || "Upload fehlgeschlagen");
  }
  
  return json as { success: true; path: string; url: string | null };
}