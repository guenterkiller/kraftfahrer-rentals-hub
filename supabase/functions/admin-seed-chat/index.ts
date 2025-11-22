import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Insert seed messages
    const seedMessages = [
      {
        user_name: 'Tom K.',
        message: 'Servus zusammen, steh gerade am Autohof Geiselwind, alles voll wie immer. Jemand noch hier unterwegs? Kaffee ist wenigstens heiß 😅',
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        user_name: 'Micha S.',
        message: 'Kurze Frage: Weiß jemand, ob die A3 Baustelle hinter Würzburg heute offen ist? War letzte Woche Horror…',
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      },
      {
        user_name: 'Alex M.',
        message: 'Hi zusammen, mach gerade 45er Pause an der A6 Richtung Mannheim. Jemand in der Ecke? Wetter ist voll am Umkippen.',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        user_name: 'Ralf B.',
        message: 'Kleiner Tipp: Autohof Sittensen hat neue Duschen, echt sauber geworden. Kann man empfehlen 👍',
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      },
      {
        user_name: 'Benno H.',
        message: 'Moin, wie läuft bei euch der Tag? Hab heute 3x ewig aufs Tor warten müssen. Montag halt… 🤦‍♂️',
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      }
    ];

    const { data, error } = await supabaseClient
      .from('trucker_chat_messages')
      .insert(seedMessages)
      .select();

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, messages: data }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error seeding chat:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
