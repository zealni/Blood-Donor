"use client";

import { useEffect, useState } from "react";
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
      setSession(JSON.parse(storedSession));
    } catch (e) {
      console.error(e);
      router.push("/login?redirect=/radar/seeker");
    }
  }, [router]);

  const handleMapClick = (lat: number, lng: number) => {
    setHospitalCoords([lat, lng]);
    if (!hospital) {
      setHospital(`Titik Terpilih (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
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

        const { error } = await supabase.from("blood_requests").insert([
          {
            seeker_id: session?.id || null,
            hospital_name: hospital,
            hospital_coord: pointWKT,
            blood_type: bloodType,
            rhesus: rhesus,
            bags_needed: 2,
            urgency: "Tinggi",
            status: "open",
          },
        ]);

        if (error) {
          console.error("Error inserting blood request to Supabase:", error);
          alert(`Gagal memancarkan sinyal ke database: ${error.message}`);
          setSuccess(false);
          return;
        }
      }

      setSuccess(false);
      setBloodType("");
      setRhesus("");
      setHospital("");
      setNotes("");
      setHospitalCoords(null);
      alert("Sinyal Darurat Kebutuhan Darah berhasil dipancarkan ke basis data dan pendonor terdekat!");
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
            selectedHospitalPosition={hospitalCoords}
            selectedHospitalName={hospital}
            sidebarOpen={isSidebarOpen}
          />
        </div>

        {/* Toggle Button when sidebar is hidden */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute left-4 md:left-6 top-4 md:top-6 z-30 flex items-center gap-2 px-5 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-primary border border-rose-200/50 dark:border-rose-900/30 rounded-full shadow-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all hover:scale-105 active:scale-95 duration-300 font-black text-xs"
          >
            <Activity className="w-4 h-4 text-primary animate-pulse" />
            <span>{language === "en" ? "Broadcast Signal" : "Pancarkan Sinyal"}</span>
          </button>
        )}

        {/* ═══ SIDEBAR ═══ */}
        <div
          className={`absolute top-4 md:top-6 bottom-4 md:bottom-6 left-4 md:left-6 w-[calc(100%-2rem)] md:w-[400px] z-20 flex flex-col bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-[2rem] shadow-2xl p-6 border border-slate-200/50 dark:border-slate-800/50 overflow-hidden transition-all duration-300 ${
            isSidebarOpen
              ? "translate-x-0 opacity-100"
              : "-translate-x-[120%] opacity-0 pointer-events-none"
          }`}
        >
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

          {/* Form */}
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
                  placeholder={
                    language === "en" ? "Type Hospital Name..." : "Ketik Nama Rumah Sakit..."
                  }
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 font-medium"
                />
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
        </div>
      </div>
    </div>
  );
}
