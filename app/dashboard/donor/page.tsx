"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Activity, Clock, HeartHandshake, User, LogOut, Heart } from "lucide-react";

interface UserSession {
  email: string;
  fullName: string;
  isLoggedIn: boolean;
}

export default function DonorDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedSession = localStorage.getItem("user_session");
    if (!storedSession) {
      router.push("/login?redirect=/dashboard/donor");
      return;
    }
    try {
      setSession(JSON.parse(storedSession));
    } catch (e) {
      console.error(e);
      router.push("/login?redirect=/dashboard/donor");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user_session");
    router.push("/");
    router.refresh();
  };

  // Mock Data
  const requests = [
    { id: 1, hospital: "RSUP Dr. Sardjito", distance: "2.5 km", bloodType: "O+", urgency: "Tinggi", time: "10 menit lalu", requesterId: "user-101" },
    { id: 2, hospital: "RS Panti Rapih", distance: "4.1 km", bloodType: "A+", urgency: "Sedang", time: "1 jam lalu", requesterId: "user-102" },
    { id: 3, hospital: "RS Bethesda", distance: "5.8 km", bloodType: "B-", urgency: "Kritis", time: "Baru saja", requesterId: "user-103" },
  ];

  if (!mounted || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Shared Unified Navbar */}
      <nav className="w-full bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Heart className="text-primary w-6 h-6 fill-primary" />
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">BloodConnect</span>
          </Link>

          {/* Mode Switcher Toggle (Freelance Style) */}
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-full border border-slate-200/20">
            <button
              onClick={() => router.push("/dashboard/donor")}
              className="px-4 py-2 rounded-full font-bold text-xs bg-white dark:bg-slate-800 text-primary shadow-sm transition-all"
            >
              Mode Pendonor
            </button>
            <button
              onClick={() => router.push("/dashboard/seeker")}
              className="px-4 py-2 rounded-full font-bold text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-all"
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

      {/* Main Content */}
      <div className="flex-grow max-w-4xl w-full mx-auto p-6 mt-6">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Beranda
          </Link>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Status Anda: Bersedia Donor</span>
          </div>
        </div>

        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Permintaan di Sekitar Anda</h1>
          <p className="text-slate-500">Menemukan {requests.length} pasien/pemohon yang membutuhkan bantuan darah saat ini.</p>
        </div>

        <div className="grid gap-6">
          {requests.map((req) => (
            <div key={req.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-primary/30 transition-all">
              
              <div className="flex items-center gap-5">
                {/* Blood Type Badge */}
                <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex flex-col items-center justify-center text-primary border border-rose-200 dark:border-rose-800">
                  <span className="text-xl font-black leading-none">{req.bloodType.replace(/[+-]/g, '')}</span>
                  <span className="text-sm font-bold">{req.bloodType.includes('+') ? 'POS' : 'NEG'}</span>
                </div>
                
                {/* Info */}
                <div>
                  <h3 className="font-bold text-lg mb-1">{req.hospital}</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {req.distance}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {req.time}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action & Info */}
              <div className="w-full md:w-auto flex items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800 md:border-t-0 pt-4 md:pt-0">
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  req.urgency === 'Kritis' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  req.urgency === 'Tinggi' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                  {req.urgency}
                </div>
                
                <div className="flex gap-2">
                  <Link 
                    href={`/profile/${req.requesterId}`}
                    className="px-4 py-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-full font-semibold text-sm transition-all"
                  >
                    Profil Pemohon
                  </Link>
                  <button className="px-5 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-semibold text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-transform active:scale-95 flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4" />
                    Bantu Sekarang
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
