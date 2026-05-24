"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Send, MapPin, Activity, AlertCircle, Heart, User, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

      {/* Main Content */}
      <div className="flex-grow max-w-3xl w-full mx-auto p-6 mt-6">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Beranda
        </Link>
        
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Buat Permintaan Darah (Pemohon)</h1>
              <p className="text-slate-500 text-sm mt-1">Sistem akan mencari pendonor terdekat dalam radius 10km.</p>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Golongan Darah */}
            <div>
              <label className="block text-sm font-medium mb-3">Golongan Darah yang Dibutuhkan</label>
              <div className="grid grid-cols-4 gap-3">
                {['A', 'B', 'AB', 'O'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setBloodType(type)}
                    className={`py-3 rounded-xl border-2 font-bold text-lg transition-all ${bloodType === type ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Rhesus */}
            <div>
              <label className="block text-sm font-medium mb-3">Rhesus</label>
              <div className="grid grid-cols-2 gap-3">
                {['+', '-'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setRhesus(type)}
                    className={`py-3 rounded-xl border-2 font-bold text-lg transition-all ${rhesus === type ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'}`}
                  >
                    {type === '+' ? 'Positif (+)' : 'Negatif (-)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Lokasi RS */}
            <div>
              <label className="block text-sm font-medium mb-3">Rumah Sakit / Lokasi</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="text" 
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  placeholder="Nama Rumah Sakit..."
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Catatan Tambahan */}
            <div>
              <label className="block text-sm font-medium mb-3">Catatan Tambahan (Opsional)</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Misal: Butuh 2 kantong, segera."
                className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-h-[100px]"
              ></textarea>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 flex gap-3 text-orange-800 dark:text-orange-300 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>Pastikan informasi yang Anda masukkan valid. Penyalahgunaan sistem akan mengakibatkan pemblokiran akun.</p>
            </div>

            <button type="submit" disabled={success} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:bg-primary/90 transition-all active:scale-[0.98] flex justify-center items-center gap-2 shadow-xl shadow-primary/20 mt-8 disabled:opacity-75">
              {success ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Pancarkan Sinyal Darurat Darah
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
