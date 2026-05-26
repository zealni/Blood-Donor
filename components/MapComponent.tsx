"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Filter, Crosshair, Search, RotateCcw, ShieldAlert, Check, Map, Globe } from 'lucide-react';

// Custom icons using HTML to keep the pulsing effect
const createCustomIcon = (type: 'seeker' | 'donor' | 'user' | 'selected') => {
  let color = 'ef4444'; // Red for seeker (Tailwind red-500)
  if (type === 'donor') color = '10b981'; // Green for donor (Tailwind emerald-500)
  if (type === 'user') color = '3b82f6'; // Blue for active user location (Tailwind blue-500)
  if (type === 'selected') color = 'f59e0b'; // Amber for selected hospital pin
  
  const size = type === 'user' || type === 'selected' ? 28 : 24;
  const innerSize = type === 'user' || type === 'selected' ? 16 : 14;
  const margin = type === 'user' || type === 'selected' ? 6 : 5;
  
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `
      <div style="position: relative; width: ${size}px; height: ${size}px;">
        <span style="position: absolute; inset: 0; border-radius: 50%; opacity: 0.75; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; background-color: #${color};"></span>
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
const selectedIcon = createCustomIcon('selected');

// Haversine formula to calculate distance in km
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Next.js leaflet dynamic view changer
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

// Leaflet click handler component for interactive location pinning
function MapEventsHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

// Static mock signals (Centered around Yogyakarta)
const staticSignals = [
  { id: 1, type: "seeker", position: [-7.768, 110.373], bloodType: "A+", urgency: "Kritis", location: "RSUP Dr. Sardjito" },
  { id: 2, type: "donor", position: [-7.772, 110.368], bloodType: "O+", urgency: "Sedia", location: "Sinduadi" },
  { id: 3, type: "seeker", position: [-7.783, 110.378], bloodType: "AB-", urgency: "Tinggi", location: "RS Panti Rapih" },
  { id: 4, type: "donor", position: [-7.787, 110.383], bloodType: "B+", urgency: "Sedia", location: "Gondokusuman" },
  { id: 5, type: "seeker", position: [-7.785, 110.370], bloodType: "O-", urgency: "Sedang", location: "RS Bethesda" },
  { id: 6, type: "donor", position: [-7.782, 110.365], bloodType: "A-", urgency: "Sedia", location: "Jetis" },
  { id: 8, type: "seeker", position: [-7.758, 110.404], bloodType: "O+", urgency: "Kritis", location: "RS JIH" },
  { id: 9, type: "donor", position: [-7.760, 110.410], bloodType: "A+", urgency: "Sedia", location: "Condongcatur" },
];

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
  onSignalsUpdate
}: MapComponentProps) {
  const [center, setCenter] = useState<[number, number]>([-7.775, 110.380]);
  const [zoom, setZoom] = useState(13);
  const [hasUserLocation, setHasUserLocation] = useState(false);
  const [mapMode, setMapMode] = useState<'streets' | 'satellite'>('streets');
  
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

  // Geolocation Handler with IP-Based Geolocation Fallback
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
            console.log("Location auto-detected via ipapi.co fallback:", data.city);
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
              console.log("Location auto-detected via ipinfo.io fallback:", data.city);
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
            console.log("Location auto-detected via freeipapi.com fallback:", data.cityName);
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
        console.log("Location detected successfully via HTML5 Geolocation");
      },
      (error) => {
        console.log("HTML5 Geolocation failed:", error.message, "- Trying IP Fallback...");
        fallbackToIP();
      },
      { enableHighAccuracy: false, timeout: 4000, maximumAge: 60000 }
    );
  }, []);

  // Trigger GPS/IP tracking automatically on mount
  useEffect(() => {
    handleDetectLocation(true);
  }, [handleDetectLocation]);

  // Generate dynamic signals if user is far from Jogja
  useEffect(() => {
    if (hasUserLocation) {
      const [lat, lng] = center;
      const distanceToYogya = getDistance(lat, lng, -7.775, 110.380);
      
      // If user is more than 50km away from Yogyakarta, generate mock signals near them
      if (distanceToYogya > 50) {
        const localSignals = [
          { id: 101, type: "seeker", position: [lat + 0.005, lng - 0.003], bloodType: "O-", urgency: "Kritis", location: "Rumah Sakit Daerah Terdekat" },
          { id: 102, type: "donor", position: [lat - 0.004, lng + 0.005], bloodType: "A+", urgency: "Sedia", location: "Pendonor Siaga (500m)" },
          { id: 103, type: "seeker", position: [lat + 0.008, lng + 0.002], bloodType: "AB+", urgency: "Tinggi", location: "Puskesmas Terdekat" },
          { id: 104, type: "donor", position: [lat - 0.006, lng - 0.004], bloodType: "B-", urgency: "Sedia", location: "Pendonor Siaga (1.2km)" },
        ];
        setDynamicSignals(localSignals);
      } else {
        setDynamicSignals([]);
      }
    } else {
      setDynamicSignals([]);
    }
  }, [center, hasUserLocation]);

  // Handle highlighted signal change from external prop
  useEffect(() => {
    if (highlightedSignalId) {
      const allSignals = [...staticSignals, ...dynamicSignals];
      const match = allSignals.find(s => s.id === highlightedSignalId);
      if (match) {
        setCenter(match.position as [number, number]);
        setZoom(15);
      }
    }
  }, [highlightedSignalId, dynamicSignals]);

  // Combine static and dynamic signals
  const allSignals = useMemo(() => {
    return [...staticSignals, ...dynamicSignals];
  }, [dynamicSignals]);

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

  // Synchronize filtered seeker signals back to the parent sidebar component dynamically
  useEffect(() => {
    if (preview || !onSignalsUpdate) return;

    const seekerRequests = filteredSignals
      .filter((s) => s.type === 'seeker')
      .map((s) => {
        const distance = getDistance(center[0], center[1], s.position[0], s.position[1]);
        return {
          id: s.id,
          hospital: s.location,
          distance: `${distance.toFixed(1)} km`,
          bloodType: s.bloodType,
          urgency: s.urgency,
          time: s.id === 1 ? "5 menit lalu" : 
                s.id === 3 ? "34 menit lalu" : 
                s.id === 5 ? "1 jam lalu" : 
                s.id === 8 ? "55 menit lalu" : 
                s.id === 101 ? "12 menit lalu" : "45 menit lalu",
          requesterId: `user-${s.id}`,
          phone: s.id === 1 ? "6281234567890" : 
                 s.id === 3 ? "6289876543210" : 
                 s.id === 5 ? "6287755443320" : "6281122334450",
          bagsNeeded: s.id === 1 ? 2 : s.id === 3 ? 3 : s.id === 5 ? 1 : 2
        };
      });

    onSignalsUpdate(seekerRequests);
  }, [filteredSignals, center, onSignalsUpdate, preview]);

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
    <div className="w-full h-full rounded-[2rem] overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl relative z-0">
      
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
              <Map className="w-3.5 h-3.5" />
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
        center={center} 
        zoom={zoom} 
        style={{ width: '100%', height: '100%' }}
        className="z-0"
        zoomControl={false}
        dragging={!preview}
        scrollWheelZoom={!preview}
        doubleClickZoom={!preview}
      >
        <ChangeView center={center} zoom={zoom} />
        
        {/* Click events handler for positioning hospital pin */}
        {!preview && onMapClick && (
          <MapEventsHandler onMapClick={onMapClick} />
        )}
        
        {mapMode === 'streets' ? (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
        ) : (
          <TileLayer
            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
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
                  📍 Lokasi Rumah Sakit Pilihan
                </div>
                <div className="font-black text-sm text-slate-900">{selectedHospitalName || "Koordinat Terpilih"}</div>
                <div className="text-[9px] text-slate-400 mt-1 font-semibold">
                  Lat: {selectedHospitalPosition[0].toFixed(5)}, Lng: {selectedHospitalPosition[1].toFixed(5)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Render filtered markers */}
        {/* If in preview mode, show all signals (no filters applied) */}
        {(preview ? allSignals : filteredSignals).map((signal) => (
          <Marker 
            key={signal.id} 
            position={signal.position as [number, number]} 
            icon={signal.type === 'seeker' ? seekerIcon : donorIcon}
          >
            <Popup className="rounded-xl overflow-hidden shadow-xl border-none">
              <div className="font-sans px-1 py-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  {signal.type === "seeker" ? "🔴 Pemohon" : "🟢 Pendonor"}
                </div>
                <div className="font-black text-xl text-slate-900">{signal.bloodType}</div>
                <div className="font-semibold text-sm text-slate-700 mt-1">{signal.location}</div>
                <div className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-2 ${
                  signal.urgency === 'Kritis' ? 'bg-red-100 text-red-700' : 
                  signal.urgency === 'Tinggi' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {signal.type === "seeker" ? `Urgensi: ${signal.urgency}` : 'Siaga Pendonor'}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {!preview && (
        /* Legend Overlay - absolute bottom right - ref stops events propagation */
        <div 
          ref={preventLeafletPropagation}
          className="absolute bottom-6 right-6 z-[1000] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 p-4 rounded-3xl flex flex-col gap-3 text-xs font-semibold shadow-xl"
        >
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)] border-2 border-white" />
            <span className="text-slate-700 dark:text-slate-200">Darurat (Butuh)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)] border-2 border-white" />
            <span className="text-slate-700 dark:text-slate-200">Siap Donor</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)] border-2 border-white" />
            <span className="text-slate-700 dark:text-slate-200">Lokasi Anda</span>
          </div>
          {selectedHospitalPosition && (
            <div className="flex items-center gap-3">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)] border-2 border-white" />
              <span className="text-slate-700 dark:text-slate-200">Lokasi RS Anda</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
