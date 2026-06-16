const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const supabaseUrl = 'https://xavjrmgfsxmpocyfmsog.supabase.co';
const supabaseKey = 'sb_publishable_HnvtRIH6XHtQNFzFcvF_HA_0Wy_czFq';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Loading hospital database...');
  const hospitals = JSON.parse(fs.readFileSync(path.join(__dirname, '../lib/data/indonesia_hospitals.json'), 'utf8'));
  console.log(`Loaded ${hospitals.length} hospitals.`);

  const maleNames = [
    "Budi Santoso", "Andi Wijaya", "Agus Setiawan", "Rian Hidayat", "Eko Prasetyo",
    "Hendra Wijaya", "Yusuf Pratama", "Doni Gunawan", "Ahmad Fauzi", "Rudi Hermawan",
    "Taufik Hidayat", "Adi Putera", "Bambang Pamungkas", "Giri Wardhana", "Satria Utama",
    "Reza Rahadian", "Aris Munandar", "Dimas Anggara", "Fajar Nugraha", "Gilang Dirga",
    "Heri Kusuma", "Irfan Bachdim", "Joko Widodo", "Kurniawan Dwi Yulianto", "Lukman Sardi",
    "Aditya Pratama", "Bayu Saputra", "Chandra Wijaya", "Dedi Kurniawan", "Eka Saputra"
  ];

  const femaleNames = [
    "Siti Aminah", "Rina Kartika", "Dewi Lestari", "Santi Rahayu", "Sri Wahyuni",
    "Indah Permatasari", "Mega Lestari", "Dian Sastrowardoyo", "Ani Yudhoyono", "Putri Lestari",
    "Fitriani Hasan", "Ratih Kumala", "Sari Indah", "Novi Anggraini", "Wulan Guritno",
    "Chelsea Islan", "Laudya Cynthia Bella", "Maudy Ayunda", "Pevita Pearce", "Raisa Andriana",
    "Sherina Munaf", "Yuni Shara", "Zaskia Adya Mecca", "Aura Kasih", "Gisella Anastasia",
    "Anisa Rahma", "Bella Shofie", "Citra Kirana", "Dian Pelangi", "Esti Purwanti"
  ];

  const names = [...maleNames, ...femaleNames];
  const bloodTypes = ['A', 'B', 'O', 'AB'];
  const urgencies = ['Kritis', 'Tinggi', 'Sedang'];

  try {
    // 1. Delete all current requests (status open)
    console.log('Deleting all current blood requests...');
    const { error: delReqErr } = await supabase.from('blood_requests').delete().neq('status', 'expired');
    if (delReqErr) console.error('Error deleting requests:', delReqErr.message);
    else console.log('Successfully cleared blood_requests table.');
    
    // 2. Delete all profiles (except System)
    console.log('Deleting all profiles...');
    const { error: delProfErr } = await supabase.from('profiles').delete().neq('full_name', 'System');
    if (delProfErr) console.error('Error deleting profiles:', delProfErr.message);
    else console.log('Successfully cleared profiles table.');

    // 3. Generate data for all 2,906 hospitals with valid coordinates
    console.log('Generating active signals for all hospitals with valid coordinates...');
    const seekersList = [];
    const donorsList = [];

    hospitals.forEach((hospital) => {
      // Validate coordinates to avoid geometry parse errors
      if (
        typeof hospital.latitude !== 'number' || 
        typeof hospital.longitude !== 'number' || 
        isNaN(hospital.latitude) || 
        isNaN(hospital.longitude)
      ) {
        return; // skip invalid coordinate entry
      }

      const isSeeker = Math.random() < 0.4; // 40% seekers, 60% donors
      const bloodType = bloodTypes[Math.floor(Math.random() * bloodTypes.length)];
      const rhesus = Math.random() > 0.1 ? '+' : '-'; // 90% positive, 10% negative

      if (isSeeker) {
        const bags = Math.floor(Math.random() * 3) + 1; // 1 to 3 bags
        const urgency = urgencies[Math.floor(Math.random() * urgencies.length)];
        
        // Random offset from 5 minutes to 24 hours ago
        const offsetMs = Math.floor(5 * 60 * 1000 + Math.random() * (24 * 60 * 60 * 1000 - 5 * 60 * 1000));
        const createdAt = new Date(Date.now() - offsetMs).toISOString();

        seekersList.push({
          hospital_name: hospital.nama,
          hospital_coord: `POINT(${hospital.longitude} ${hospital.latitude})`,
          blood_type: bloodType,
          rhesus: rhesus,
          bags_needed: bags,
          urgency: urgency,
          status: 'open',
          created_at: createdAt
        });
      } else {
        const baseName = names[Math.floor(Math.random() * names.length)];
        const cleanHospitalName = hospital.nama.replace(/(RS|RSU|RSUD|UPT|KOTA|PROVINSI)\s+/gi, '').trim();
        const fullName = `${baseName} (Siaga RS ${cleanHospitalName})`;

        donorsList.push({
          id: crypto.randomUUID(),
          full_name: fullName,
          blood_type: bloodType,
          rhesus: rhesus,
          is_available: true,
          location: `POINT(${hospital.longitude} ${hospital.latitude})`,
          last_donation: null
        });
      }
    });

    // 4. Batch insert seekers
    console.log(`Inserting ${seekersList.length} blood requests in batches...`);
    const batchSize = 500;
    for (let i = 0; i < seekersList.length; i += batchSize) {
      const batch = seekersList.slice(i, i + batchSize);
      const { error: insErr } = await supabase.from('blood_requests').insert(batch);
      if (insErr) {
        console.error(`Error inserting requests batch at index ${i}:`, insErr.message);
      } else {
        console.log(`Inserted requests batch: index ${i} to ${i + batch.length}`);
      }
    }

    // 5. Batch insert donors
    console.log(`Inserting ${donorsList.length} profiles in batches...`);
    for (let i = 0; i < donorsList.length; i += batchSize) {
      const batch = donorsList.slice(i, i + batchSize);
      const { error: insErr } = await supabase.from('profiles').insert(batch);
      if (insErr) {
        console.error(`Error inserting profiles batch at index ${i}:`, insErr.message);
      } else {
        console.log(`Inserted profiles batch: index ${i} to ${i + batch.length}`);
      }
    }

    console.log('\n======================================');
    console.log('Database Seeding Completed Successfully!');
    console.log(`Generated signals for all ${hospitals.length - 14} valid coordinate hospitals.`);
    console.log(`Summary: ${seekersList.length} Seekers, ${donorsList.length} Donors.`);
    console.log('======================================\n');

  } catch (e) {
    console.error('Exception during seeding:', e.message);
  }
}

run();
