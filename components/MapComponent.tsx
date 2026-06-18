"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, CircleMarker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Filter, Crosshair, Search, RotateCcw, ShieldAlert, Check, Map as MapIcon, Globe, Heart, Phone } from 'lucide-react';
import { useLanguage } from './LanguageProvider';
import { createClient } from '../lib/supabase/client';
import { 
  provinceShortNames, 
  matchProvince, 
  getDistance, 
  parseWkbHexPoint 
} from '../lib/geo';

// Custom icons using HTML to keep the pulsing effect
const createCustomIcon = (type: 'seeker' | 'donor' | 'user' | 'selected') => {
  let color = 'ef4444'; // Red for seeker (Tailwind red-500)
  if (type === 'donor') color = '10b981'; // Green for donor (Tailwind emerald-500)
  if (type === 'user') color = '3b82f6'; // Blue for active user location (Tailwind blue-500)
  if (type === 'selected') color = 'f59e0b'; // Amber for selected hospital pin
  
  const size = type === 'user' || type === 'selected' ? 28 : 24;
  const innerSize = type === 'user' || type === 'selected' ? 16 : 14;
  const margin = type === 'user' || type === 'selected' ? 6 : 5;
  
  // Only seekers (people needing blood donors) pulse to draw attention and optimize performance
  const showPulse = type === 'seeker';
  
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `
      <div style="position: relative; width: ${size}px; height: ${size}px;">
        ${showPulse ? `<span style="position: absolute; inset: 0; border-radius: 50%; opacity: 0.75; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; background-color: #${color};"></span>` : ''}
        <span style="position: relative; display: flex; align-items: center; justify-content: center; width: ${innerSize}px; height: ${innerSize}px; margin: ${margin}px; border-radius: 50%; background-color: #${color}; box-shadow: 0 0 10px rgba(0,0,0,0.5); border: 2px solid white;"></span>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

const seekerIcon = createCustomIcon('seeker');
const donorIcon = createCustomIcon('donor');
const userIcon = createCustomIcon('user');
const selectedIcon = L.divIcon({
  className: 'custom-leaflet-icon',
  html: `
    <div style="position: relative; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center;">
      <span style="position: absolute; inset: 0; border-radius: 50%; opacity: 0.25; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; background-color: #f59e0b;"></span>
      <div style="position: relative; width: 32px; height: 32px; border-radius: 50%; background-color: #ffffff; border: 2.5px solid #f59e0b; box-shadow: 0 3px 8px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 6V2"/>
          <path d="M4.72 16H3a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h1.72"/>
          <path d="M19.28 16H21a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-1.72"/>
          <path d="M18 22V7a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v15"/>
          <path d="M16 14H8"/>
          <path d="M12 10v8"/>
        </svg>
      </div>
    </div>
  `,
  iconSize: [42, 42],
  iconAnchor: [21, 21],
  popupAnchor: [0, -21],
});

// Cached icon for inactive hospitals — created ONCE at module level, reused for every marker.
// This prevents L.divIcon from being re-instantiated on every React render cycle.
const INACTIVE_HOSPITAL_ICON = L.divIcon({
  className: 'inactive-leaflet-icon',
  html: `
    <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
      <div style="position: relative; width: 18px; height: 18px; border-radius: 50%; background-color: #ffffff; border: 1.5px solid #94a3b8; box-shadow: 0 1.5px 4px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 6V2"/>
          <path d="M4.72 16H3a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h1.72"/>
          <path d="M19.28 16H21a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-1.72"/>
          <path d="M18 22V7a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v15"/>
          <path d="M16 14H8"/>
          <path d="M12 10v8"/>
        </svg>
      </div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

const DEFAULT_CENTER: [number, number] = [-7.775, 110.380];

const updateDetectedProvince = async (lat: number, lng: number) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
      {
        headers: {
          "Accept-Language": "id,en"
        }
      }
    );
    if (res.ok) {
      const data = await res.json();
      const stateName = data.address?.state || data.address?.province || data.address?.region || data.address?.city;
      if (stateName && typeof stateName === "string") {
        const matchedKey = matchProvince(stateName);
        if (matchedKey) {
          console.log("MapComponent auto-detected province:", matchedKey);
          localStorage.setItem("detected_province", matchedKey);
          window.dispatchEvent(new Event("local-storage-update"));
        }
      }
    }
  } catch (err) {
    console.warn("MapComponent reverse geocoding failed:", err);
  }
};

const locationCoordinateHints: Array<{ keywords: string[]; center: [number, number] }> = [
  { keywords: ["sleman"], center: [-7.732, 110.355] },
  { keywords: ["bantul"], center: [-7.888, 110.328] },
  { keywords: ["kulon progo", "kulonprogo"], center: [-7.826, 110.164] },
  { keywords: ["gunungkidul", "gunung kidul", "wonosari"], center: [-7.966, 110.603] },
  { keywords: ["yogyakarta", "jogja", "jogjakarta"], center: DEFAULT_CENTER },
];

