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
    // 1) Extract and validate JWT from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid Authorization header');
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // 2) Create Supabase client with service role for admin operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 3) Verify the JWT and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      console.error('Invalid token:', authError?.message);
      return new Response(JSON.stringify({ success: false, error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 4) Verify admin role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
      console.error('User is not an admin:', user.id);
      return new Response(JSON.stringify({ success: false, error: 'Forbidden - Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 5) Parse request body
    const { filepath, ttl = 60 } = await req.json(); // Reduced TTL to 60 seconds
    
    console.log(`Creating signed URL for: ${filepath}, TTL: ${ttl}s, Admin: ${user.id}`);

    if (!filepath) {
      return new Response(JSON.stringify({ success: false, error: 'filepath is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 6) Validate filepath format to prevent directory traversal
    // Expected format: {uuid}/{doctype}/{uuid}.{ext}
    const validPathPattern = /^[a-f0-9-]+\/[a-z_-]+\/[a-f0-9-]+\.(jpg|jpeg|png|pdf|webp)$/i;
    if (!validPathPattern.test(filepath)) {
      console.error('Invalid filepath format:', filepath);
      return new Response(JSON.stringify({ success: false, error: 'Invalid filepath format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 7) Create signed URL using service role with correct bucket priority
    let signedData: { signedUrl: string } | null = null;

    // Try 'driver-documents' bucket first (where files are currently stored)
    const primary = await supabase.storage
      .from('driver-documents')
      .createSignedUrl(filepath, ttl);

    if (primary.error) {
      console.error('Primary bucket (driver-documents) error, trying fallback:', primary.error);
      const fallback = await supabase.storage
        .from('fahrer-dokumente')
        .createSignedUrl(filepath, ttl);
      
      if (fallback.error) {
        console.error('Fallback bucket (fahrer-dokumente) error:', fallback.error);
        return new Response(JSON.stringify({ success: false, error: 'File not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      signedData = fallback.data as { signedUrl: string };
    } else {
      signedData = primary.data as { signedUrl: string };
    }

    // 8) Log document access for audit trail
    await supabase.from('admin_actions').insert({
      action: 'document_preview_access',
      admin_email: user.email,
      note: `Accessed document: ${filepath.substring(0, 50)}...`
    });

    console.log('Signed URL created successfully, bucket:', primary.error ? 'fahrer-dokumente' : 'driver-documents');

    return new Response(JSON.stringify({
      success: true,
      signedUrl: signedData!.signedUrl
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('Preview error:', msg);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
