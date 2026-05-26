"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Send, MapPin, Activity, AlertCircle, Heart, User, LogOut, Loader2, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

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

interface UserSession {
  email: string;
  fullName: string;
  isLoggedIn: boolean;
}

export default function SeekerDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [mounted, setMounted] = useState(false);

  const [bloodType, setBloodType] = useState("");
  const [rhesus, setRhesus] = useState("");
  const [hospital, setHospital] = useState("");
  const [notes, setNotes] = useState("");
  const [success, setSuccess] = useState(false);
  
  // Coordinate selection states
  const [hospitalCoords, setHospitalCoords] = useState<[number, number] | null>(null);

  useEffect(() => {
    setMounted(true);
    const storedSession = localStorage.getItem("user_session");
    if (!storedSession) {
      router.push("/login?redirect=/dashboard/seeker");
      return;
    }
    try {
      setSession(JSON.parse(storedSession));
    } catch (e) {
      console.error(e);
      router.push("/login?redirect=/dashboard/seeker");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user_session");
    router.push("/");
    router.refresh();
  };

  const handleMapClick = (lat: number, lng: number) => {
    setHospitalCoords([lat, lng]);
    // Auto-fill hospital coordinates description if hospital name is empty
    if (!hospital) {
      setHospital(`Titik Terpilih (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bloodType || !rhesus || !hospital) {
      alert("Mohon lengkapi golongan darah, rhesus, dan lokasi rumah sakit.");
      return;
    }
    
    // Simulate Request Submission
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setBloodType("");
      setRhesus("");
      setHospital("");
      setNotes("");
      setHospitalCoords(null);
      alert("Sinyal Darurat Kebutuhan Darah berhasil dipancarkan ke pendonor terdekat!");
    }, 1500);
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
      {/* Shared Unified Navbar */}
      <nav className="w-full bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md z-30 shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Heart className="text-primary w-6 h-6 fill-primary animate-pulse" />
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">BloodConnect</span>
          </Link>

          {/* Mode Switcher Toggle */}
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-full border border-slate-200/20">
            <button
              onClick={() => router.push("/dashboard/donor")}
              className="px-4 py-2 rounded-full font-bold text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-all"
            >
              Mode Pendonor
            </button>
            <button
              onClick={() => router.push("/dashboard/seeker")}
              className="px-4 py-2 rounded-full font-bold text-xs bg-white dark:bg-slate-800 text-primary shadow-sm transition-all"
            >
              Mode Pemohon
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/profile" className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-full hover:bg-slate-100 transition-all">
              <User className="w-3.5 h-3.5 text-primary" />
              {session.fullName}
            </Link>
            <button 
              onClick={handleLogout} 
              className="p-2 text-slate-500 hover:text-red-500 transition-colors"
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Full-Screen Seeker Page area */}
      <div className="flex-grow relative w-full h-full overflow-hidden z-10 flex">
        
        {/* Full-screen Map for pinning hospital location */}
        <div className="absolute inset-0 z-0">
          <MapComponent 
            preview={false} 
            onMapClick={handleMapClick}
            selectedHospitalPosition={hospitalCoords}
            selectedHospitalName={hospital}
          />
        </div>

        {/* Floating Form Panel (Left Side) */}
        <div className="absolute left-6 top-6 bottom-6 w-[400px] z-10 flex flex-col bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-[2rem] shadow-2xl p-6 border border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
          
          {/* Header Info */}
          <div className="shrink-0 mb-4">
            <Link href="/" className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-3">
              ← Beranda
            </Link>
            
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Activity className="w-4.5 h-4.5" />
              </div>
              <div>
                <h1 className="text-lg font-black text-slate-900 dark:text-white">Pancarkan Sinyal Darurat</h1>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Sistem memetakan radius 10km ke pendonor terdekat.</p>
              </div>
            </div>
          </div>

          {/* Form container - Scrollable */}
          <form className="flex-grow overflow-y-auto space-y-5 pr-1" onSubmit={handleSubmit}>
            {/* Golongan Darah */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Golongan Darah</label>
              <div className="grid grid-cols-4 gap-2">
                {['A', 'B', 'AB', 'O'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setBloodType(type)}
                    className={`py-2 rounded-xl border-2 font-black text-sm transition-all ${
                      bloodType === type 
                        ? 'border-primary bg-primary/5 text-primary shadow-sm' 
                        : 'border-slate-100 dark:border-slate-800 text-slate-500 bg-slate-50/50 dark:bg-slate-950/20 hover:border-slate-200 dark:hover:border-slate-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Rhesus */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rhesus</label>
              <div className="grid grid-cols-2 gap-2">
                {['+', '-'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setRhesus(type)}
                    className={`py-2 rounded-xl border-2 font-bold text-xs transition-all ${
                      rhesus === type 
                        ? 'border-primary bg-primary/5 text-primary shadow-sm' 
                        : 'border-slate-100 dark:border-slate-800 text-slate-500 bg-slate-50/50 dark:bg-slate-950/20 hover:border-slate-200 dark:hover:border-slate-700'
                    }`}
                  >
                    {type === '+' ? 'Rhesus Positif (+)' : 'Rhesus Negatif (-)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Lokasi RS */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rumah Sakit / Lokasi</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text" 
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  placeholder="Ketik Nama Rumah Sakit..."
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 font-medium"
                />
              </div>

              {/* GPS Coordinates selection notification */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/50 rounded-xl">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">📍 Koordinat GPS Rumah Sakit</span>
                {hospitalCoords ? (
                  <span className="text-xs font-black text-primary animate-pulse">
                    Lat: {hospitalCoords[0].toFixed(5)}, Lng: {hospitalCoords[1].toFixed(5)}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 leading-normal font-semibold block">
                    💡 Klik area rumah sakit di peta sebelah kanan untuk menandai lokasi GPS secara presisi.
                  </span>
                )}
              </div>
            </div>

            {/* Catatan Tambahan */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Catatan Tambahan</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Butuh 2 kantong, segera di IGD Dr. Sardjito."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 font-medium min-h-[80px]"
              ></textarea>
            </div>

            <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200/50 dark:border-orange-900/30 rounded-2xl p-4 flex gap-2.5 text-orange-600 dark:text-orange-400 text-[10px] font-semibold leading-relaxed">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <p>Pastikan informasi medis diisi dengan benar. Pendonor akan merespon berdasarkan golongan darah dan titik koordinat RS Anda.</p>
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
                  Pancarkan Sinyal Sos
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
