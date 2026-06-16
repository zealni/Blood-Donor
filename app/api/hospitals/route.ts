import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// In-memory cache to avoid reading 952KB file from disk on every API call
let cachedHospitals: any[] = [];

function loadHospitalsData(): any[] {
  if (cachedHospitals.length > 0) return cachedHospitals;

  const filePath = path.join(process.cwd(), 'lib/data/indonesia_hospitals.json');
  if (!fs.existsSync(filePath)) {
    throw new Error('Hospitals data file not found');
  }

  const fileData = fs.readFileSync(filePath, 'utf8');
  cachedHospitals = JSON.parse(fileData);
  return cachedHospitals;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  
  try {
    const hospitals = loadHospitalsData();
    
    // Support coordinate reverse-lookup (snapping to nearest hospital)
    const latParam = searchParams.get('lat');
    const lngParam = searchParams.get('lng');
    if (latParam && lngParam) {
      const lat = parseFloat(latParam);
      const lng = parseFloat(lngParam);
      if (!isNaN(lat) && !isNaN(lng)) {
        let closest = null;
        let minDistance = Infinity;
        for (const h of hospitals) {
          const d = Math.pow(h.latitude - lat, 2) + Math.pow(h.longitude - lng, 2);
          if (d < minDistance) {
            minDistance = d;
            closest = h;
          }
        }
        return NextResponse.json(closest);
      }
    }

    const allParam = searchParams.get('all');
    if (allParam === 'true') {
      return NextResponse.json(hospitals);
    }
    
    if (!query || query.trim() === '') {
      return NextResponse.json(hospitals.slice(0, 10)); // Return first 10 by default
    }
    
    const lowerQuery = query.toLowerCase();
    const filtered = hospitals.filter((h: any) => 
      h.nama.toLowerCase().includes(lowerQuery) || 
      (h.wilayah && h.wilayah.toLowerCase().includes(lowerQuery)) ||
      (h.alamat && h.alamat.toLowerCase().includes(lowerQuery))
    );
    
    // Sort results to prioritize hospitals starting with the query, then containing the query
    filtered.sort((a: any, b: any) => {
      const aName = a.nama.toLowerCase();
      const bName = b.nama.toLowerCase();
      const aStarts = aName.startsWith(lowerQuery);
      const bStarts = bName.startsWith(lowerQuery);
      
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return aName.localeCompare(bName);
    });
    
    return NextResponse.json(filtered.slice(0, 10)); // Limit to top 10 results
  } catch (error: any) {
    console.error('Error reading hospitals data:', error);
    return NextResponse.json({ error: 'Failed to load hospitals data' }, { status: 500 });
  }
}
