import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

serve(async (req) => {
  console.log(`Document preview request: ${req.method}`);
  
  if (req.method === 'OPTIONS') {
    return new Response('', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // Service role for server-side operations
    );

    const { filepath, ttl = 600 } = await req.json();
    
    console.log(`Creating signed URL for: ${filepath}, TTL: ${ttl}s`);

    if (!filepath) {
      throw new Error('filepath is required');
    }

    // Create signed URL using service role with fallback bucket
    let signedData: { signedUrl: string } | null = null;

    // Try primary bucket 'fahrer-dokumente'
    const primary = await supabase.storage
      .from('fahrer-dokumente')
      .createSignedUrl(filepath, ttl);

    if (primary.error) {
      console.error('Primary bucket error, trying fallback:', primary.error);
      const fallback = await supabase.storage
        .from('driver-documents')
        .createSignedUrl(filepath, ttl);
      
      if (fallback.error) {
        console.error('Fallback bucket error:', fallback.error);
        throw fallback.error;
      }
      signedData = fallback.data as { signedUrl: string };
    } else {
      signedData = primary.data as { signedUrl: string };
    }

    console.log('Signed URL created successfully');

    return new Response(JSON.stringify({
      success: true,
      signedUrl: signedData!.signedUrl
    }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      }
    });

  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('Preview error:', msg);
    return new Response(JSON.stringify({ 
      success: false, 
      error: msg 
    }), {
      status: 400,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      }
    });
  }
});