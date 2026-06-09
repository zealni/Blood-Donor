// ============================================================================
// Geo Utilities & Province Data
// Shared across MapComponent, radar/donor, radar/seeker, profile
// ============================================================================

/**
 * Province slug → short display name mapping.
 * Used in PMI stock widget, province dropdowns, and map detection.
 */
export const provinceShortNames: Record<string, string> = {
  "yogyakarta": "DIY",
  "aceh": "ACEH",
  "sumatera-utara": "SUMUT",
  "sumatera-barat": "SUMBAR",
  "riau": "RIAU",
  "kepulauan-riau": "KEPRI",
  "jambi": "JAMBI",
  "bengkulu": "BENGKULU",
  "sumatera-selatan": "SUMSEL",
  "bangka-belitung": "BABEL",
  "lampung": "LAMPUNG",
  "banten": "BANTEN",
  "dki-jakarta": "DKI JAKARTA",
  "jawa-barat": "JABAR",
  "jawa-tengah": "JATENG",
  "jawa-timur": "JATIM",
  "bali": "BALI",
  "nusa-tenggara-barat": "NTB",
  "nusa-tenggara-timur": "NTT",
  "kalimantan-barat": "KALBAR",
  "kalimantan-tengah": "KALTENG",
  "kalimantan-selatan": "KALSEL",
  "kalimantan-timur": "KALTIM",
  "kalimantan-utara": "KALTARA",
  "sulawesi-utara": "SULUT",
  "gorontalo": "GORONTALO",
  "sulawesi-tengah": "SULTENG",
  "sulawesi-barat": "SULBAR",
  "sulawesi-selatan": "SULSEL",
  "sulawesi-tenggara": "SULTRA",
  "maluku": "MALUKU",
  "maluku-utara": "MALUT",
  "papua-barat": "PAPUA BARAT",
  "papua": "PAPUA",
  "papua-tengah": "PAPUA TENGAH",
  "papua-pegunungan": "PAPUA PEG.",
  "papua-selatan": "PAPUA SELATAN",
  "papua-barat-daya": "PAPUA B.D.",
};

/**
 * Province slug → [latitude, longitude] center coordinates.
 * Used for map centering, stock filtering by proximity, and profile location.
 */
export const provinceCenters: Record<string, [number, number]> = {
  "yogyakarta": [-7.795, 110.369],
  "aceh": [5.548, 95.323],
  "sumatera-utara": [3.595, 98.672],
  "sumatera-barat": [-0.947, 100.417],
  "riau": [0.507, 101.447],
  "kepulauan-riau": [0.914, 104.498],
  "jambi": [-1.610, 103.613],
  "bengkulu": [-3.793, 102.260],
  "sumatera-selatan": [-2.990, 104.756],
  "bangka-belitung": [-2.130, 106.116],
  "lampung": [-5.397, 105.266],
  "banten": [-6.120, 106.150],
  "dki-jakarta": [-6.208, 106.845],
  "jawa-barat": [-6.917, 107.619],
  "jawa-tengah": [-7.005, 110.438],
  "jawa-timur": [-7.257, 112.752],
  "bali": [-8.409, 115.188],
  "nusa-tenggara-barat": [-8.572, 116.324],
  "nusa-tenggara-timur": [-10.177, 123.607],
  "kalimantan-barat": [-0.026, 109.342],
  "kalimantan-tengah": [-2.216, 113.921],
  "kalimantan-selatan": [-3.319, 114.590],
  "kalimantan-timur": [-0.502, 117.153],
  "kalimantan-utara": [3.313, 117.636],
  "sulawesi-utara": [1.474, 124.840],
  "gorontalo": [0.543, 123.056],
  "sulawesi-tengah": [-0.897, 119.870],
  "sulawesi-barat": [-2.677, 118.892],
  "sulawesi-selatan": [-5.147, 119.432],
  "sulawesi-tenggara": [-3.978, 122.514],
  "maluku": [-3.695, 128.181],
  "maluku-utara": [0.785, 127.376],
  "papua-barat": [-0.861, 134.062],
  "papua": [-2.541, 140.718],
  "papua-tengah": [-3.376, 135.500],
  "papua-pegunungan": [-4.095, 138.950],
  "papua-selatan": [-8.490, 140.400],
  "papua-barat-daya": [-0.880, 131.250],
};

/**
 * Haversine formula — calculate distance between two lat/lng coordinates in km.
 */
export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Parse PostGIS WKB hex-encoded POINT to [lat, lng].
 * Handles both with and without SRID prefix.
 */
export function parseWkbHexPoint(hex: string): [number, number] | null {
  if (!hex || typeof hex !== "string") return null;
  try {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    const view = new DataView(bytes.buffer);
    const isLittleEndian = bytes[0] === 1;
    const type = view.getUint32(1, isLittleEndian);
    const hasSRID = (type & 0x20000000) !== 0;
    const xOffset = hasSRID ? 9 : 5;
    const x = view.getFloat64(xOffset, isLittleEndian);
    const y = view.getFloat64(xOffset + 8, isLittleEndian);
    return [y, x]; // [lat, lng]
  } catch (err) {
    console.error("Error parsing WKB hex point:", err);
    return null;
  }
}

/**
 * Deterministic "baseline" blood stock numbers for a province.
 * Used to simulate PMI stock data before real API integration.
 */
export function getProvinceBaseline(provKey: string): { A: number; B: number; O: number; AB: number } {
  let hash = 0;
  for (let i = 0; i < provKey.length; i++) {
    hash = provKey.charCodeAt(i) + ((hash << 5) - hash);
  }
  const a = Math.abs(hash % 40) + 10;
  const b = Math.abs((hash >> 2) % 30) + 8;
  const o = Math.abs((hash >> 4) % 60) + 20;
  const ab = Math.abs((hash >> 6) % 15) + 3;
  return { A: a, B: b, O: o, AB: ab };
}

/**
 * Match a free-text province name to a province slug key.
 * Used by reverse geocoding and session location matching.
 */
export function matchProvince(name: string): string | null {
  if (!name) return null;
  const clean = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const key of Object.keys(provinceShortNames)) {
    const cleanKey = key.replace(/[^a-z0-9]/g, "");
    if (clean.includes(cleanKey) || cleanKey.includes(clean)) {
      return key;
    }
  }
  if (clean.includes("jogja") || clean.includes("yogyakarta") || clean.includes("diy")) return "yogyakarta";
  if (clean.includes("jakarta")) return "dki-jakarta";
  if (clean.includes("belitung")) return "bangka-belitung";
  return null;
}
