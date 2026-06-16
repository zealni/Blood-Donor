const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xavjrmgfsxmpocyfmsog.supabase.co';
const supabaseKey = 'sb_publishable_HnvtRIH6XHtQNFzFcvF_HA_0Wy_czFq';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  try {
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    if (error) {
      console.log('CONNECTION ERROR:', error.message);
    } else {
      console.log('SUCCESS! Connection works. Data:', data);
    }
  } catch (e) {
    console.log('EXCEPTION:', e.message);
  }
}

run();
