const fs = require('fs');
const path = require('path');

async function download() {
  console.log('Downloading real hospital database from Pusdatin Kemenkes...');
  try {
    const res = await fetch('https://raw.githubusercontent.com/zakiego/data-pusdatin-kemenkes/master/rumah_sakit.csv');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const csvText = await res.text();
    
    console.log('Parsing CSV...');
    const lines = csvText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const headers = parseCSVLine(lines[0]);
    
    const hospitals = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length < headers.length) continue;
      
      const hospital = {};
      headers.forEach((header, index) => {
        let val = values[index];
        if (header === 'lokasi.lat' || header === 'lokasi.lon') {
          val = parseFloat(val);
        } else if (header === 'tempat_tidur') {
          val = parseInt(val, 10) || 0;
        }
        
        // Map header names to clean keys
        const cleanHeader = header === 'lokasi.lat' ? 'latitude' : (header === 'lokasi.lon' ? 'longitude' : header);
        hospital[cleanHeader] = val;
      });
      hospitals.push(hospital);
    }
    
    const outputPath = path.join(__dirname, 'indonesia_hospitals.json');
    fs.writeFileSync(outputPath, JSON.stringify(hospitals, null, 2));
    console.log(`Success! Saved ${hospitals.length} hospitals to ${outputPath}`);
  } catch (error) {
    console.error('Download/parse failed:', error);
  }
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

download();
