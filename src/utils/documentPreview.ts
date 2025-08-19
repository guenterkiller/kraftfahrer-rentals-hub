import { supabase } from "@/integrations/supabase/client";

export async function getSignedPreview(path: string, ttl = 60): Promise<string> {
  const { data, error } = await supabase.storage
    .from("fahrer-dokumente")
    .createSignedUrl(path, ttl);
    
  if (error) {
    throw error;
  }
  
  return data.signedUrl;
}