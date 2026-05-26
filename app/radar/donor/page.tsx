"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Activity, Clock, HeartHandshake, Search, Check, AlertCircle, Loader2 } from "lucide-react";
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


  // Mock Requests matching coordinate positions in MapComponent
  const requests: RequestSignal[] = [
    { id: 1, hospital: "RSUP Dr. Sardjito", distance: "1.2 km", bloodType: "A+", urgency: "Kritis", time: "5 menit lalu", requesterId: "user-101", phone: "6281234567890", bagsNeeded: 2 },
    { id: 3, hospital: "RS Panti Rapih", distance: "2.8 km", bloodType: "AB-", urgency: "Tinggi", time: "34 menit lalu", requesterId: "user-102", phone: "6289876543210", bagsNeeded: 3 },
    { id: 5, hospital: "RS Bethesda", distance: "3.5 km", bloodType: "O-", urgency: "Sedang", time: "1 jam lalu", requesterId: "user-103", phone: "6287755443320", bagsNeeded: 1 },
    { id: 8, hospital: "RS JIH", distance: "5.1 km", bloodType: "O+", urgency: "Kritis", time: "55 menit lalu", requesterId: "user-104", phone: "6281122334450", bagsNeeded: 2 },
  ];

  // Filtering list based on sidebar search
  const filteredRequests = requests.filter((req) => {
    const q = searchQuery.toLowerCase();
    return req.hospital.toLowerCase().includes(q) || req.bloodType.toLowerCase().includes(q);
  });

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
          />
        </div>

        {/* Floating Sidebar (Left Side) */}
        <div className="absolute left-6 top-6 bottom-6 w-96 z-10 flex flex-col bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-[2rem] shadow-2xl p-6 border border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
          
          {/* Header info */}
          <div className="shrink-0 mb-4">
            <div className="flex justify-between items-center mb-4">
              <Link href="/" className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                ← Beranda
              </Link>
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
              Menampilkan {filteredRequests.length} pemohon di Yogyakarta.
            </p>
          </div>

          {/* Search box for filtering requests list */}
          <div className="relative shrink-0 mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari RS atau Golongan Darah..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 font-medium"
            />
          </div>

          {/* Scrollable list of active requests */}
          <div className="flex-grow overflow-y-auto space-y-4 pr-1">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((req) => (
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

                  <div className="flex items-center gap-3.5 mb-3">
                    <div className="w-11 h-11 rounded-xl bg-rose-100 dark:bg-rose-950/40 text-primary border border-rose-200/50 dark:border-rose-900/30 flex flex-col items-center justify-center shrink-0">
                      <span className="text-base font-black leading-none">{req.bloodType.replace(/[+-]/g, '')}</span>
                      <span className="text-[9px] font-bold">{req.bloodType.includes('+') ? 'POS' : 'NEG'}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 line-clamp-1">
                        {req.hospital}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5" />
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
