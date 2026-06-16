const https = require('https');
const fs = require('fs');
const path = require('path');

// Helper to perform HTTP GET request returning body as string
function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => { resolve(data); });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Helper to resolve shortened URLs and follow redirects
function resolveUrl(url) {
  return new Promise((resolve) => {
    if (!url) {
      resolve(null);
      return;
    }
    
    const timeout = setTimeout(() => {
      resolve({ url, error: 'Timeout' });
    }, 10000);

    const request = https.get(url, (res) => {
      clearTimeout(timeout);
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Recursively follow redirect
        resolve(resolveUrl(res.headers.location));
      } else {
        resolve({ url, finalUrl: url });
      }
    });

    request.on('error', (err) => {
      clearTimeout(timeout);
      resolve({ url, error: err.message });
    });
  });
}

// Helper to extract latitude and longitude from Google Maps URLs
function extractCoords(url) {
  if (!url) return null;

  // Pattern 1: Look for !3d<lat>!4d<lng> (very common in place URLs)
  const pattern3d4d = /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/;
  const match3d4d = url.match(pattern3d4d);
  if (match3d4d) {
    return {
      latitude: parseFloat(match3d4d[1]),
      longitude: parseFloat(match3d4d[2]),
      source: '3d4d_pattern'
    };
  }

  // Pattern 2: Look for /@<lat>,<lng>,<zoom>z
  const patternAt = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
  const matchAt = url.match(patternAt);
  if (matchAt) {
    return {
      latitude: parseFloat(matchAt[1]),
      longitude: parseFloat(matchAt[2]),
      source: 'at_pattern'
    };
  }

  // Pattern 3: Look for query parameters q=<lat>,<lng> or ll=<lat>,<lng>
  const patternQuery = /[?&](q|ll)=(-?\d+\.\d+),(-?\d+\.\d+)/;
  const matchQuery = url.match(patternQuery);
  if (matchQuery) {
    return {
      latitude: parseFloat(matchQuery[2]),
      longitude: parseFloat(matchQuery[3]),
      source: 'query_pattern'
    };
  }

  return null;
}

async function main() {
  const apiUrl = 'https://rs.kemkes.go.id/api/v1/hospitals?page=1&per_page=100';
  console.log('Fetching all hospitals from API...');
  
  let apiResponseRaw;
  try {
    apiResponseRaw = await httpGet(apiUrl);
  } catch (err) {
    console.error('Failed to retrieve data from API:', err.message);
    process.exit(1);
  }

  let apiResult;
  try {
    apiResult = JSON.parse(apiResponseRaw);
  } catch (err) {
    console.error('Failed to parse API response as JSON:', err.message);
    process.exit(1);
  }

  if (!apiResult || !apiResult.data) {
    console.error('API did not return data as expected.');
    process.exit(1);
  }

  const hospitals = apiResult.data;
  console.log(`Successfully fetched ${hospitals.length} hospitals. Resolving locations...`);

  const results = [];
  const batchSize = 5;

  for (let i = 0; i < hospitals.length; i += batchSize) {
    const batch = hospitals.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(hospitals.length / batchSize)}...`);
    
    const promises = batch.map(async (hospital) => {
      const hospitalInfo = {
        id: hospital.id,
        hospital_id: hospital.hospital_id,
        name: hospital.name,
        slug: hospital.slug,
        address: hospital.address,
        province: hospital.province?.name || '',
        map_url: hospital.map_url,
        resolved_url: null,
        latitude: null,
        longitude: null,
        coords_source: null,
        status: 'No map URL'
      };

      if (hospital.map_url) {
        try {
          const res = await resolveUrl(hospital.map_url);
          if (res && res.finalUrl) {
            hospitalInfo.resolved_url = res.finalUrl;
            const coords = extractCoords(res.finalUrl);
            if (coords) {
              hospitalInfo.latitude = coords.latitude;
              hospitalInfo.longitude = coords.longitude;
              hospitalInfo.coords_source = coords.source;
              hospitalInfo.status = 'Success';
            } else {
              hospitalInfo.status = 'Could not extract coordinates from resolved URL';
            }
          } else if (res && res.error) {
            hospitalInfo.status = `Resolution error: ${res.error}`;
          }
        } catch (err) {
          hospitalInfo.status = `Resolution exception: ${err.message}`;
        }
      }

      return hospitalInfo;
    });

    const batchResults = await Promise.all(promises);
    results.push(...batchResults);
  }

  const outputPath = path.join(__dirname, 'hospital_coordinates.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  
  console.log('\n======================================');
  console.log(`Scraping complete! Results saved to: ${outputPath}`);
  
  const successCount = results.filter(r => r.status === 'Success').length;
  console.log(`Total hospitals: ${results.length}`);
  console.log(`Successfully resolved coordinates: ${successCount}`);
  console.log(`Failed/No map URL: ${results.length - successCount}`);
  console.log('======================================\n');
}

main().catch(console.error);
