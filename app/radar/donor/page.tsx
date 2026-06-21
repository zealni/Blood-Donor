"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { HeartHandshake, Search, Filter, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/components/LanguageProvider";
import { createClient } from "@/lib/supabase/client";
import { provinceShortNames, parseWkbHexPoint } from "@/lib/geo";
import type { UserSession, RequestSignal } from "@/lib/types";

// Sub-components
import ModeSwitcher from "@/components/ModeSwitcher";
import BloodStockWidget from "@/components/BloodStockWidget";
import MyDonorSignalPanel from "@/components/radar/MyDonorSignalPanel";
import DonorSignalCard from "@/components/radar/DonorSignalCard";
import HandshakeModal from "@/components/radar/HandshakeModal";
import RadiusFilter from "@/components/radar/RadiusFilter";
import AdvancedFilters from "@/components/radar/AdvancedFilters";

// Dynamic import of MapComponent to prevent SSR issues with Leaflet
const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
      <p className="font-semibold animate-pulse text-sm">Memuat Peta Lokasi...</p>
    </div>
  ),
});

export default function DonorDashboard() {
  const router = useRouter();
  const { language } = useLanguage();
  const [session, setSession] = useState<UserSession | null>(null);
  const [mounted, setMounted] = useState(false);

  // Sidebar & UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'status'>('list');
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [radius, setRadius] = useState<number>(0);
  const [filterBloodType, setFilterBloodType] = useState("all");
  const [filterUrgency, setFilterUrgency] = useState("all");
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);

  const [selectedHospitalFilter, setSelectedHospitalFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'distance' | 'urgency' | 'bags' | 'time'>('distance');

  const handleHospitalSelect = useCallback((hospitalName: string | null) => {
    setSelectedHospitalFilter(hospitalName);
    if (hospitalName) {
      setActiveTab('list');
      // When filtering by a single hospital, distance is identical for all signals, 
      // so automatically sort by urgency for better relevance.
      setSortBy(prev => prev === 'distance' ? 'urgency' : prev);
    }
  }, []);

  // Province detection
  const [userProvince, setUserProvince] = useState("DIY");

  // Donor signal state
  const [isAvailable, setIsAvailable] = useState(false);
  const [myCoords, setMyCoords] = useState<[number, number] | null>(null);
  const [isSelectingOnMap, setIsSelectingOnMap] = useState(false);
  const [broadcastBloodType, setBroadcastBloodType] = useState<string>("O");
  const [broadcastRhesus, setBroadcastRhesus] = useState<string>("+");
  const [hospitalName, setHospitalName] = useState("");

  // Resolve myCoords to hospital name for display
  useEffect(() => {
    if (!myCoords) {
      setHospitalName("");
      return;
    }
    let isMounted = true;
    async function resolveCoords() {
      try {
        const res = await fetch(`/api/hospitals?lat=${myCoords![0]}&lng=${myCoords![1]}`);
        if (res.ok && isMounted) {
          const data = await res.json();
          if (data && data.nama) {
            setHospitalName(data.nama);
          }
        }
      } catch (e) {
        console.error("Error resolving donor coords:", e);
      }
    }
    resolveCoords();
    return () => { isMounted = false; };
  }, [myCoords]);

  // Handshake modal
  const [handshakeReq, setHandshakeReq] = useState<RequestSignal | null>(null);
  const [handshakeSuccess, setHandshakeSuccess] = useState(false);

  // Seeker requests from MapComponent
  const [requests, setRequests] = useState<RequestSignal[]>([]);
  // Stable callback reference — prevents cascade re-render loop:
  // Without useCallback, every parent re-render creates a new setRequests reference,
  // which triggers MapComponent's onSignalsUpdate effect on every render.
  const handleSignalsUpdate = useCallback((signals: RequestSignal[]) => {
    setRequests(signals);
  }, []);

  const [visibleCount, setVisibleCount] = useState(15);

  // Reset visible count when sorting, searching, or filtering changes
  useEffect(() => {
    setVisibleCount(15);
  }, [filterBloodType, filterUrgency, searchQuery, radius, sortBy, selectedHospitalFilter]);

  // Filter and sort requests in the sidebar based on selection & selected hospital
  const processedRequests = useMemo(() => {
    let list = [...requests];
    
    // 1. Filter by clicked hospital from map
    if (selectedHospitalFilter) {
      list = list.filter(r => r.hospital === selectedHospitalFilter);
    }
    
    // 2. Sort by selected criteria
    list.sort((a, b) => {
      if (sortBy === 'distance') {
        return (a.distanceNum || 0) - (b.distanceNum || 0);
      }
      if (sortBy === 'urgency') {
        const urgencyWeight = { 'Kritis': 3, 'Tinggi': 2, 'Sedang': 1 };
        const wA = urgencyWeight[a.urgency as 'Kritis' | 'Tinggi' | 'Sedang'] || 0;
        const wB = urgencyWeight[b.urgency as 'Kritis' | 'Tinggi' | 'Sedang'] || 0;
        return wB - wA;
      }
      if (sortBy === 'bags') {
        return (b.bagsNeeded || 0) - (a.bagsNeeded || 0);
      }
      if (sortBy === 'time') {
        const tA = new Date(a.rawTime || 0).getTime();
        const tB = new Date(b.rawTime || 0).getTime();
        return tB - tA;
      }
      return 0;
    });
    
    return list;
  }, [requests, selectedHospitalFilter, sortBy]);

  // ── Fetch own profile signal ──
  useEffect(() => {
    if (!session?.id) return;
    const supabase = createClient();
    if (!supabase) return;

    async function loadMyProfile() {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("is_available, location, blood_type, rhesus")
          .eq("id", session!.id)
          .single();

        if (data) {
          setIsAvailable(!!data.is_available);
          if (data.location) {
            const coords = parseWkbHexPoint(data.location);
            if (coords) setMyCoords(coords);
          }
          if (data.blood_type) setBroadcastBloodType(data.blood_type);
          if (data.rhesus) setBroadcastRhesus(data.rhesus);
        }
      } catch (err) {
        console.error("Error loading own profile signal:", err);
      }
    }
    loadMyProfile();
  }, [session?.id]);

  // ── Update signal in Supabase ──
  const updateMySignal = async (
    avail: boolean,
    coords?: [number, number],
    customBloodType?: string,
    customRhesus?: string
  ) => {
    if (!session?.id) return;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(session.id);

    if (!isUuid) {
      setIsAvailable(avail);
      if (coords) {
        setMyCoords(coords);
        setIsSelectingOnMap(false);
      }
      const stored = localStorage.getItem("user_session");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          parsed.isAvailable = avail;
          localStorage.setItem("user_session", JSON.stringify(parsed));
        } catch (e) { console.error(e); }
      }
      window.dispatchEvent(new Event("local-storage-update"));
      return;
    }

    const supabase = createClient();
    if (!supabase) return;

    const locVal = coords
      ? `POINT(${coords[1]} ${coords[0]})`
      : myCoords
      ? `POINT(${myCoords[1]} ${myCoords[0]})`
      : "POINT(110.380 -7.775)";

    try {
      const { error } = await supabase.from("profiles").upsert([
        {
          id: session.id,
          is_available: avail,
          location: locVal,
          full_name: session.fullName || "Pengguna BloodConnect",
          blood_type: customBloodType || broadcastBloodType,
          rhesus: customRhesus || broadcastRhesus,
        },
      ]);

      if (error) {
        console.error("Error updating own profile signal:", error);
        alert(language === "en" ? "Failed to update signal status." : "Gagal memperbarui status sinyal.");
        return;
      }

      setIsAvailable(avail);
      if (coords) {
        setMyCoords(coords);
        setIsSelectingOnMap(false);
      }

      const stored = localStorage.getItem("user_session");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          parsed.isAvailable = avail;
          localStorage.setItem("user_session", JSON.stringify(parsed));
        } catch (e) { console.error(e); }
      }
      window.dispatchEvent(new Event("local-storage-update"));
    } catch (err) {
      console.error(err);
    }
  };

  // ── Province detection ──
  useEffect(() => {
    const detectProvince = () => {
      const cachedDetected = localStorage.getItem("detected_province");
      if (cachedDetected) {
        setUserProvince(provinceShortNames[cachedDetected] || cachedDetected.toUpperCase());
        return;
      }
      const storedSession = localStorage.getItem("user_session");
      if (storedSession) {
        try {
          const parsed = JSON.parse(storedSession);
          if (parsed.location) {
            const loc = parsed.location.toLowerCase();
            const matchedProv = Object.keys(provinceShortNames).find(
              (key) => key.includes(loc) || loc.includes(key)
            );
            if (matchedProv) {
              setUserProvince(provinceShortNames[matchedProv]);
              return;
            }
            setUserProvince(parsed.location.toUpperCase());
          }
        } catch (e) { console.error(e); }
      }
    };

    detectProvince();
    window.addEventListener("storage", detectProvince);
    window.addEventListener("local-storage-update", detectProvince);
    return () => {
      window.removeEventListener("storage", detectProvince);
      window.removeEventListener("local-storage-update", detectProvince);
    };
  }, []);

  // ── Session init ──
  useEffect(() => {
    setMounted(true);
    const storedSession = localStorage.getItem("user_session");
    if (!storedSession) {
      router.push("/login?redirect=/radar/donor");
      return;
    }
    try {
      const parsed = JSON.parse(storedSession);
      setSession(parsed);
      setBroadcastBloodType(parsed.bloodType || "O");
      setBroadcastRhesus(parsed.rhesus || "+");
    } catch (e) {
      console.error(e);
      router.push("/login?redirect=/radar/donor");
    }
  }, [router]);

  // ── Handshake handlers ──
  const handleHandshakeInit = (req: RequestSignal) => {
    setHandshakeReq(req);
    setHandshakeSuccess(false);
  };

  const handleHandshakeConfirm = () => {
    if (!handshakeReq) return;
    setHandshakeSuccess(true);
    setTimeout(() => {
      const text =
        language === "en"
          ? `Hello, I am a volunteer donor from BloodConnect. I saw your emergency signal at ${handshakeReq.hospital} for blood type ${handshakeReq.bloodType}. I am willing to donate my blood.`
          : `Halo, saya pendonor sukarela dari BloodConnect. Saya melihat sinyal darurat Anda di ${handshakeReq.hospital} untuk golongan darah ${handshakeReq.bloodType}. Saya bersedia mendonorkan darah saya.`;
      const waUrl = `https://wa.me/${handshakeReq.phone}?text=${encodeURIComponent(text)}`;
      window.open(waUrl, "_blank");
      setHandshakeReq(null);
      setHandshakeSuccess(false);
    }, 1200);
  };

  // ── Loading state ──
  if (!mounted || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-screen bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden relative">
      <Navbar />

      <div className="flex-grow relative w-full h-full overflow-hidden z-10 flex">
        {/* Full-screen Leaflet Map */}
        <div className="absolute inset-0 z-0">
          <MapComponent
            preview={false}
            highlightedSignalId={highlightedId}
            sidebarOpen={isSidebarOpen}
            externalRadius={radius}
            onRadiusChange={setRadius}
            externalSearchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            externalFilterBloodType={filterBloodType}
            externalFilterUrgency={filterUrgency}
            onSignalsUpdate={handleSignalsUpdate}
            onHospitalSelect={handleHospitalSelect}
            onMapClick={
              isAvailable && isSelectingOnMap
                ? async (lat, lng) => {
                    try {
                      const res = await fetch(`/api/hospitals?lat=${lat}&lng=${lng}`);
                      if (res.ok) {
                        const hospital = await res.json();
                        if (hospital && hospital.nama) {
                          setHospitalName(hospital.nama);
                        }
                      }
                    } catch (e) {
                      console.error("Error resolving hospital name for map click:", e);
                    }
                    // Save exact clicked coordinates, do not snap to hospital coordinates
                    updateMySignal(true, [lat, lng]);
                  }
                : undefined
            }
            selectedHospitalPosition={isAvailable ? myCoords : null}
            selectedHospitalName={
              isAvailable
                ? hospitalName || (language === "en" ? "My Location" : "Lokasi Saya")
                : undefined
            }
          />
        </div>

        {/* Toggle button when sidebar is hidden */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute left-4 md:left-6 bottom-8 md:bottom-auto md:top-6 z-30 flex items-center gap-2 px-5 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-primary border border-rose-200/50 dark:border-rose-900/30 rounded-full shadow-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all hover:scale-105 active:scale-95 duration-300 font-black text-xs"
          >
            <HeartHandshake className="w-4 h-4 text-primary animate-pulse" />
            <span>{language === "en" ? "Show List" : "Lihat Daftar"}</span>
          </button>
        )}

        {/* ═══ SIDEBAR ═══ */}
        <div
          className={`absolute bottom-4 left-4 right-4 top-auto h-[55vh] w-[calc(100%-2rem)] md:top-6 md:bottom-6 md:left-6 md:right-auto md:h-auto md:w-96 z-20 flex flex-col bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-[2rem] shadow-2xl p-4 md:p-6 pb-6 md:pb-6 border border-slate-200/50 dark:border-slate-800/50 overflow-hidden transition-all duration-300 ${
            isSidebarOpen
              ? "translate-y-0 md:translate-x-0 opacity-100"
              : "translate-y-[120%] md:-translate-x-[120%] opacity-0 pointer-events-none"
          }`}
        >
          {/* Mobile Drag Handle Indicator */}
          <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-3 md:hidden shrink-0" />

          {/* Header */}
          {!selectedHospitalFilter ? (
            <div className="shrink-0 mb-3 animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-3">
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors gap-1"
                >
                  {language === "en" ? "← Hide Panel" : "← Sembunyikan Panel"}
                </button>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    {language === "en" ? "DONOR ACTIVE" : "Siaga Donor"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <HeartHandshake className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h1 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                    {language === "en" ? "Nearby Donor Signals" : "Sinyal Pendonor Sekitar"}
                  </h1>
                  {activeTab === 'list' && (
                    <p className="text-slate-400 text-[10px] font-semibold mt-0.5">
                      {language === "en"
                        ? `${processedRequests.length} requester(s) around`
                        : `${processedRequests.length} pemohon di sekitar`}
                    </p>
                  )}
                </div>
              </div>

              {/* Mode Switcher */}
              <div className="shrink-0 mb-4">
                <ModeSwitcher activeMode="donor" />
              </div>
              
              {/* Tabs */}
              <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl mt-3">
                <button
                  onClick={() => setActiveTab('list')}
                  className={`flex-1 text-[11px] font-bold py-2 rounded-lg transition-all ${activeTab === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  {language === "en" ? "Requests List" : "Sinyal Sekitar"}
                </button>
                <button
                  onClick={() => setActiveTab('status')}
                  className={`flex-1 text-[11px] font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeTab === 'status' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  {language === "en" ? "Status & Stock" : "Status & Stok"}
                  {isAvailable && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                </button>
              </div>
            </div>
          ) : (
            <div className="shrink-0 mb-4 animate-in fade-in slide-in-from-right-4 duration-300 border-b border-slate-100 dark:border-slate-800/50 pb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSelectedHospitalFilter(null);
                    setActiveTab('list');
                  }}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold text-rose-500 uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    {language === "en" ? "HOSPITAL SIGNAL LIST" : "DAFTAR SINYAL DI RUMAH SAKIT"}
                  </p>
                  <h1 className="text-[13px] font-black text-slate-900 dark:text-white leading-tight uppercase truncate">
                    {selectedHospitalFilter}
                  </h1>
                </div>
              </div>
            </div>
          )}

          {/* Scrollable area */}
          <div className="flex-1 overflow-y-auto flex flex-col pr-1 min-h-0">
            {activeTab === 'status' && !selectedHospitalFilter ? (
              <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-2 duration-300 pb-4">
                <MyDonorSignalPanel
                  isAvailable={isAvailable}
                  myCoords={myCoords}
                  broadcastBloodType={broadcastBloodType}
                  broadcastRhesus={broadcastRhesus}
                  isSelectingOnMap={isSelectingOnMap}
                  onToggleAvailable={(checked) => updateMySignal(checked)}
                  onUpdateSignal={updateMySignal}
                  onBloodTypeChange={setBroadcastBloodType}
                  onRhesusChange={setBroadcastRhesus}
                  onToggleMapSelection={setIsSelectingOnMap}
                />
                <BloodStockWidget
                  userProvince={userProvince}
                  onProvinceChange={setUserProvince}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-left-2 duration-300 pb-4">
                {/* Search + Filter */}
                {!selectedHospitalFilter && (
                  <div className="flex flex-col gap-4 shrink-0 animate-in fade-in duration-300">
                    <div className="flex gap-2">
                      <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder={language === "en" ? "Search Hospital or Blood Type..." : "Cari RS atau Golongan Darah..."}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 font-medium"
                          aria-label={language === "en" ? "Search Hospital or Blood Type" : "Cari RS atau Golongan Darah"}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
                        aria-label={language === "en" ? "Toggle advanced filters" : "Aktifkan filter lanjutan"}
                        aria-expanded={isAdvancedFilterOpen}
                        className={`px-3.5 py-2.5 rounded-xl border flex items-center justify-center transition-all hover:scale-105 active:scale-95 duration-200 ${
                          isAdvancedFilterOpen || filterBloodType !== "all" || filterUrgency !== "all"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-slate-200 dark:border-slate-800 text-slate-450 bg-slate-50 dark:bg-slate-950/40 hover:text-slate-700 dark:hover:text-slate-200"
                        }`}
                      >
                        <Filter className="w-4 h-4" />
                      </button>
                    </div>

                    <RadiusFilter value={radius} onChange={setRadius} />

                    {isAdvancedFilterOpen && (
                      <AdvancedFilters
                        bloodType={filterBloodType}
                        urgency={filterUrgency}
                        onBloodTypeChange={setFilterBloodType}
                        onUrgencyChange={setFilterUrgency}
                      />
                    )}
                  </div>
                )}

            {/* Sorting Row */}
            <div className="space-y-1.5 shrink-0">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                {language === "en" ? "Sort By" : "Urutkan Berdasarkan"}
              </span>
              <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
                {[
                  { key: 'distance', labelId: 'Terdekat', labelEn: 'Nearest' },
                  { key: 'urgency', labelId: 'Urgensi', labelEn: 'Urgency' },
                  { key: 'bags', labelId: 'Kantong', labelEn: 'Bags Needed' },
                  { key: 'time', labelId: 'Terbaru', labelEn: 'Newest' }
                ]
                  .filter((opt) => !(selectedHospitalFilter && opt.key === 'distance'))
                  .map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setSortBy(opt.key as any)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold whitespace-nowrap transition-all border ${
                      sortBy === opt.key
                        ? 'bg-rose-500 border-transparent text-white shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {language === 'en' ? opt.labelEn : opt.labelId}
                  </button>
                ))}
              </div>
            </div>

            {/* Signal cards list */}
            <div className="flex flex-col gap-4 pb-4">
              {processedRequests.length > 0 ? (
                <>
                  {processedRequests.slice(0, visibleCount).map((req: RequestSignal) => (
                    <DonorSignalCard
                      key={req.id}
                      request={req}
                      isHighlighted={highlightedId === req.id}
                      onClick={() => setHighlightedId(req.id)}
                      onHelp={() => handleHandshakeInit(req)}
                    />
                  ))}
                  
                  {processedRequests.length > visibleCount && (
                    <button
                      type="button"
                      onClick={() => setVisibleCount((prev) => prev + 15)}
                      className="w-full py-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-primary text-xs font-black rounded-2xl border border-slate-200 dark:border-slate-800 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 mt-2"
                    >
                      <span>{language === "en" ? "Load More" : "Tampilkan Lebih Banyak"}</span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        ({processedRequests.length - visibleCount} {language === "en" ? "more" : "tersisa"})
                      </span>
                    </button>
                  )}
                </>
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  {language === "en"
                    ? "No requests match the search criteria."
                    : "Tidak ada permintaan yang sesuai pencarian."}
                </div>
              )}
              </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Handshake Modal */}
      {handshakeReq && (
        <HandshakeModal
          request={handshakeReq}
          isSuccess={handshakeSuccess}
          onConfirm={handleHandshakeConfirm}
          onCancel={() => setHandshakeReq(null)}
        />
      )}
    </div>
  );
}
