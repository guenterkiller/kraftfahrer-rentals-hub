/**
 * Shared Admin Authentication Helper for Edge Functions
 * 
 * Usage:
 * import { verifyAdminAuth, createCorsHeaders, handleCorsPreflightRequest } from '../_shared/admin-auth.ts';
 * 
 * const corsHeaders = createCorsHeaders();
 * if (req.method === 'OPTIONS') return handleCorsPreflightRequest(corsHeaders);
 * 
 * const authResult = await verifyAdminAuth(req);
 * if (!authResult.success) return authResult.response;
 * const { user, supabase } = authResult;
 */

import { createClient, SupabaseClient, User } from "https://esm.sh/@supabase/supabase-js@2.52.0";

export interface AdminAuthResult {
  success: true;
  user: User;
  supabase: SupabaseClient;
}

export interface AdminAuthError {
  success: false;
  response: Response;
}

export type AdminAuthResponse = AdminAuthResult | AdminAuthError;

/**
 * Creates standard CORS headers for Edge Functions
 */
export function createCorsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

/**
 * Handles CORS preflight requests
 */
export function handleCorsPreflightRequest(corsHeaders: Record<string, string>): Response {
  return new Response(null, { headers: corsHeaders });
}

/**
 * Creates a JSON error response with CORS headers
 */
export function createErrorResponse(
  message: string, 
  status: number, 
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({ success: false, error: message }),
    { 
      status, 
      headers: { 'Content-Type': 'application/json', ...corsHeaders } 
    }
  );
}

/**
 * Verifies admin authentication from request
 * 
 * 1. Extracts JWT from Authorization header
 * 2. Validates the JWT with Supabase Auth
 * 3. Checks user_roles table for 'admin' role
 * 
 * @returns AdminAuthResult on success, AdminAuthError on failure
 */
export async function verifyAdminAuth(req: Request): Promise<AdminAuthResponse> {
  const corsHeaders = createCorsHeaders();
  
  // 1) Extract JWT from Authorization header
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('Missing or invalid Authorization header');
    return {
      success: false,
      response: createErrorResponse('Unauthorized - Missing token', 401, corsHeaders)
    };
  }

  const token = authHeader.replace('Bearer ', '');

  // 2) Create Supabase client with service role
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase configuration');
    return {
      success: false,
      response: createErrorResponse('Server configuration error', 500, corsHeaders)
    };
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // 3) Verify the JWT and get user
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    console.error('Invalid token:', authError?.message);
    return {
      success: false,
      response: createErrorResponse('Invalid or expired token', 401, corsHeaders)
    };
  }

  // 4) Verify admin role in user_roles table
  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .maybeSingle();

  if (roleError || !roleData) {
    console.error('User is not an admin:', user.id);
    return {
      success: false,
      response: createErrorResponse('Forbidden - Admin access required', 403, corsHeaders)
    };
  }

  console.log('✅ Admin verified:', user.email);

  return {
    success: true,
    user,
    supabase
  };
}

/**
 * Logs an admin action to the admin_actions table
 */
export async function logAdminAction(
  supabase: SupabaseClient,
  action: string,
  adminEmail: string | undefined,
  options?: {
    jobId?: string;
    assignmentId?: string;
    note?: string;
  }
): Promise<void> {
  try {
    await supabase.from('admin_actions').insert({
      action,
      admin_email: adminEmail,
      job_id: options?.jobId || null,
      assignment_id: options?.assignmentId || null,
      note: options?.note || null
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
}
