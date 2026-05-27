"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Activity, Clock, HeartHandshake, Search, Check, AlertCircle, Loader2, Filter } from "lucide-react";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";

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

interface RequestSignal {
  id: number;
  hospital: string;
  distance: string;
  bloodType: string;
  urgency: string;
  time: string;
  requesterId: string;
  phone: string;
  bagsNeeded: number;
}

export default function DonorDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [mounted, setMounted] = useState(false);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [radius, setRadius] = useState<number>(0); // 0 means show all
  const [filterBloodType, setFilterBloodType] = useState("all");
  const [filterUrgency, setFilterUrgency] = useState("all");
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  
  // Handshake Modal States
  const [handshakeReq, setHandshakeReq] = useState<RequestSignal | null>(null);
  const [handshakeSuccess, setHandshakeSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedSession = localStorage.getItem("user_session");
    if (!storedSession) {
      router.push("/login?redirect=/radar/donor");
      return;
    }
    try {
      setSession(JSON.parse(storedSession));
    } catch (e) {
      console.error(e);
      router.push("/login?redirect=/radar/donor");
    }
  }, [router]);


  // Seeker requests state populated dynamically from MapComponent
  const [requests, setRequests] = useState<RequestSignal[]>([]);

  const handleHandshakeInit = (req: RequestSignal) => {
    setHandshakeReq(req);
    setHandshakeSuccess(false);
  };

  const handleHandshakeConfirm = () => {
    if (!handshakeReq) return;
    setHandshakeSuccess(true);
    setTimeout(() => {
      // Simulate Anonymous Handshake. Opens WhatsApp with a template text.
      const text = `Halo, saya pendonor sukarela dari BloodConnect. Saya melihat sinyal darurat Anda di ${handshakeReq.hospital} untuk golongan darah ${handshakeReq.bloodType}. Saya bersedia mendonorkan darah saya.`;
      const waUrl = `https://wa.me/${handshakeReq.phone}?text=${encodeURIComponent(text)}`;
      window.open(waUrl, "_blank");
      setHandshakeReq(null);
      setHandshakeSuccess(false);
    }, 1200);
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

      {/* Main Full-Screen Map Container area */}
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
          />
        </div>

        {/* Toggle Button to open Sidebar when collapsed */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute left-4 md:left-6 top-4 md:top-6 z-30 flex items-center gap-2 px-5 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-primary border border-rose-200/50 dark:border-rose-900/30 rounded-full shadow-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all hover:scale-105 active:scale-95 duration-300 font-black text-xs"
          >
            <HeartHandshake className="w-4 h-4 text-primary animate-pulse" />
            <span>Tampilkan Sinyal</span>
          </button>
        )}

        {/* Floating Sidebar (Left Side) */}
        <div className={`absolute top-4 md:top-6 bottom-4 md:bottom-6 left-4 md:left-6 w-[calc(100%-2rem)] md:w-96 z-20 flex flex-col bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-[2rem] shadow-2xl p-6 border border-slate-200/50 dark:border-slate-800/50 overflow-hidden transition-all duration-300 ${
          isSidebarOpen 
            ? "translate-x-0 opacity-100" 
            : "-translate-x-[120%] opacity-0 pointer-events-none"
        }`}>
          
          {/* Header info */}
          <div className="shrink-0 mb-4">
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors gap-1"
                title="Sembunyikan Panel"
              >
                ← Sembunyikan Panel
              </button>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Siaga Donor</span>
              </div>
            </div>
            
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              Sinyal Donor Sekitar
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Menampilkan {requests.length} pemohon di sekitar Anda.
            </p>
          </div>

          {/* Segmented Mode Switcher & PMI DIY: SIAGA Widget */}
          <div className="shrink-0 mb-5 space-y-3">
            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
              <button
                type="button"
                className="py-2.5 rounded-xl text-xs font-black bg-white dark:bg-slate-800 text-primary shadow-sm transition-all"
                onClick={() => router.push("/radar/donor")}
              >
                Mode Pendonor
              </button>
              <button
                type="button"
                className="py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 transition-all"
                onClick={() => router.push("/radar/seeker")}
              >
                Mode Pemohon
              </button>
            </div>

            {/* PMI DIY: SIAGA Widget */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">PMI DIY: SIAGA</span>
                </div>
                <span className="text-[9px] text-slate-450 font-black px-2 py-0.5 bg-slate-200/50 dark:bg-slate-800 rounded-full leading-none">Stok Aktual</span>
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {[
                  { type: "A", count: 45, status: "Cukup", color: "bg-emerald-500" },
                  { type: "B", count: 28, status: "Menipis", color: "bg-amber-500" },
                  { type: "O", count: 82, status: "Aman", color: "bg-emerald-500" },
                  { type: "AB", count: 15, status: "Kritis", color: "bg-rose-500" },
                ].map((stock) => (
                  <div 
                    key={stock.type} 
                    className="py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 text-center flex flex-col justify-between items-center shadow-sm"
                    title={`Stok ${stock.type}: ${stock.count} kantong (${stock.status})`}
                  >
                    <span className="text-xs font-black text-slate-800 dark:text-white leading-none">{stock.type}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${stock.color} my-1.5`} />
                    <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 leading-none">{stock.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Unified Search & Filter Control Row */}
          <div className="flex gap-2 mb-4 shrink-0">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari RS atau Golongan Darah..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 font-medium"
              />
            </div>
            <button
              type="button"
              onClick={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
              className={`px-3.5 py-2.5 rounded-xl border flex items-center justify-center transition-all hover:scale-105 active:scale-95 duration-200 ${
                isAdvancedFilterOpen || filterBloodType !== 'all' || filterUrgency !== 'all'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-slate-200 dark:border-slate-800 text-slate-400 bg-slate-50 dark:bg-slate-950/40 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Filter Lanjutan"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Segmented Radius Tabs (Ultra-Clean, space saving) */}
          <div className="shrink-0 mb-4 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl">
            <div className="flex justify-between items-center mb-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Radius Jangkauan</label>
              <span className="text-[9px] font-black text-primary px-2 py-0.5 bg-primary/10 rounded-full leading-none">
                {radius === 0 ? "Semua Jarak" : `${radius} km`}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1 bg-white dark:bg-slate-900 p-0.5 rounded-xl border border-slate-200/30 dark:border-slate-800/30">
              {[0, 1, 3, 5, 10].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRadius(r)}
                  className={`py-1.5 rounded-lg text-[9px] font-black transition-all ${
                    radius === r
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {r === 0 ? 'Semua' : `${r}km`}
                </button>
              ))}
            </div>
          </div>

          {/* Collapsible Advanced Filters Accordion (Ultra-Premium Seamless Design) */}
          {isAdvancedFilterOpen && (
            <div className="shrink-0 mb-4 border border-rose-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg bg-rose-50/20 dark:bg-slate-950/20 p-5 space-y-4 animate-in slide-in-from-top-4 duration-300">
              <div className="flex justify-between items-center border-b border-rose-100/50 dark:border-slate-800 pb-2">
                <span className="text-[10px] font-black text-slate-400 tracking-wider">FILTER LANJUTAN</span>
                {(filterBloodType !== 'all' || filterUrgency !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setFilterBloodType('all');
                      setFilterUrgency('all');
                    }}
                    className="text-[9px] font-black text-rose-500 hover:text-rose-600 transition-colors uppercase"
                  >
                    Reset Filter
                  </button>
                )}
              </div>

              {/* Golongan Darah & Rhesus Grid */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">Golongan Darah & Rhesus</label>
                  {filterBloodType !== 'all' && (
                    <span className="text-[9px] font-black text-primary px-2 py-0.5 bg-primary/10 rounded-full uppercase leading-none">
                      Aktif: {filterBloodType}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-1.5 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-2xl border border-slate-200/40 dark:border-slate-800/30">
                  {['all', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setFilterBloodType(b)}
                      className={`py-2 rounded-xl text-[10px] font-black transition-all ${
                        filterBloodType === b
                          ? 'bg-primary text-white shadow-sm scale-[1.02]'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/40 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      {b === 'all' ? 'Semua Gol.' : b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Urgensi Pemohon */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">Tingkat Urgensi</label>
                  {filterUrgency !== 'all' && (
                    <span className="text-[9px] font-black text-primary px-2 py-0.5 bg-primary/10 rounded-full uppercase leading-none">
                      {filterUrgency}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-1.5 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-2xl border border-slate-200/40 dark:border-slate-800/30">
                  {['all', 'Kritis', 'Tinggi', 'Sedang'].map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setFilterUrgency(u)}
                      className={`py-2 rounded-xl text-[9px] font-black transition-all ${
                        filterUrgency === u
                          ? 'bg-primary text-white shadow-sm scale-[1.02]'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/40 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      {u === 'all' ? 'Semua' : u}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Scrollable list of active requests */}
          <div className="flex-grow overflow-y-auto space-y-4 pr-1">
            {requests.length > 0 ? (
              requests.map((req) => (
                <div
                  key={req.id}
                  onClick={() => setHighlightedId(req.id)}
                  className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                    highlightedId === req.id
                      ? "bg-primary/5 dark:bg-primary/10 border-primary shadow-md"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {req.time}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-wide ${
                        req.urgency === "Kritis"
                          ? "bg-red-500 text-white animate-pulse"
                          : req.urgency === "Tinggi"
                          ? "bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400"
                          : "bg-yellow-100 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400"
                      }`}
                    >
                      {req.urgency}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mb-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white flex flex-col items-center justify-center shrink-0 shadow-md shadow-rose-500/20">
                      <span className="text-base font-black leading-none">{req.bloodType.replace(/[+-]/g, '')}</span>
                      <span className="text-[8px] font-extrabold mt-0.5 leading-none">{req.bloodType.includes('+') ? 'POS' : 'NEG'}</span>
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="font-black text-sm text-slate-800 dark:text-slate-200 line-clamp-1">
                        {req.hospital}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-primary/70" />
                        Jarak {req.distance} • Butuh {req.bagsNeeded} kantong
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                    <Link
                      href={`/profile/${req.requesterId}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 py-2 text-center border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-[10px] transition-colors"
                    >
                      Profil
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleHandshakeInit(req);
                      }}
                      className="flex-1 py-2 bg-slate-900 dark:bg-white hover:bg-primary dark:hover:bg-primary text-white dark:text-slate-900 dark:hover:text-white rounded-xl font-bold text-[10px] transition-colors flex items-center justify-center gap-1 shadow-sm"
                    >
                      <HeartHandshake className="w-3.5 h-3.5" />
                      Bantu
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                Tidak ada permintaan yang sesuai pencarian.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ANONYMOUS HANDSHAKE CONFIRMATION MODAL */}
      {handshakeReq && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="glass dark:bg-slate-900 p-8 rounded-[2.5rem] max-w-sm w-full border border-white/20 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/40 text-primary flex items-center justify-center mx-auto">
              <HeartHandshake className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Anonymous Handshake
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Anda memilih membantu permintaan di <strong className="text-slate-700 dark:text-slate-300">{handshakeReq.hospital}</strong> dengan Golongan Darah <strong className="text-primary">{handshakeReq.bloodType}</strong>.
              </p>
              <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200/50 dark:border-orange-900/30 text-orange-600 dark:text-orange-400 p-3.5 rounded-2xl flex gap-2 text-[10px] font-semibold leading-relaxed text-left mt-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Kontak Anda dan pemohon dilindungi. Menekan setuju akan membuka koordinasi via WhatsApp secara terenkripsi.</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                disabled={handshakeSuccess}
                onClick={() => setHandshakeReq(null)}
                className="flex-1 py-3 border border-slate-200 dark:border-slate-700 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                disabled={handshakeSuccess}
                onClick={handleHandshakeConfirm}
                className="flex-1 py-3 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/95 transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-primary/20 disabled:opacity-50"
              >
                {handshakeSuccess ? (
                  <>
                    <Check className="w-4 h-4 animate-bounce" />
                    Menghubungkan...
                  </>
                ) : (
                  <>Setuju & Hubungi</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