const getInitialCenter = (): [number, number] => {
  if (typeof window === "undefined") return DEFAULT_CENTER;

  try {
    // 1. Try to get the exact last map center (Google Maps style)
    const lastCenter = window.localStorage.getItem("last_map_center");
    if (lastCenter) {
      const parsed = JSON.parse(lastCenter);
      if (Array.isArray(parsed) && parsed.length === 2) {
        return parsed as [number, number];
      }
    }

    // 2. Fallback to user_session location hints
    const storedSession = window.localStorage.getItem("user_session");
    if (!storedSession) return DEFAULT_CENTER;

    const session = JSON.parse(storedSession);
    const location = typeof session.location === "string" ? session.location.toLowerCase() : "";
    const match = locationCoordinateHints.find((item) =>
      item.keywords.some((keyword) => location.includes(keyword))
    );

    return match?.center || DEFAULT_CENTER;
  } catch (err) {
    console.warn("Failed to read stored map location:", err);
    return DEFAULT_CENTER;
  }
};

function getTimeAgo(dateString: string, lang: "id" | "en") {
  if (!dateString) return lang === "en" ? "Unknown time" : "Waktu tidak diketahui";
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.round(diffMs / 60000);
  
  if (diffMins < 1) return lang === "en" ? "Just now" : "Baru saja";
  
  if (diffMins < 60) {
    return lang === "en" 
      ? `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago` 
      : `${diffMins} menit yang lalu`;
  }
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) {
    return lang === "en"
      ? `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`
      : `${diffHours} jam yang lalu`;
  }
  
  const diffDays = Math.floor(diffHours / 24);
  return lang === "en"
    ? `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`
    : `${diffDays} hari yang lalu`;
}

// Module-level icon cache: keyed by "seekerCount:color" to avoid recreating L.divIcon on every render.
const _hospitalIconCache = new Map<string, L.DivIcon>();
function getHospitalMarkerIcon(seekerCount: number, color: string): L.DivIcon {
  const key = `${seekerCount}:${color}`;
  if (!_hospitalIconCache.has(key)) {
    _hospitalIconCache.set(key, L.divIcon({
      className: 'custom-leaflet-icon',
      html: `
        <div style="position: relative; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center;">
          <span style="position: absolute; inset: 0; border-radius: 50%; opacity: 0.25; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; background-color: ${color};"></span>
          <div style="position: relative; width: 32px; height: 32px; border-radius: 50%; background-color: #ffffff; border: 2.5px solid ${color}; box-shadow: 0 3px 8px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 6V2"/>
              <path d="M4.72 16H3a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h1.72"/>
              <path d="M19.28 16H21a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-1.72"/>
              <path d="M18 22V7a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v15"/>
              <path d="M16 14H8"/>
              <path d="M12 10v8"/>
            </svg>
          </div>
          ${seekerCount > 0 ? `
            <span style="position: absolute; top: -2px; right: -2px; background-color: #ef4444; color: white; font-size: 8px; font-weight: 900; padding: 1px 4.5px; border-radius: 9999px; border: 1.5px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);">
              ${seekerCount}
            </span>
          ` : ''}
        </div>
      `,
      iconSize: [42, 42],
      iconAnchor: [21, 21],
      popupAnchor: [0, -21],
    }));
  }
  return _hospitalIconCache.get(key)!;
}

// Next.js leaflet dynamic view changer
// Uses setView (instant) instead of flyTo to avoid triggering moveend → re-render cascades.
// A ref guard ensures we only reposition when center actually changes by a meaningful distance,
// preventing ChangeView from firing during user-initiated map drags.
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  const prevCenter = useRef<[number, number] | null>(null);
  const prevZoom = useRef<number | null>(null);

  useEffect(() => {
    const centerChanged = !prevCenter.current ||
      Math.abs(prevCenter.current[0] - center[0]) > 0.0005 ||
      Math.abs(prevCenter.current[1] - center[1]) > 0.0005;
    const zoomChanged = prevZoom.current !== zoom;

    if (centerChanged || zoomChanged) {
      map.setView(center, zoom, { animate: true, duration: 0.4 });
      prevCenter.current = center;
      prevZoom.current = zoom;
    }
  }, [center, zoom, map]);
  return null;
}

// Leaflet click handler component for interactive location pinning and saving last dragged location
function MapEventsHandler({ 
  onMapClick,
  onMapMove
}: { 
  onMapClick?: (lat: number, lng: number) => void;
  onMapMove?: (lat: number, lng: number, zoom: number) => void;
}) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
    movestart(e) {
      if (typeof document !== "undefined") {
        document.documentElement.classList.add('map-moving');
      }
    },
    moveend(e) {
      if (typeof document !== "undefined") {
        document.documentElement.classList.remove('map-moving');
      }

      const center = e.target.getCenter();
      const zoom = e.target.getZoom();
      if (onMapMove) {
        onMapMove(center.lat, center.lng, zoom);
      }
      if (typeof window !== "undefined") {
        window.localStorage.setItem("last_map_center", JSON.stringify([center.lat, center.lng]));
      }
    }
  });
  return null;
}

// Database signals will replace staticSignals

interface MapComponentProps {
  preview?: boolean; // If true, hides controls/filter panel (for landing page preview)
  onMapClick?: (lat: number, lng: number) => void; // Click handler to select coordinates
  selectedHospitalPosition?: [number, number] | null; // Currently pinned position for seekers
  selectedHospitalName?: string;
  highlightedSignalId?: number | null; // ID of the signal to focus on
  sidebarOpen?: boolean; // Support sidebar collapsing
  externalRadius?: number;
  onRadiusChange?: (val: number) => void;
  externalSearchQuery?: string;
  onSearchQueryChange?: (val: string) => void;
  externalFilterBloodType?: string;
  externalFilterUrgency?: string;
  onSignalsUpdate?: (signals: any[]) => void;
  onHospitalSelect?: (hospitalName: string | null) => void; // Filter list on map pin click
}

