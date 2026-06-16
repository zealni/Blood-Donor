const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xavjrmgfsxmpocyfmsog.supabase.co';
const supabaseKey = 'sb_publishable_HnvtRIH6XHtQNFzFcvF_HA_0Wy_czFq';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('Querying blood_requests...');
  const { data: requests, error: reqErr } = await supabase
    .from('blood_requests')
    .select('id, hospital_name, status, hospital_coord');
  
  if (reqErr) {
    console.error('Error fetching requests:', reqErr.message);
  } else {
    console.log(`Found ${requests.length} total blood requests:`);
    requests.forEach(r => {
      console.log(`- [${r.status}] ${r.hospital_name} (coords: ${JSON.stringify(r.hospital_coord)})`);
    });
  }

  console.log('\nQuerying profiles...');
  const { data: profiles, error: profErr } = await supabase
    .from('profiles')
    .select('id, full_name, is_available, location');

  if (profErr) {
    console.error('Error fetching profiles:', profErr.message);
  } else {
    console.log(`Found ${profiles.length} total profiles:`);
    profiles.forEach(p => {
      console.log(`- [avail: ${p.is_available}] ${p.full_name} (location: ${JSON.stringify(p.location)})`);
    });
  }
}

check();
