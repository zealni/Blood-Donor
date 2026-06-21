"use client";

import { useEffect, useState, useRef } from "react";
import { Send, MapPin, Activity, AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/components/LanguageProvider";
import { provinceShortNames } from "@/lib/geo";
import type { UserSession } from "@/lib/types";

// Sub-components
import ModeSwitcher from "@/components/ModeSwitcher";
import BloodStockWidget from "@/components/BloodStockWidget";

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

export default function SeekerDashboard() {
  const router = useRouter();
  const { language } = useLanguage();
  const [session, setSession] = useState<UserSession | null>(null);
  const [mounted, setMounted] = useState(false);

  const [bloodType, setBloodType] = useState("");
  const [rhesus, setRhesus] = useState("");
  const [hospital, setHospital] = useState("");
  const [notes, setNotes] = useState("");
  const [success, setSuccess] = useState(false);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userProvince, setUserProvince] = useState("DIY");
  const [hospitalCoords, setHospitalCoords] = useState<[number, number] | null>(null);

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const [activeRequest, setActiveRequest] = useState<any | null>(null);
  const [nearbyDonors, setNearbyDonors] = useState<any[]>([]);

  const selectedHospitalRef = useRef("");

  useEffect(() => {
    if (!hospital || hospital.trim() === "" || hospital.startsWith("Titik Terpilih")) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Skip fetch if current input matches the previously selected suggestion or snap
    if (hospital === selectedHospitalRef.current) {
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
        const res = await fetch(`/api/hospitals?q=${encodeURIComponent(hospital)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
          setShowSuggestions(data.length > 0);
        }
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [hospital]);

  const handleSelectSuggestion = (item: any) => {
    selectedHospitalRef.current = item.nama;
    setHospital(item.nama);
    setHospitalCoords([item.latitude, item.longitude]);
    setShowSuggestions(false);
  };

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
            const matchedProv = Object.keys(provinceShortNames).find((key) =>
              key.includes(loc) || loc.includes(key)
            );
            if (matchedProv) {
              setUserProvince(provinceShortNames[matchedProv]);
              return;
            }
            setUserProvince(parsed.location.toUpperCase());
          }
        } catch (e) {
          console.error(e);
        }
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

  useEffect(() => {
    setMounted(true);
    const storedSession = localStorage.getItem("user_session");
    if (!storedSession) {
      router.push("/login?redirect=/radar/seeker");
      return;
    }
    try {
      const parsedSession = JSON.parse(storedSession);
      setSession(parsedSession);
      
      // Fetch active request
      const fetchActive = async () => {
        const supabase = createClient();
        if (supabase) {
          const { data } = await supabase
            .from("blood_requests")
            .select("*")
            .eq("seeker_id", parsedSession.id)
            .eq("status", "open")
            .order("created_at", { ascending: false })
            .limit(1)
            .single();
          
          if (data) {
            setActiveRequest(data);
          }
        }
      };
      fetchActive();
    } catch (e) {
      console.error(e);
      router.push("/login?redirect=/radar/seeker");
    }
  }, [router]);

  const handleMapClick = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`/api/hospitals?lat=${lat}&lng=${lng}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.nama) {
          selectedHospitalRef.current = data.nama;
          setHospital(data.nama);
          setHospitalCoords([data.latitude, data.longitude]);
        }
      }
    } catch (e) {
      console.error("Error snapping seeker map click to nearest hospital:", e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bloodType || !rhesus || !hospital) {
      alert("Mohon lengkapi golongan darah, rhesus, dan lokasi rumah sakit.");
      return;
    }

    setSuccess(true);
    try {
      const supabase = createClient();
      if (supabase) {
        if (session?.id) {
          const profileUpsert = await supabase.from("profiles").upsert([
            {
              id: session.id,
              full_name: session.fullName || "Pengguna BloodConnect",
              blood_type: bloodType,
              rhesus: rhesus,
              is_available: true,
              location: "POINT(110.380 -7.775)",
            },
          ]);
          if (profileUpsert.error) {
            console.error("Error ensuring profile exists in Supabase:", profileUpsert.error);
          }
        }

        const lat = hospitalCoords ? hospitalCoords[0] : -7.775;
        const lng = hospitalCoords ? hospitalCoords[1] : 110.380;
        const pointWKT = `POINT(${lng} ${lat})`;

        const newRequest = {
          seeker_id: session?.id || null,
          hospital_name: hospital,
          hospital_coord: pointWKT,
          blood_type: bloodType,
          rhesus: rhesus,
          bags_needed: 2,
          urgency: "Tinggi",
          status: "open",
        };

        const { data, error } = await supabase.from("blood_requests").insert([newRequest]).select().single();

        if (error) {
          console.error("Error inserting blood request to Supabase:", error);
          alert(`Gagal memancarkan sinyal ke database: ${error.message}`);
          setSuccess(false);
          return;
        } else {
          setActiveRequest(data);
        }
      }

      setSuccess(false);
      setBloodType("");
      setRhesus("");
      setHospital("");
      setNotes("");
      setHospitalCoords(null);
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem saat mengirim sinyal.");
      setSuccess(false);
    }
  };

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
        {/* Full-screen Map */}
        <div className="absolute inset-0 z-0">
          <MapComponent
            preview={false}
            onMapClick={handleMapClick}
            onDonorsUpdate={(donors) => setNearbyDonors(donors)}
            selectedHospitalPosition={hospitalCoords}
            selectedHospitalName={hospital}
            sidebarOpen={isSidebarOpen}
          />
        </div>

        {/* Toggle Button when sidebar is hidden */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute left-4 md:left-6 bottom-4 md:bottom-auto md:top-6 z-30 flex items-center gap-2 px-5 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-primary border border-rose-200/50 dark:border-rose-900/30 rounded-full shadow-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all hover:scale-105 active:scale-95 duration-300 font-black text-xs"
          >
            <Activity className="w-4 h-4 text-primary animate-pulse" />
            <span>{language === "en" ? "Broadcast Signal" : "Pancarkan Sinyal"}</span>
          </button>
        )}

        {/* ═══ SIDEBAR ═══ */}
        <div
          className={`absolute bottom-4 left-4 right-4 top-auto h-[55vh] w-[calc(100%-2rem)] md:top-6 md:bottom-6 md:left-6 md:right-auto md:h-auto md:w-[400px] z-20 flex flex-col bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-[2rem] shadow-2xl p-6 pb-8 md:pb-6 border border-slate-200/50 dark:border-slate-800/50 overflow-hidden transition-all duration-300 ${
            isSidebarOpen
              ? "translate-y-0 md:translate-x-0 opacity-100"
              : "translate-y-[120%] md:-translate-x-[120%] opacity-0 pointer-events-none"
          }`}
        >
          {/* Mobile Drag Handle Indicator */}
          <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-4 md:hidden shrink-0" />

          {/* Header */}
          <div className="shrink-0 mb-4">
            <div className="flex justify-between items-center mb-3">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors gap-1"
                title={language === "en" ? "Hide Panel" : "Sembunyikan Panel"}
              >
                {language === "en" ? "← Hide Panel" : "← Sembunyikan Panel"}
              </button>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  {language === "en" ? "SEEKER MODE" : "Mode Pemohon"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Activity className="w-4.5 h-4.5" />
              </div>
              <div>
                <h1 className="text-lg font-black text-slate-900 dark:text-white">
                  {language === "en" ? "Broadcast Emergency" : "Pancarkan Sinyal Darurat"}
                </h1>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  {language === "en"
                    ? "System maps 10km radius to closest donors."
                    : "Sistem memetakan radius 10km ke pendonor terdekat."}
                </p>
              </div>
            </div>
          </div>

          {/* Widgets */}
          <div className="shrink-0 mb-4">
            <ModeSwitcher activeMode="seeker" />
          </div>

            {/* Form vs Active Request View */}
            {!activeRequest ? (
              <form className="flex-grow overflow-y-auto space-y-5 pr-1" onSubmit={handleSubmit}>
                <BloodStockWidget userProvince={userProvince} onProvinceChange={setUserProvince} />

                {/* Blood Type */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {language === "en" ? "Blood Type" : "Golongan Darah"}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {["A", "B", "AB", "O"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setBloodType(type)}
                        className={`py-2 rounded-xl border-2 font-black text-sm transition-all ${
                          bloodType === type
                            ? "border-primary bg-primary/5 text-primary shadow-sm"
                            : "border-slate-100 dark:border-slate-800 text-slate-500 bg-slate-50/50 dark:bg-slate-950/20 hover:border-slate-200 dark:hover:border-slate-700"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rhesus */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {language === "en" ? "Rhesus" : "Rhesus"}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["+", "-"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setRhesus(type)}
                        className={`py-2 rounded-xl border-2 font-bold text-xs transition-all ${
                          rhesus === type
                            ? "border-primary bg-primary/5 text-primary shadow-sm"
                            : "border-slate-100 dark:border-slate-800 text-slate-500 bg-slate-50/50 dark:bg-slate-950/20 hover:border-slate-200 dark:hover:border-slate-700"
                        }`}
                      >
                        {type === "+"
                          ? language === "en" ? "Rhesus Positive (+)" : "Rhesus Positif (+)"
                          : language === "en" ? "Rhesus Negative (-)" : "Rhesus Negatif (-)"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hospital/Location */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {language === "en" ? "Hospital / Location" : "Rumah Sakit / Lokasi"}
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      value={hospital}
                      onChange={(e) => setHospital(e.target.value)}
                      onFocus={() => {
                        if (suggestions.length > 0) setShowSuggestions(true);
                      }}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      placeholder={
                        language === "en" ? "Type Hospital Name..." : "Ketik Nama Rumah Sakit..."
                      }
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 font-medium"
                    />
                    
                    {/* Suggestions Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute left-0 right-0 mt-1.5 max-h-60 overflow-y-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 divide-y divide-slate-100 dark:divide-slate-800">
                        {suggestions.map((item) => (
                          <button
                            key={item.kode_rs}
                            type="button"
                            onClick={() => handleSelectSuggestion(item)}
                            className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col gap-0.5"
                          >
                            <span className="font-bold text-xs text-slate-900 dark:text-white">
                              {item.nama}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium line-clamp-1">
                              {item.alamat || item.wilayah}
                            </span>
                            <span className="text-[9px] text-primary/80 dark:text-rose-400 font-semibold uppercase tracking-wider mt-0.5">
                              {item.wilayah}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/50 rounded-xl">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      {language === "en"
                        ? "📍 Hospital GPS Coordinates"
                        : "📍 Koordinat GPS Rumah Sakit"}
                    </span>
                    {hospitalCoords ? (
                      <span className="text-xs font-black text-primary animate-pulse">
                        Lat: {hospitalCoords[0].toFixed(5)}, Lng: {hospitalCoords[1].toFixed(5)}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 leading-normal font-semibold block">
                        {language === "en"
                          ? "💡 Click on the hospital area on the map to pin the GPS location precisely."
                          : "💡 Klik area rumah sakit di peta sebelah kanan untuk menandai lokasi GPS secara presisi."}
                      </span>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {language === "en" ? "Additional Notes" : "Catatan Tambahan"}
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={
                      language === "en"
                        ? "Example: Need 2 bags, urgently in ICU room."
                        : "Contoh: Butuh 2 kantong, segera di IGD Dr. Sardjito."
                    }
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 font-medium min-h-[80px]"
                  />
                </div>

                <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200/50 dark:border-orange-900/30 rounded-2xl p-4 flex gap-2.5 text-orange-600 dark:text-orange-400 text-[10px] font-semibold leading-relaxed">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                  <p>
                    {language === "en"
                      ? "Ensure medical information is filled in correctly. Donors will respond based on your blood type and hospital coordinate."
                      : "Pastikan informasi medis diisi dengan benar. Pendonor akan merespon berdasarkan golongan darah dan titik koordinat RS Anda."}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={success}
                  className="w-full py-3.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/95 transition-all active:scale-[0.98] flex justify-center items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-75"
                >
                  {success ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {language === "en" ? "Broadcast SOS Signal" : "Pancarkan Sinyal Sos"}
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="flex-grow overflow-y-auto space-y-4 pr-1 flex flex-col pb-4">
                {/* Active Request Details */}
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                        Status Permintaan
                      </h3>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                        Menunggu respon dari pendonor
                      </p>
                    </div>
                    <div className="bg-primary text-white text-[10px] font-black px-2 py-1 rounded-md">
                      {activeRequest.blood_type}{activeRequest.rhesus}
                    </div>
                  </div>
                  
                  <div className="bg-white/50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-black text-slate-700 dark:text-slate-200 line-clamp-1">
                      {activeRequest.hospital_name}
                    </p>
                  </div>

                  <button
                    onClick={async () => {
                      const supabase = createClient();
                      if (supabase) {
                        await supabase.from("blood_requests").update({ status: 'fulfilled' }).eq('id', activeRequest.id);
                        setActiveRequest(null);
                        alert("Permintaan berhasil ditutup.");
                      }
                    }}
                    className="w-full py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-[11px] hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                  >
                    Selesaikan Permintaan
                  </button>
                </div>

                {/* Nearby Donors List */}
                <div className="flex-grow flex flex-col">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white mb-3 px-1 uppercase tracking-wider flex items-center justify-between">
                    <span>Pendonor Siaga Terdekat</span>
                    <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[10px] font-black">
                      {nearbyDonors.length}
                    </span>
                  </h4>
                  
                  <div className="space-y-2 flex-grow overflow-y-auto min-h-0 pr-1">
                    {nearbyDonors.length === 0 ? (
                      <div className="py-6 text-center text-slate-400 text-xs font-semibold">
                        Mencari pendonor di sekitar...
                      </div>
                    ) : (
                      nearbyDonors.map((donor) => (
                        <div key={donor.id} className="bg-white dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/50 rounded-xl p-3 flex items-center justify-between hover:border-emerald-200 dark:hover:border-emerald-900 transition-colors cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center border border-emerald-100 dark:border-emerald-800 flex-shrink-0">
                              <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm">
                                {donor.bloodType}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <h5 className="font-bold text-slate-900 dark:text-white text-[11px] truncate">
                                {donor.name}
                              </h5>
                              <p className="text-[10px] text-slate-500 font-medium truncate">
                                Jarak {donor.distance}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] font-black uppercase text-emerald-500 bg-emerald-50 dark:bg-emerald-950 px-2 py-1 rounded-md whitespace-nowrap">
                              {donor.urgency}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
