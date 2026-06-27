import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Simple in-memory rate limiter (resets on cold start / serverless spin-up)
// For production scale, use @upstash/ratelimit with Redis instead.
const requestCounts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 60;       // max requests per window
const RATE_WINDOW_MS = 60_000; // 1 minute window

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = requestCounts.get(ip);

  if (!entry || now > entry.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true; // allowed
  }

  if (entry.count >= RATE_LIMIT) return false; // blocked

  entry.count++;
  return true; // allowed
}

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
  // ── Rate limiting ──────────────────────────────────────────────────────────
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': '60' },
      }
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  try {
    const hospitals = loadHospitalsData();

    // Support coordinate reverse-lookup (snapping to nearest hospital)
    const latParam = searchParams.get('lat');
    const lngParam = searchParams.get('lng');
    const nearbyParam = searchParams.get('nearby');
    const limitParam = searchParams.get('limit');

    if (latParam && lngParam) {
      const lat = parseFloat(latParam);
      const lng = parseFloat(lngParam);
      if (!isNaN(lat) && !isNaN(lng)) {

        // nearby=true: Return N nearest hospitals for the map inactive-hospital overlay
        if (nearbyParam === 'true') {
          const limit = Math.min(parseInt(limitParam || '40', 10), 100); // Hard cap at 100
          // Filter to a rough bounding box first (~50km) to avoid scanning all 2920 records
          const BBOX = 0.45; // ~50km
          const nearby = hospitals
            .filter((h: any) =>
              Math.abs(h.latitude - lat) < BBOX && Math.abs(h.longitude - lng) < BBOX
            )
            .map((h: any) => ({
              ...h,
              _d: Math.pow(h.latitude - lat, 2) + Math.pow(h.longitude - lng, 2),
            }))
            .sort((a: any, b: any) => a._d - b._d)
            .slice(0, limit)
            .map(({ _d, ...h }: any) => h); // Strip internal _d field
          return NextResponse.json(nearby);
        }

        // Default: single closest hospital (reverse-lookup / snapping)
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
    // Log full error server-side only, return generic message to client
    console.error('Error reading hospitals data:', error);
    return NextResponse.json(
      { error: 'Failed to load hospital data.' },
      { status: 500 }
    );
  }
}
