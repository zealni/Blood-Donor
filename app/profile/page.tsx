"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Heart, Mail, Calendar, MapPin, Check, Save, Edit3, ShieldAlert, Sparkles } from "lucide-react";

interface UserProfile {
  email: string;
  fullName: string;
  bloodType: "A" | "B" | "AB" | "O" | "";
  rhesus: "+" | "-" | "";
  lastDonation: string;
  isAvailable?: boolean;
  location?: string;
  isLoggedIn?: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Edit fields state
  const [fullName, setFullName] = useState("");
  const [bloodType, setBloodType] = useState<"A" | "B" | "AB" | "O" | "">("");
  const [rhesus, setRhesus] = useState<"+" | "-" | "">("");
  const [lastDonation, setLastDonation] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [location, setLocation] = useState("Yogyakarta");
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    setMounted(true);
    const storedSession = localStorage.getItem("user_session");
    if (!storedSession) {
      router.push("/login?redirect=/profile");
      return;
    }
    try {
      const data: UserProfile = JSON.parse(storedSession);
      setProfile(data);
      
      // Initialize edit fields
      setFullName(data.fullName || "");
      setBloodType(data.bloodType || "");
      setRhesus(data.rhesus || "");
      setLastDonation(data.lastDonation || "");
      setIsAvailable(data.isAvailable !== false);
      setLocation(data.location || "Yogyakarta");
    } catch (e) {
      console.error(e);
      router.push("/login?redirect=/profile");
    }
  }, [router]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!fullName.trim()) {
      setMessage({ type: "error", text: "Nama Lengkap tidak boleh kosong." });
      return;
    }
    if (!bloodType || !rhesus) {
      setMessage({ type: "error", text: "Mohon lengkapi Golongan Darah dan Rhesus." });
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const updatedProfile: UserProfile = {
        ...profile,
        email: profile?.email || "",
        fullName,
        bloodType,
        rhesus,
        lastDonation,
        isAvailable,
        location,
        isLoggedIn: true,
      };

      // 1. Update session in localStorage
      localStorage.setItem("user_session", JSON.stringify(updatedProfile));
      
      // 2. Update list in registered_users to keep consistent
      const storedUsers = localStorage.getItem("registered_users");
      if (storedUsers) {
        try {
          const usersList = JSON.parse(storedUsers);
          const userIndex = usersList.findIndex((u: any) => u.email.toLowerCase() === profile?.email.toLowerCase());
          if (userIndex !== -1) {
            usersList[userIndex] = {
              ...usersList[userIndex],
              fullName,
              bloodType,
              rhesus,
              lastDonation,
              isAvailable,
              location,
            };
            localStorage.setItem("registered_users", JSON.stringify(usersList));
          }
        } catch (e) {
          console.error(e);
        }
      }

      setProfile(updatedProfile);
      setIsEditing(false);
      setMessage({ type: "success", text: "Profil berhasil diperbarui!" });
      
      // Auto clear success message
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }, 1000);
  };

  // Eligibility calculation helper
  const checkEligibility = (dateStr: string) => {
    if (!dateStr) return { eligible: true, daysLeft: 0 };
    const donationDate = new Date(dateStr);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - donationDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays >= 90) {
      return { eligible: true, daysLeft: 0 };
    } else {
      return { eligible: false, daysLeft: 90 - diffDays };
    }
  };

  if (!mounted || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const eligibility = checkEligibility(profile.lastDonation);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-6 py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-2xl mx-auto z-10 relative">
        <div className="flex justify-between items-center mb-8">
          <Link href="/radar/donor" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Dashboard
          </Link>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-full font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
            >
              <Edit3 className="w-4 h-4 text-primary" />
              Edit Profil
            </button>
          )}
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-2xl border text-sm font-medium ${
            message.type === "success" 
              ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400" 
              : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
          }`}>
            {message.text}
          </div>
        )}

        <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md rounded-3xl p-8 shadow-xl">
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-6">
              <h2 className="text-xl font-extrabold mb-6">Edit Data Profil Saya</h2>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nama Lengkap"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm font-medium"
                  />
                </div>
              </div>

              {/* Email (Readonly) */}
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-500 dark:text-slate-400">Email (Tidak Dapat Diubah)</label>
                <div className="relative opacity-60">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-not-allowed text-sm"
                  />
                </div>
              </div>

              {/* Medical Fields */}
              <div className="grid grid-cols-2 gap-4">
                {/* Blood Type Selector */}
                <div>
                  <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Gol. Darah</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(["A", "B", "AB", "O"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setBloodType(type)}
                        className={`py-2.5 rounded-xl border text-sm font-extrabold transition-all ${
                          bloodType === type
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rhesus Selector */}
                <div>
                  <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Rhesus</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(["+", "-"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setRhesus(type)}
                        className={`py-2.5 rounded-xl border text-sm font-extrabold transition-all ${
                          rhesus === type
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700"
                        }`}
                      >
                        {type === "+" ? "Pos (+)" : "Neg (-)"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Last Donation Date */}
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Tanggal Donor Terakhir</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="date"
                    value={lastDonation}
                    onChange={(e) => setLastDonation(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm font-medium"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Lokasi / Kota</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Contoh: Yogyakarta"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm font-medium"
                  />
                </div>
              </div>

              {/* Availability Status */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/30 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
                <div>
                  <span className="block text-sm font-bold text-slate-800 dark:text-slate-200">Ketersediaan Donor</span>
                  <span className="text-xs text-slate-500">Aktifkan untuk memberitahu pemohon bahwa Anda bersedia mendonor</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* Form Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3.5 bg-primary text-primary-foreground rounded-2xl font-bold text-sm hover:bg-primary/90 transition-all hover:shadow-[0_0_35px_rgba(225,29,72,0.2)] active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Simpan Perubahan
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setMessage({ type: "", text: "" });
                  }}
                  className="px-6 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-2xl font-bold text-sm transition-all"
                >
                  Batal
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-8">
              {/* Profile Card Header */}
              <div className="flex items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="w-20 h-20 rounded-3xl bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center text-primary border border-rose-200 dark:border-rose-900/50 relative">
                  <User className="w-10 h-10" />
                  {isAvailable && (
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{profile.fullName}</h2>
                  <p className="text-slate-500 text-sm font-medium flex items-center gap-1 mt-1">
                    <Mail className="w-4 h-4 text-slate-400" />
                    {profile.email}
                  </p>
                  <p className="text-slate-500 text-sm font-medium flex items-center gap-1 mt-1">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {location}
                  </p>
                </div>
              </div>

              {/* Medical Information Indicators */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl font-black">
                    {profile.bloodType || "-"}
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Golongan Darah</span>
                    <span className="text-sm font-extrabold text-slate-700 dark:text-slate-300">Rhesus {profile.rhesus === "+" ? "Positif (+)" : "Negatif (-)"}</span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/35 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Donor Terakhir</span>
                    <span className="text-sm font-extrabold text-slate-700 dark:text-slate-300">
                      {profile.lastDonation ? new Date(profile.lastDonation).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "Belum Pernah"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Eligibility Section (Calculated) */}
              <div className={`p-5 rounded-2xl border ${
                eligibility.eligible 
                  ? "bg-emerald-50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-400" 
                  : "bg-amber-50 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/50 text-amber-800 dark:text-amber-400"
              }`}>
                <div className="flex gap-4">
                  {eligibility.eligible ? (
                    <Sparkles className="w-6 h-6 shrink-0" />
                  ) : (
                    <ShieldAlert className="w-6 h-6 shrink-0" />
                  )}
                  <div>
                    <h4 className="font-extrabold text-sm mb-1">
                      {eligibility.eligible ? "Anda Layak Donor Darah!" : "Belum Layak Donor"}
                    </h4>
                    <p className="text-xs leading-relaxed opacity-90">
                      {eligibility.eligible 
                        ? "Jeda waktu sejak donor terakhir Anda sudah melebihi 90 hari. Anda bisa bersiap untuk membantu pemohon donor kapan saja." 
                        : `Anda baru bisa mendonorkan darah lagi dalam ${eligibility.daysLeft} hari ke depan (Jeda minimal 90 hari setelah donor terakhir).`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Info */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-sm font-medium text-slate-500">
                <span>Status Siaga Pendonor</span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  isAvailable 
                    ? "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400" 
                    : "bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400"
                }`}>
                  {isAvailable ? "Bersedia Mendonor" : "Tidak Aktif"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
