import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ADMIN_EMAIL = 'guenter.killer@t-online.de';
    const adminPassword = Deno.env.get('ADMIN_SECRET_PASSWORD');
    
    if (!adminPassword) {
      throw new Error('ADMIN_SECRET_PASSWORD not configured');
    }

    console.log('Initializing Supabase Admin client...');
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Find the admin user
    console.log(`Looking for admin user: ${ADMIN_EMAIL}`);
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      throw listError;
    }

    const adminUser = users.users.find(u => u.email === ADMIN_EMAIL);
    
    if (!adminUser) {
      console.error('Admin user not found');
      return new Response(
        JSON.stringify({ success: false, error: 'Admin user not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found admin user with ID: ${adminUser.id}`);

    // Reset password using Admin API
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      adminUser.id,
      { password: adminPassword }
    );

    if (updateError) {
      console.error('Error updating password:', updateError);
      throw updateError;
    }

    console.log('Password reset successful');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Admin password reset successfully',
        userId: adminUser.id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Reset password error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});