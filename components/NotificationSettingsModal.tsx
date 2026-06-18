"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { X, MapPin, CheckCircle2, Crosshair, Settings, ShieldAlert, Sliders, Info } from "lucide-react";
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useLanguage } from "./LanguageProvider";

// Custom Leaflet DivIcon for the center point
const customMarkerIcon = new L.DivIcon({
  html: `<div class="relative flex h-8 w-8 items-center justify-center">
           <span class="absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-40"></span>
           <div class="relative rounded-full h-6 w-6 bg-blue-600 border-2 border-white flex items-center justify-center text-white shadow-lg text-[10px] font-bold">
             📍
           </div>
         </div>`,
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

// Helper component to listen to clicks on the Leaflet Map
function MapEvents({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

// Helper component to center Leaflet map programmatically
function CenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export interface NotificationSettings {
  radius: number; // in km
  centerMode: "current" | "custom";
  customCenter: [number, number];
  customCenterName: string;
  filterMode: "compatible" | "exact" | "all";
  guestBloodType?: string;
  guestRhesus?: string;
}

interface NotificationSettingsModalProps {
  onClose: () => void;
  onSave: () => void;
  userSession: any | null;
}

export default function NotificationSettingsModal({
  onClose,
  onSave,
  userSession
}: NotificationSettingsModalProps) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<"general" | "map">("general");

  // Load initial settings
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("notification_settings");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error("Error parsing notification settings:", e);
        }
      }
    }
    return {
      radius: 10,
      centerMode: "current",
      customCenter: [-7.795, 110.369], // default Jogja
      customCenterName: "D.I. Yogyakarta",
      filterMode: "compatible",
      guestBloodType: "O",
      guestRhesus: "+"
    };
  });

  const [tempCoords, setTempCoords] = useState<[number, number]>(settings.customCenter);
  const [currentGps, setCurrentGps] = useState<[number, number] | null>(null);

  // Detect current browser GPS
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentGps([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => console.log("GPS permission not granted for notifications settings:", err)
      );
    }
  }, []);

  // Update center when custom center is selected
  const handleMapClick = useCallback((lat: number, lng: number) => {
    setTempCoords([lat, lng]);
  }, []);

  const markerRef = useRef<L.Marker>(null);
  const markerEventHandlers = useMemo(() => ({
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const latlng = marker.getLatLng();
        setTempCoords([latlng.lat, latlng.lng]);
      }
    },
  }), []);

  // Save Settings handler
  const handleSave = () => {
    const finalSettings: NotificationSettings = {
      ...settings,
      customCenter: tempCoords,
      // If we clicked custom coordinates, let's construct a general name for it
      customCenterName: settings.centerMode === "custom" 
        ? `${tempCoords[0].toFixed(3)}, ${tempCoords[1].toFixed(3)}` 
        : settings.customCenterName
    };
    
    localStorage.setItem("notification_settings", JSON.stringify(finalSettings));
    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header decoration */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-rose-500 via-primary to-orange-500" />
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {language === "en" ? "Notification Settings" : "Pengaturan Notifikasi"}
              </h3>
              <p className="text-xs text-slate-400">
                {language === "en" ? "Filter emergency requests by area and blood type" : "Saring sinyal darurat berdasarkan jarak dan golongan darah"}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label={language === "en" ? "Close settings" : "Tutup pengaturan"}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 my-4 shrink-0 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("general")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "general"
                ? "bg-white dark:bg-slate-900 text-primary shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Sliders className="w-4 h-4" />
            {language === "en" ? "General Filter" : "Saringan Umum"}
          </button>
          <button
            onClick={() => setActiveTab("map")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "map"
                ? "bg-white dark:bg-slate-900 text-primary shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <MapPin className="w-4 h-4" />
            {language === "en" ? "Custom Radius Map" : "Peta Radius Kustom"}
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-1 py-1 space-y-5">
          
          {activeTab === "general" ? (
            <div className="space-y-5">
              {/* Radius Filter */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                    {language === "en" ? "Notification Radius" : "Radius Jangkauan"}
                  </span>
                  <span className="text-xs font-black text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
                    {settings.radius} km
                  </span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="50" 
                  value={settings.radius}
                  onChange={(e) => setSettings(prev => ({ ...prev, radius: parseInt(e.target.value) }))}
                  className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  {language === "en" 
                    ? `You will only receive notifications within a ${settings.radius} km radius.`
                    : `Hanya menerima notifikasi dalam radius ${settings.radius} km.`}
                </p>
              </div>

              {/* Location Center Mode */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-3">
                  {language === "en" ? "Notification Center Location" : "Titik Pusat Notifikasi"}
                </span>
                
                <div className="grid grid-cols-2 gap-3">
                  <label className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                    settings.centerMode === "current"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}>
                    <input 
                      type="radio" 
                      name="centerMode" 
                      value="current"
                      checked={settings.centerMode === "current"}
                      onChange={() => setSettings(prev => ({ ...prev, centerMode: "current" }))}
                      className="sr-only"
                    />
                    <span className="font-extrabold text-xs block text-slate-800 dark:text-white">
                      {language === "en" ? "Current GPS Location" : "Lokasi GPS Saat Ini"}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 leading-snug">
                      {language === "en" ? "Uses your real-time mobile/desktop GPS coordinates" : "Mengikuti koordinat GPS HP/komputer Anda saat ini"}
                    </span>
                  </label>

                  <label className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                    settings.centerMode === "custom"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}>
                    <input 
                      type="radio" 
                      name="centerMode" 
                      value="custom"
                      checked={settings.centerMode === "custom"}
                      onChange={() => setSettings(prev => ({ ...prev, centerMode: "custom" }))}
                      className="sr-only"
                    />
                    <span className="font-extrabold text-xs block text-slate-800 dark:text-white">
                      {language === "en" ? "Custom Location Center" : "Titik Lokasi Kustom"}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 leading-snug">
                      {language === "en" ? "Drag pin anywhere on the map tab to set center" : "Geser marker ke area mana pun untuk titik pemantauan kustom"}
                    </span>
                  </label>
                </div>
              </div>

              {/* Blood Type Compatibility Options */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-3">
                  {language === "en" ? "Blood Type Filter Mode" : "Penyaringan Golongan Darah"}
                </span>

                <div className="space-y-2">
                  <label className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex items-start gap-3 ${
                    settings.filterMode === "compatible"
                      ? "border-emerald-500 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400"
                  }`}>
                    <input 
                      type="radio" 
                      name="filterMode" 
                      value="compatible"
                      checked={settings.filterMode === "compatible"}
                      onChange={() => setSettings(prev => ({ ...prev, filterMode: "compatible" }))}
                      className="mt-0.5 text-emerald-500 focus:ring-emerald-500 h-4 w-4 border-slate-300"
                    />
                    <div>
                      <span className="font-extrabold text-xs block text-slate-800 dark:text-white">
                        {language === "en" ? "Compatible with Me (Recommended)" : "Kompatibel Dengan Saya (Rekomendasi)"}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5 leading-normal block">
                        {language === "en"
                          ? "Only show requests you can medically donate to. (e.g. O- gets all, A+ gets A+/AB+)"
                          : "Hanya tampilkan sinyal yang golongan darahnya bisa Anda bantu. (misal O- dapat semua, A+ dapat A+/AB+)"}
                      </span>
                    </div>
                  </label>

                  <label className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex items-start gap-3 ${
                    settings.filterMode === "exact"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400"
                  }`}>
                    <input 
                      type="radio" 
                      name="filterMode" 
                      value="exact"
                      checked={settings.filterMode === "exact"}
                      onChange={() => setSettings(prev => ({ ...prev, filterMode: "exact" }))}
                      className="mt-0.5 text-primary focus:ring-primary h-4 w-4 border-slate-300"
                    />
                    <div>
                      <span className="font-extrabold text-xs block text-slate-800 dark:text-white">
                        {language === "en" ? "Exact Match Only" : "Golongan Darah Sama Eksak"}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5 leading-normal block">
                        {language === "en"
                          ? "Only show requests matching your exact blood type and rhesus."
                          : "Hanya tampilkan kebutuhan darah yang golongan darah dan rhesus-nya sama persis dengan Anda."}
                      </span>
                    </div>
                  </label>

                  <label className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex items-start gap-3 ${
                    settings.filterMode === "all"
                      ? "border-slate-400 bg-slate-500/5 text-slate-700 dark:text-slate-300"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400"
                  }`}>
                    <input 
                      type="radio" 
                      name="filterMode" 
                      value="all"
                      checked={settings.filterMode === "all"}
                      onChange={() => setSettings(prev => ({ ...prev, filterMode: "all" }))}
                      className="mt-0.5 text-slate-500 focus:ring-slate-500 h-4 w-4 border-slate-300"
                    />
                    <div>
                      <span className="font-extrabold text-xs block text-slate-800 dark:text-white">
                        {language === "en" ? "Show All Emergency Signals" : "Tampilkan Semua Sinyal Darurat"}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5 leading-normal block">
                        {language === "en"
                          ? "Show all active emergency requests within your radius, regardless of compatibility."
                          : "Tampilkan seluruh sinyal darurat aktif dalam radius jangkauan Anda tanpa memandang kecocokan medis."}
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Guest Blood Type Selector */}
              {!userSession?.isLoggedIn && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/5 border border-amber-200/60 dark:border-amber-900/30">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5 mb-2">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    {language === "en" ? "Guest Profile Setup" : "Profil Pendonor Sementara (Tamu)"}
                  </span>
                  <p className="text-[10px] text-slate-500 leading-normal mb-3">
                    {language === "en" 
                      ? "You are not logged in. Set your blood type below so we can calculate compatibility."
                      : "Anda belum masuk. Atur golongan darah Anda agar sistem bisa menyesuaikan kompatibilitas."}
                  </p>
                  
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label htmlFor="guest-blood-type" className="text-[10px] font-bold text-slate-400 block mb-1">GOLONGAN DARAH</label>
                      <select 
                        id="guest-blood-type"
                        value={settings.guestBloodType}
                        onChange={(e) => setSettings(prev => ({ ...prev, guestBloodType: e.target.value }))}
                        className="w-full text-xs font-bold px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      >
                        {["A", "B", "AB", "O"].map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label htmlFor="guest-rhesus" className="text-[10px] font-bold text-slate-400 block mb-1">RHESUS</label>
                      <select 
                        id="guest-rhesus"
                        value={settings.guestRhesus}
                        onChange={(e) => setSettings(prev => ({ ...prev, guestRhesus: e.target.value }))}
                        className="w-full text-xs font-bold px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      >
                        <option value="+">+</option>
                        <option value="-">-</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 flex flex-col h-full min-h-[350px]">
              <div className="flex justify-between items-center shrink-0">
                <div>
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                    {language === "en" ? "Map Circle Picker" : "Pemilih Radius Lingkaran Peta"}
                  </span>
                  <p className="text-[10px] text-slate-400 leading-snug mt-0.5">
                    {settings.centerMode === "current" 
                      ? (language === "en" ? "Circle centers on your current GPS location." : "Radius berpusat pada GPS real-time Anda.")
                      : (language === "en" ? "Click map or drag marker to move circle." : "Klik peta atau geser marker untuk memindahkan lingkaran.")}
                  </p>
                </div>
                
                {settings.centerMode === "custom" && (
                  <button
                    onClick={() => {
                      if (currentGps) setTempCoords(currentGps);
                    }}
                    disabled={!currentGps}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-extrabold border border-slate-200/50 dark:border-slate-700/50 disabled:opacity-50 transition-colors"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    Snap GPS
                  </button>
                )}
              </div>

              {/* Radius Circle Drag Map (Leaflet) */}
              <div className="w-full flex-grow h-[260px] min-h-[260px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 relative z-10">
                <MapContainer
                  center={tempCoords}
                  zoom={12}
                  className="w-full h-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <CenterMap center={tempCoords} />
                  
                  {settings.centerMode === "custom" ? (
                    <>
                      <Marker 
                        position={tempCoords} 
                        icon={customMarkerIcon}
                        draggable={true}
                        eventHandlers={markerEventHandlers}
                        ref={markerRef}
                      />
                      <MapEvents onMapClick={handleMapClick} />
                    </>
                  ) : (
                    currentGps && (
                      <Marker 
                        position={currentGps} 
                        icon={customMarkerIcon}
                      />
                    )
                  )}

                  {/* Notification Boundary Circle Visualizer */}
                  <Circle 
                    center={settings.centerMode === "current" && currentGps ? currentGps : tempCoords}
                    radius={settings.radius * 1000} // in meters
                    pathOptions={{
                      color: "#ef4444",
                      fillColor: "#ef4444",
                      fillOpacity: 0.15,
                      weight: 1.5,
                      dashArray: "4, 6"
                    }}
                  />
                </MapContainer>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex items-start gap-2.5 shrink-0">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  {settings.centerMode === "current" 
                    ? (language === "en" 
                      ? "Peta menampilkan radius di sekitar lokasi GPS Anda. Untuk memindahkannya secara manual, ubah Mode Pusat ke 'Titik Lokasi Kustom' di tab Saringan Umum." 
                      : "Peta menampilkan radius di sekitar lokasi GPS Anda. Untuk memindahkannya secara manual, ubah Mode Pusat ke 'Titik Lokasi Kustom' di tab Saringan Umum.")
                    : (language === "en"
                      ? "Geser marker pin atau klik area mana saja di peta untuk menaruh pusat wilayah pemantauan Anda secara manual."
                      : "Geser marker pin atau klik area mana saja di peta untuk menaruh pusat wilayah pemantauan Anda secara manual.")}
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5 shrink-0">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300 font-extrabold text-xs rounded-xl transition-all"
          >
            {language === "en" ? "Cancel" : "Batal"}
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-white font-extrabold text-xs rounded-xl shadow-md shadow-rose-500/10 hover:shadow-rose-500/25 transition-all flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            {language === "en" ? "Save Settings" : "Simpan Pengaturan"}
          </button>
        </div>
      </div>
    </div>
  );
}
