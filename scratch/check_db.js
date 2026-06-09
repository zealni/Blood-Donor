const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env.local', 'utf-8');
const envVars = {};
env.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length === 2) {
    envVars[parts[0].trim()] = parts[1].trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const tableNames = ['blood_stock', 'blood_stocks', 'pmi_stock', 'pmi_stocks', 'pmi_blood_stock', 'pmi_blood_stocks', 'stocks', 'stock'];
  for (const name of tableNames) {
    try {
      const { data, error } = await supabase.from(name).select('*').limit(1);
      if (error) {
        console.log(`Table '${name}' error:`, error.message);
      } else {
        console.log(`Table '${name}' EXISTS! Data:`, data);
      }
    } catch (e) {
      console.log(`Table '${name}' threw exception:`, e.message);
    }
  }
}

run();