export default function MapComponent({
  preview = false,
  onMapClick,
  selectedHospitalPosition,
  selectedHospitalName = "Titik Rumah Sakit Pilihan",
  highlightedSignalId,
  sidebarOpen = true,
  externalRadius,
  onRadiusChange,
  externalSearchQuery,
  onSearchQueryChange,
  externalFilterBloodType = "all",
  externalFilterUrgency = "all",
  onSignalsUpdate,
  onHospitalSelect
}: MapComponentProps) {
  const { language } = useLanguage();
  const [center, setCenter] = useState<[number, number]>(() => getInitialCenter());
  const [zoom, setZoom] = useState(13);
  
  // Use refs for mapCenter/mapZoom — map pan/zoom events must NOT trigger React re-renders.
  // Previously: moveend → setMapCenter → re-render → onSignalsUpdate → parent re-render → infinite loop.
  // Now: moveend only mutates a ref (zero re-renders from panning).
  const mapCenterRef = useRef<[number, number]>(getInitialCenter());
  const mapZoomRef = useRef<number>(13);
  // mapCenter/mapZoom as state are only used for the inactiveHospitals viewport fetch (zoom ≥ 14).
  // We keep a separate state solely to trigger that fetch, debounced.
  const [mapViewTick, setMapViewTick] = useState(0);
  const mapViewTickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hasUserLocation, setHasUserLocation] = useState(false);
  const [mapMode, setMapMode] = useState<'streets' | 'satellite'>('streets');
  const [dbSignals, setDbSignals] = useState<any[]>([]);

  const supabase = createClient();
  
  // NOTE: We intentionally do NOT load all 2,920 hospitals on the client.
  // Rendering hundreds of Leaflet divIcon markers simultaneously is the primary
  // cause of map drag lag. Inactive hospitals are fetched on-demand by viewport
  // only when the user is zoomed in to level 14+.
  
  // Local state fallbacks for standalone usage
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [radius, setRadius] = useState<number>(0); // 0 means show all

  // Synchronized State Helpers for Shared Filter HUD
  const activeRadius = externalRadius !== undefined ? externalRadius : radius;
  const setActiveRadius = onRadiusChange || setRadius;
  const activeSearchQuery = externalSearchQuery !== undefined ? externalSearchQuery : searchQuery;
  const setActiveSearchQuery = onSearchQueryChange || setSearchQuery;

  // Dynamic signals list (populated locally if user is far from Jogja)
  const [dynamicSignals, setDynamicSignals] = useState<any[]>([]);

  // DOM ref callback helper to prevent Leaflet from stealing clicks/scrolls
  const preventLeafletPropagation = (node: HTMLElement | null) => {
    if (node) {
      L.DomEvent.disableClickPropagation(node);
      L.DomEvent.disableScrollPropagation(node);
    }
  };

  // Geolocation Handler. IP fallback is intentionally manual-only because it is often ISP-based.
  const handleDetectLocation = useCallback((silent = false) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      if (!silent) alert("Browser Anda tidak mendukung layanan geolokasi.");
      return;
    }

    const fallbackToIP = async () => {
      // API 1: ipapi.co
      try {
        const response = await fetch("https://ipapi.co/json/");
        if (response.ok) {
          const data = await response.json();
          if (data.latitude && data.longitude) {
            setCenter([data.latitude, data.longitude]);
            setHasUserLocation(true);
            setZoom(13);
            console.log("Location detected via ipapi.co fallback:", data.city);
            if (typeof window !== "undefined") {
              window.localStorage.setItem("last_map_center", JSON.stringify([data.latitude, data.longitude]));
              const regionName = data.region || data.city;
              if (regionName) {
                const matchedKey = matchProvince(regionName);
                if (matchedKey) {
                  window.localStorage.setItem("detected_province", matchedKey);
                  window.dispatchEvent(new Event("local-storage-update"));
                }
              }
            }
            return;
          }
        }
      } catch (err) {
        console.log("ipapi.co failed, trying ipinfo.io...", err);
      }
      
      // API 2: ipinfo.io
      try {
        const response = await fetch("https://ipinfo.io/json");
        if (response.ok) {
          const data = await response.json();
          if (data.loc) {
            const [lat, lng] = data.loc.split(",").map(Number);
            if (!isNaN(lat) && !isNaN(lng)) {
              setCenter([lat, lng]);
              setHasUserLocation(true);
              setZoom(13);
              console.log("Location detected via ipinfo.io fallback:", data.city);
              if (typeof window !== "undefined") {
                window.localStorage.setItem("last_map_center", JSON.stringify([lat, lng]));
                const regionName = data.region || data.city;
                if (regionName) {
                  const matchedKey = matchProvince(regionName);
                  if (matchedKey) {
                    window.localStorage.setItem("detected_province", matchedKey);
                    window.dispatchEvent(new Event("local-storage-update"));
                  }
                }
              }
              return;
            }
          }
        }
      } catch (err) {
        console.log("ipinfo.io failed, trying freeipapi.com...", err);
      }

      // API 3: freeipapi.com
      try {
        const response = await fetch("https://freeipapi.com/api/json");
        if (response.ok) {
          const data = await response.json();
          if (data.latitude && data.longitude) {
            setCenter([data.latitude, data.longitude]);
            setHasUserLocation(true);
            setZoom(13);
            console.log("Location detected via freeipapi.com fallback:", data.cityName);
            if (typeof window !== "undefined") {
              window.localStorage.setItem("last_map_center", JSON.stringify([data.latitude, data.longitude]));
              const regionName = data.regionName || data.cityName;
              if (regionName) {
                const matchedKey = matchProvince(regionName);
                if (matchedKey) {
                  window.localStorage.setItem("detected_province", matchedKey);
                  window.dispatchEvent(new Event("local-storage-update"));
                }
              }
            }
            return;
          }
        }
      } catch (err) {
        console.log("All IP geolocation fallbacks failed:", err);
      }

      if (!silent) {
        alert("Gagal mendeteksi lokasi otomatis. Silakan periksa koneksi internet Anda atau masukkan lokasi secara manual.");
      }
    };
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCenter([latitude, longitude]);
        setHasUserLocation(true);
        setZoom(14);
        console.log("Location detected successfully via HTML5 Geolocation (High Accuracy)");
        if (typeof window !== "undefined") {
          window.localStorage.setItem("last_map_center", JSON.stringify([latitude, longitude]));
          updateDetectedProvince(latitude, longitude);
        }
      },
      (error) => {
        if (error.code === 1 || error.code === error.PERMISSION_DENIED) {
          console.log("HTML5 Geolocation (High Accuracy) denied by user. Respecting preference, not falling back to IP.");
          if (!silent) {
            alert(language === "en"
              ? "Please grant location access to this website in your browser settings."
              : "Mohon berikan izin akses lokasi untuk website ini pada pengaturan browser Anda.");
          }
          return;
        }
        console.log("HTML5 Geolocation (High Accuracy) failed:", error.message, "- retrying with low accuracy...");
        // Retry with low accuracy
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            setCenter([latitude, longitude]);
            setHasUserLocation(true);
            setZoom(14);
            console.log("Location detected successfully via HTML5 Geolocation (Low Accuracy)");
            if (typeof window !== "undefined") {
              window.localStorage.setItem("last_map_center", JSON.stringify([latitude, longitude]));
              updateDetectedProvince(latitude, longitude);
            }
          },
          (err) => {
            if (err.code === 1 || err.code === err.PERMISSION_DENIED) {
              console.log("HTML5 Geolocation (Low Accuracy) denied by user. Respecting preference, not falling back to IP.");
              if (!silent) {
                alert(language === "en"
                  ? "Please grant location access to this website in your browser settings."
                  : "Mohon berikan izin akses lokasi untuk website ini pada pengaturan browser Anda.");
              }
              return;
            }
            if (err.code === 2 || err.code === err.POSITION_UNAVAILABLE) {
              console.log("HTML5 Geolocation (Low Accuracy) unavailable (GPS off).");
              if (!silent) {
                alert(language === "en"
                  ? "Location service is inactive. Please enable GPS or location services on your device."
                  : "Layanan lokasi tidak aktif. Mohon aktifkan GPS atau layanan lokasi pada perangkat Anda.");
              }
              return;
            }
            console.log("HTML5 Geolocation (Low Accuracy) failed:", err.message);
            if (!silent) {
              fallbackToIP();
            }
          },
          { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, []);

  // Trigger precise browser GPS on full map AND landing preview
  useEffect(() => {
    handleDetectLocation(true);
  }, [handleDetectLocation]);

  // Fetch signals from Supabase
  useEffect(() => {
    if (!supabase) return;

    async function fetchSignals() {
      try {
        const { data: seekersData, error: seekersErr } = await supabase
          .from('blood_requests')
          .select('id, hospital_name, blood_type, rhesus, bags_needed, urgency, created_at, status, hospital_coord')
          .eq('status', 'open');
        
        if (seekersErr) throw seekersErr;

        const { data: donorsData, error: donorsErr } = await supabase
          .from('profiles')
          .select('id, full_name, blood_type, rhesus, last_donation, location, is_available')
          .eq('is_available', true);

        if (donorsErr) throw donorsErr;

        const seekers = (seekersData || []).map((s: any) => {
          const coords = parseWkbHexPoint(s.hospital_coord);
          return {
            id: s.id,
            type: 'seeker',
            location: s.hospital_name,
            bloodType: `${s.blood_type}${s.rhesus}`,
            urgency: s.urgency,
            bags_needed: s.bags_needed,
            time_ago: s.created_at,
            position: coords || DEFAULT_CENTER,
            lat: coords ? coords[0] : DEFAULT_CENTER[0],
            lng: coords ? coords[1] : DEFAULT_CENTER[1]
          };
        });

        const storedSession = typeof window !== "undefined" ? window.localStorage.getItem("user_session") : null;
        let currentUserId: string | null = null;
        if (storedSession) {
          try {
            const parsed = JSON.parse(storedSession);
            currentUserId = parsed.id || null;
          } catch (e) {
            console.error("Error parsing user session in map:", e);
          }
        }

        const donors = (donorsData || [])
          .filter((d: any) => d.id !== currentUserId)
          .map((d: any) => {
            const coords = parseWkbHexPoint(d.location);
            return {
              id: d.id,
              type: 'donor',
              location: 'Pendonor Siaga',
              bloodType: `${d.blood_type}${d.rhesus}`,
              urgency: 'Sedia',
              bags_needed: 1,
              time_ago: d.last_donation,
              position: coords || DEFAULT_CENTER,
              lat: coords ? coords[0] : DEFAULT_CENTER[0],
              lng: coords ? coords[1] : DEFAULT_CENTER[1]
            };
          });

        const combined = [...seekers, ...donors];
        setDbSignals(combined);
      } catch (err) {
        console.error('Error fetching map signals:', err);
      }
    }

    fetchSignals();

    const channel = supabase
      .channel('map-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blood_requests' }, () => fetchSignals())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchSignals())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle highlighted signal change from external prop
  useEffect(() => {
    if (highlightedSignalId) {
      const allSignals = [...dbSignals];
      const match = allSignals.find(s => s.id === highlightedSignalId);
      if (match && match.position) {
        setCenter(match.position as [number, number]);
        setZoom(15);
      }
    }
  }, [highlightedSignalId, dbSignals]);

  // Combine database signals
  const allSignals = useMemo(() => {
    return [...dbSignals];
  }, [dbSignals]);

  // Filtering Logic
  const filteredSignals = useMemo(() => {
    return allSignals.filter((signal) => {
      // 1. Filter by Blood Type & Rhesus
      if (externalFilterBloodType && externalFilterBloodType !== 'all') {
        if (signal.bloodType !== externalFilterBloodType) return false;
      }

      // 2. Filter by Urgency
      if (externalFilterUrgency && externalFilterUrgency !== 'all') {
        if (signal.type === 'seeker' && signal.urgency !== externalFilterUrgency) {
          return false;
        }
        if (signal.type === 'donor') {
          return false;
        }
      }
      
      // 5. Filter by Radius
      if (activeRadius > 0) {
        const distance = getDistance(center[0], center[1], signal.position[0], signal.position[1]);
        if (distance > activeRadius) {
          return false;
        }
      }

      // 6. Filter by Search Query
      if (activeSearchQuery.trim() !== '') {
        const q = activeSearchQuery.toLowerCase();
        const locMatch = signal.location.toLowerCase().includes(q);
        const bloodMatch = signal.bloodType.toLowerCase().includes(q);
        if (!locMatch && !bloodMatch) return false;
      }
      
      return true;
    });
  }, [allSignals, externalFilterBloodType, externalFilterUrgency, activeRadius, activeSearchQuery, center]);

  // Group active signals by hospital name for rendering map markers
  const activeHospitalsMap = useMemo<any[]>(() => {
    const list = preview ? allSignals : filteredSignals;
    const seekers = list.filter(s => s.type === 'seeker');
    const groups: Record<string, any> = {};
    seekers.forEach(s => {
      const name = s.location;
      if (!groups[name]) {
        groups[name] = {
          nama: name,
          latitude: s.position[0],
          longitude: s.position[1],
          seekers: [],
          donors: []
        };
      }
      groups[name].seekers.push(s);
    });
    return Object.values(groups);
  }, [allSignals, filteredSignals, preview]);

  // Free-roaming donors — rendered independently, NOT snapped to any hospital
  const activeDonors = useMemo(() => {
    const list = preview ? allSignals : filteredSignals;
    return list.filter(s => s.type === 'donor');
  }, [filteredSignals, allSignals, preview]);

  // Fetch nearby inactive hospitals on-demand only when zoomed in (>=14)
  // to avoid loading & rendering hundreds of DOM nodes at once.
  const [inactiveHospitals, setInactiveHospitals] = useState<any[]>([]);
  useEffect(() => {
    const mapZoom = mapZoomRef.current;
    const mapCenter = mapCenterRef.current;
    if (mapZoom < 14) {
      // Functional updater: bail out if already empty (avoids triggering re-render with [] !== [])
      setInactiveHospitals(prev => prev.length === 0 ? prev : []);
      return;
    }
    let isMounted = true;
    async function fetchNearby() {
      try {
        // Fetch only hospitals near the current viewport center, limited by the server
        const res = await fetch(
          `/api/hospitals?lat=${mapCenterRef.current[0]}&lng=${mapCenterRef.current[1]}&nearby=true&limit=40`
        );
        if (res.ok && isMounted) {
          const data = await res.json();
          // Filter out hospitals that already have active signals
          const activeKeys = new Set(activeHospitalsMap.map((ah: any) => ah.kode_rs || ah.nama));
          setInactiveHospitals(
            (Array.isArray(data) ? data : []).filter(
              (h: any) => !activeKeys.has(h.kode_rs || h.nama)
            ).slice(0, 40) // Hard cap: never more than 40 markers
          );
        }
      } catch (err) {
        console.error("Error fetching nearby inactive hospitals:", err);
      }
    }
    fetchNearby();
    return () => { isMounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapViewTick, activeHospitalsMap]);

  // Synchronize filtered seeker signals back to the parent sidebar component dynamically
  useEffect(() => {
    if (preview || !onSignalsUpdate) return;

    const relativeTime = (minutes: number) => {
      if (language === "en") {
        if (minutes < 60) return `${minutes} minutes ago`;
        const hours = Math.floor(minutes / 60);
        return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
      }

      if (minutes < 60) return `${minutes} menit lalu`;
      return `${Math.floor(minutes / 60)} jam lalu`;
    };

    const seekerRequests = filteredSignals
      .filter((s) => s.type === 'seeker')
      .map((s) => {
        const distanceVal = getDistance(center[0], center[1], s.position[0], s.position[1]);
        return {
          id: s.id,
          hospital: s.location,
          distance: `${distanceVal.toFixed(1)} km`,
          distanceNum: distanceVal,
          bloodType: s.bloodType,
          urgency: s.urgency,
          time: getTimeAgo(s.time_ago, language),
          rawTime: s.time_ago,
          requesterId: `user-${s.id}`,
          phone: s.phone || "6281122334450",
          bagsNeeded: s.bags_needed || 2
        };
      });

    // Sort by distance (closest to furthest)
    seekerRequests.sort((a, b) => a.distanceNum - b.distanceNum);

    onSignalsUpdate(seekerRequests);
  }, [filteredSignals, center, onSignalsUpdate, preview, language]);

  const handleResetFilters = () => {
    setActiveRadius(0);
    setActiveSearchQuery('');
  };

  // Determine geolocator offset based on Mode Seeker (which has wider 400px/25rem sidebar) vs Mode Donor (384px/24rem sidebar)
  // If sidebar is closed or on mobile screen, we fallback to left-6
  const geolocateLeftClass = sidebarOpen 
    ? (onMapClick ? "left-6 md:left-[26.5rem]" : "left-6 md:left-[25.5rem]")
    : "left-6";

  return (
    <div data-no-translate="true" className="w-full h-full rounded-[2rem] overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl relative z-0">
      
      {!preview && (
        <>
          {/* Map Layer Switcher Overlay - Premium glassmorphic buttons absolute top-right */}
          <div 
            ref={preventLeafletPropagation}
            className="absolute top-6 right-6 z-[1000] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 p-1 rounded-2xl shadow-xl flex gap-1 animate-in fade-in duration-300"
          >
            <button
              type="button"
              onClick={() => setMapMode('streets')}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-1.5 ${
                mapMode === 'streets'
                  ? 'bg-primary text-white shadow-md scale-[1.02]'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Jalan</span>
            </button>
            <button
              type="button"
              onClick={() => setMapMode('satellite')}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-1.5 ${
                mapMode === 'satellite'
                  ? 'bg-primary text-white shadow-md scale-[1.02]'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Satelit</span>
            </button>
          </div>

          {/* Repositioned Manual Geolocation Button - floats right next to the left sidebar corner */}
          <button 
            ref={preventLeafletPropagation}
            onClick={() => handleDetectLocation(false)}
            className={`absolute bottom-6 ${geolocateLeftClass} z-[1000] w-12 h-12 bg-white dark:bg-slate-900 text-primary border border-slate-200 dark:border-slate-800 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-rose-600 transition-all hover:scale-110 active:scale-95 shadow-2xl flex items-center justify-center`}
            title="Deteksi Lokasi Saya"
          >
            <Crosshair className="w-5 h-5 animate-pulse" />
          </button>
        </>
      )}

      <MapContainer 
        preferCanvas={true}
        center={center} 
        zoom={zoom} 
        style={{ width: '100%', height: '100%' }}
        className="z-0"
        zoomControl={false}
        dragging={!preview}
        scrollWheelZoom={!preview}
        doubleClickZoom={!preview}
        inertia={false}
      >
        <ChangeView center={center} zoom={zoom} />
        
        {/* Click events handler for positioning hospital pin and saving last drag */}
        {!preview && (
          <MapEventsHandler 
            onMapClick={onMapClick} 
            onMapMove={(lat, lng, z) => {
              // Write to refs — no React state update, no re-render during pan.
              mapCenterRef.current = [lat, lng];
              mapZoomRef.current = z;
              // Debounced tick: only triggers the inactiveHospitals fetch (zoom ≥ 14).
              if (mapViewTickTimer.current) clearTimeout(mapViewTickTimer.current);
              mapViewTickTimer.current = setTimeout(() => setMapViewTick(t => t + 1), 400);
            }}
          />
        )}
        
        {mapMode === 'streets' ? (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
            updateWhenIdle={true}
          />
        ) : (
          <TileLayer
            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            updateWhenIdle={true}
          />
        )}

        {/* Render Radius visual circle around center/user coordinates */}
        {!preview && activeRadius > 0 && (
          <Circle
            center={center}
            radius={activeRadius * 1000} // Radius in meters
            pathOptions={{
              color: '#3b82f6',
              fillColor: '#3b82f6',
              fillOpacity: 0.08,
              weight: 1.5,
              dashArray: '5, 5'
            }}
          />
        )}

        {/* User's active location pulsing marker with a soft blue location circle */}
        {hasUserLocation && (
          <>
            <Circle
              center={center}
              radius={120} // Tight elegant GPS glow
              pathOptions={{
                stroke: false, // borderless
                fillColor: '#3b82f6',
                fillOpacity: 0.15,
              }}
            />
            <Marker position={center} icon={userIcon}>
              <Popup className="rounded-xl overflow-hidden shadow-xl border-none">
                <div className="font-sans px-1 py-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-blue-500 mb-1">
                    🔵 Lokasi Anda
                  </div>
                  <div className="font-black text-sm text-slate-900">Pusat Jangkauan Filter</div>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* DRAG-AND-DROP SELECTED HOSPITAL MARKER */}
        {!preview && selectedHospitalPosition && (
          <Marker position={selectedHospitalPosition} icon={selectedIcon}>
            <Popup className="rounded-xl overflow-hidden shadow-xl border-none">
              <div className="font-sans px-1 py-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-500 mb-1">
                  {selectedHospitalName?.toLowerCase().includes("saya") || selectedHospitalName?.toLowerCase().includes("my") || selectedHospitalName?.toLowerCase().includes("donor")
                    ? "📍 Posisi Siaga Anda" 
                    : "📍 Lokasi Rumah Sakit Pilihan"}
                </div>
                <div className="font-black text-sm text-slate-900">{selectedHospitalName || "Koordinat Terpilih"}</div>
                <div className="text-[9px] text-slate-400 mt-1 font-semibold">
                  Lat: {selectedHospitalPosition[0].toFixed(5)}, Lng: {selectedHospitalPosition[1].toFixed(5)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Render grouped active hospital markers (seekers & donors) */}
        {activeHospitalsMap
          .filter(h => {
            const d = Math.pow(h.latitude - mapCenterRef.current[0], 2) + Math.pow(h.longitude - mapCenterRef.current[1], 2);
            const mapZoom = mapZoomRef.current;
            if (mapZoom < 8) return true;
            if (mapZoom >= 11) return d < 0.04;
            if (mapZoom >= 10) return d < 0.12;
            if (mapZoom >= 9) return d < 0.45;
            return d < 1.8;
          })
          .map((h) => {
            const seekerCount = h.seekers?.length || 0;
            const donorCount = h.donors?.length || 0;
            const isRed = seekerCount > 0;
            const color = isRed ? '#ef4444' : '#10b981';

            const popupContent = (
              <Popup className="rounded-xl overflow-hidden shadow-xl border-none">
                <div className="font-sans px-1 py-1 min-w-[180px]">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                    <span>🏥 Rumah Sakit</span>
                    {seekerCount > 0 && <span className="text-rose-500 font-extrabold">(Ada Pemohon)</span>}
                    {seekerCount === 0 && donorCount > 0 && <span className="text-emerald-500 font-extrabold">(Ada Pendonor)</span>}
                  </div>
                  <div className="font-black text-sm text-slate-900 leading-tight">{h.nama}</div>
                  <div className="text-[10px] text-slate-500 mt-1.5 font-bold space-y-0.5">
                    {seekerCount > 0 && <div>🔴 {seekerCount} Pemohon Darah Aktif</div>}
                    {donorCount > 0 && <div>🟢 {donorCount} Pendonor Siaga</div>}
                  </div>
                  
                  {seekerCount > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {h.seekers.map((r: any, idx: number) => (
                        <span key={idx} className="px-1.5 py-0.5 bg-rose-50 text-rose-700 text-[9px] font-bold rounded-md border border-rose-100">
                          {r.bloodType} ({r.urgency})
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-[8px] text-slate-400 mt-2.5 font-semibold italic">
                    *Klik untuk melihat daftar lengkap di panel kiri.
                  </p>
                </div>
              </Popup>
            );

            // At zoom < 16, use canvas-rendered CircleMarker for smooth panning.
            if (mapZoomRef.current < 16) {
              const radiusSize = mapZoomRef.current < 8 ? 3.5 : (mapZoomRef.current < 11 ? 6 : (mapZoomRef.current < 15 ? 9 : 12));
              return (
                <CircleMarker
                  key={h.kode_rs || h.nama}
                  center={[h.latitude, h.longitude]}
                  radius={radiusSize}
                  pathOptions={{
                    fillColor: color,
                    color: '#ffffff',
                    weight: 1.5,
                    fillOpacity: 1
                  }}
                  eventHandlers={{
                    click: () => {
                      if (onHospitalSelect) {
                        onHospitalSelect(h.nama);
                      }
                    }
                  }}
                >
                  {popupContent}
                </CircleMarker>
              );
            }

            // zoom >= 15: Full premium pulsing 42px hospital building SVG icon
            // Use cached icon to avoid creating a new L.divIcon object on every render.
            const hospitalMarkerIcon = getHospitalMarkerIcon(seekerCount, color);

            return (
              <Marker
                key={h.kode_rs || h.nama}
                position={[h.latitude, h.longitude]}
                icon={hospitalMarkerIcon}
                eventHandlers={{
                  click: () => {
                    if (onHospitalSelect) {
                      onHospitalSelect(h.nama);
                    }
                  }
                }}
              >
                {popupContent}
              </Marker>
            );
          })}

        {/* Free-roaming Donor markers — independent of hospitals */}
        {activeDonors
          .filter(d => {
            const dist2 = Math.pow(d.lat - mapCenterRef.current[0], 2) + Math.pow(d.lng - mapCenterRef.current[1], 2);
            const mapZoom = mapZoomRef.current;
            if (mapZoom < 8) return true;
            if (mapZoom >= 11) return dist2 < 0.04;
            if (mapZoom >= 10) return dist2 < 0.12;
            if (mapZoom >= 9) return dist2 < 0.45;
            return dist2 < 1.8;
          })
          .map(d => {
            // zoom >= 16: use full divIcon donor marker.
            if (mapZoomRef.current < 16) {
              const r = mapZoomRef.current < 8 ? 3.5 : (mapZoomRef.current < 11 ? 6 : (mapZoomRef.current < 15 ? 9 : 12));
              return (
                <CircleMarker
                  key={d.id}
                  center={[d.lat, d.lng]}
                  radius={r}
                  pathOptions={{
                    fillColor: '#10b981',
                    color: '#ffffff',
                    weight: 1.5,
                    fillOpacity: 1
                  }}
                >
                  <Popup className="rounded-xl overflow-hidden shadow-xl border-none">
                    <div className="font-sans px-1 py-1 min-w-[160px]">
                      <div className="text-[9px] font-bold uppercase tracking-wider text-emerald-500 mb-1">🟢 Pendonor Siaga</div>
                      <div className="font-black text-sm text-slate-900">{d.bloodType}</div>
                      <div className="text-[9px] text-slate-400 mt-1">{d.location}</div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            }
            return (
              <Marker
                key={d.id}
                position={[d.lat, d.lng]}
                icon={donorIcon}
              >
                <Popup className="rounded-xl overflow-hidden shadow-xl border-none">
                  <div className="font-sans px-1 py-1 min-w-[160px]">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-emerald-500 mb-1">🟢 Pendonor Siaga</div>
                    <div className="font-black text-sm text-slate-900">{d.bloodType}</div>
                    <div className="text-[9px] text-slate-400 mt-0.5 font-semibold">{d.location}</div>
                    {d.time_ago && (
                      <div className="text-[8px] text-slate-400 mt-1">{getTimeAgo(d.time_ago, language)}</div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })
        }

        {/* Render nearby inactive hospitals when zoomed in (>=14 only, max 40) */}
        {inactiveHospitals.map((h) => {
          const popupContent = (
            <Popup className="rounded-xl overflow-hidden shadow-xl border-none">
              <div className="font-sans px-1 py-1 max-w-[180px]">
                <div className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                  🏥 Rumah Sakit (Siaga)
                </div>
                <div className="font-bold text-xs text-slate-800 leading-tight mb-1">{h.nama}</div>
                <div className="text-[9px] text-slate-400 font-semibold truncate">{h.alamat}</div>
                <div className="text-[9px] text-slate-400 font-extrabold uppercase mt-1">{h.wilayah}</div>
                <div className="text-[8px] text-slate-500 font-bold mt-2">
                  *Belum ada aktivitas sinyal di sini.
                </div>
              </div>
            </Popup>
          );

          // At zoom < 16, render inactive hospitals as Canvas CircleMarker to avoid DOM load
          if (mapZoomRef.current < 16) {
            const radiusSize = mapZoomRef.current < 15 ? 4.5 : 7;
            return (
              <CircleMarker
                key={h.kode_rs || h.nama}
                center={[h.latitude, h.longitude]}
                radius={radiusSize}
                pathOptions={{
                  fillColor: '#94a3b8',
                  color: '#ffffff',
                  weight: 1.2,
                  fillOpacity: 0.85
                }}
                eventHandlers={{
                  click: () => {
                    if (onMapClick) {
                      onMapClick(h.latitude, h.longitude);
                    }
                  }
                }}
              >
                {popupContent}
              </CircleMarker>
            );
          }

          return (
            <Marker
              key={h.kode_rs || h.nama}
              position={[h.latitude, h.longitude]}
              icon={INACTIVE_HOSPITAL_ICON}
              eventHandlers={{
                click: () => {
                  if (onMapClick) {
                    onMapClick(h.latitude, h.longitude);
                  }
                }
              }}
            >
              {popupContent}
            </Marker>
          );
        })}
      </MapContainer>
      
      {!preview && (
        /* Legend Overlay - absolute bottom right - ref stops events propagation */
        <div 
          ref={preventLeafletPropagation}
          className="absolute bottom-6 right-6 z-[1000] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 p-4 rounded-3xl flex flex-col gap-3 text-xs font-semibold shadow-xl"
        >
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)] border-2 border-white" />
            <span className="text-slate-700 dark:text-slate-200">
              {language === "en" ? "Emergency Blood Request" : "Sinyal Darurat (Butuh Darah)"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
            <span className="text-slate-700 dark:text-slate-200">
              {language === "en" ? "Ready Donors" : "Pendonor Siaga"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white shadow-sm" />
            <span className="text-slate-700 dark:text-slate-200">
              {language === "en" ? "Radar Center (My Location)" : "Pusat Radar (Lokasi Anda)"}
            </span>
          </div>
          {selectedHospitalPosition && (
            <div className="flex items-center gap-3">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white shadow-sm" />
              <span className="text-slate-700 dark:text-slate-200">
                {selectedHospitalName?.toLowerCase().includes("saya") || selectedHospitalName?.toLowerCase().includes("my") || selectedHospitalName?.toLowerCase().includes("donor")
                  ? (language === "en" ? "My Ready Point" : "Titik Siaga Anda")
                  : (language === "en" ? "Selected Hospital" : "Rumah Sakit Terpilih")}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
