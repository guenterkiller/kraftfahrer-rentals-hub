import { supabase } from "@/integrations/supabase/client";

export async function getSignedPreview(path: string, ttl = 600): Promise<string> {
  const { data, error } = await supabase.functions.invoke('get-document-preview', {
    body: { filepath: path, ttl }
  });
    
  if (error) {
    throw error;
  }
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to create signed URL');
  }
  
  return data.signedUrl;
}