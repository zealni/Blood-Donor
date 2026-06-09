"use client";

import { useEffect, useState } from "react";
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
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [radius, setRadius] = useState<number>(0);
  const [filterBloodType, setFilterBloodType] = useState("all");
  const [filterUrgency, setFilterUrgency] = useState("all");
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);

  // Province detection
  const [userProvince, setUserProvince] = useState("DIY");

  // Donor signal state
  const [isAvailable, setIsAvailable] = useState(false);
  const [myCoords, setMyCoords] = useState<[number, number] | null>(null);
  const [isSelectingOnMap, setIsSelectingOnMap] = useState(false);
  const [broadcastBloodType, setBroadcastBloodType] = useState<string>("O");
  const [broadcastRhesus, setBroadcastRhesus] = useState<string>("+");

  // Handshake modal
  const [handshakeReq, setHandshakeReq] = useState<RequestSignal | null>(null);
  const [handshakeSuccess, setHandshakeSuccess] = useState(false);

  // Seeker requests from MapComponent
  const [requests, setRequests] = useState<RequestSignal[]>([]);

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
    <div className="h-screen w-screen bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden relative">
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
            onSignalsUpdate={setRequests}
            onMapClick={
              isAvailable && isSelectingOnMap
                ? (lat, lng) => updateMySignal(true, [lat, lng])
                : undefined
            }
            selectedHospitalPosition={isAvailable ? myCoords : null}
            selectedHospitalName={
              isAvailable
                ? language === "en" ? "My Location" : "Lokasi Saya"
                : undefined
            }
          />
        </div>

        {/* Toggle button when sidebar is hidden */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute left-4 md:left-6 top-4 md:top-6 z-30 flex items-center gap-2 px-5 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-primary border border-rose-200/50 dark:border-rose-900/30 rounded-full shadow-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all hover:scale-105 active:scale-95 duration-300 font-black text-xs"
          >
            <HeartHandshake className="w-4 h-4 text-primary animate-pulse" />
            <span>{language === "en" ? "Show Signals" : "Tampilkan Sinyal"}</span>
          </button>
        )}

        {/* ═══ SIDEBAR ═══ */}
        <div
          className={`absolute top-4 md:top-6 bottom-4 md:bottom-6 left-4 md:left-6 w-[calc(100%-2rem)] md:w-96 z-20 flex flex-col bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-[2rem] shadow-2xl p-6 border border-slate-200/50 dark:border-slate-800/50 overflow-hidden transition-all duration-300 ${
            isSidebarOpen
              ? "translate-x-0 opacity-100"
              : "-translate-x-[120%] opacity-0 pointer-events-none"
          }`}
        >
          {/* Header */}
          <div className="shrink-0 mb-4">
            <div className="flex justify-between items-center mb-4">
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

            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              {language === "en" ? "Nearby Donor Signals" : "Sinyal Pendonor Sekitar"}
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              {language === "en"
                ? `Showing ${requests.length} requester(s) near you.`
                : `Menampilkan ${requests.length} pemohon di sekitar Anda.`}
            </p>
          </div>

          {/* Fixed widgets */}
          <div className="shrink-0 mb-4">
            <ModeSwitcher activeMode="donor" />
          </div>

          {/* Scrollable area */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-1 min-h-0">
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

            {/* Search + Filter */}
            <div className="flex gap-2 shrink-0">
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

            {/* Signal cards list */}
            <div className="flex flex-col gap-4 pb-4">
              {requests.length > 0 ? (
                requests.map((req) => (
                  <DonorSignalCard
                    key={req.id}
                    request={req}
                    isHighlighted={highlightedId === req.id}
                    onClick={() => setHighlightedId(req.id)}
                    onHelp={() => handleHandshakeInit(req)}
                  />
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  {language === "en"
                    ? "No requests match the search criteria."
                    : "Tidak ada permintaan yang sesuai pencarian."}
                </div>
              )}
            </div>
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
