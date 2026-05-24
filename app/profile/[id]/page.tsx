"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, User, Heart, Mail, Calendar, MapPin, MessageSquare, ShieldCheck } from "lucide-react";

interface UserProfile {
  email: string;
  fullName: string;
  bloodType: string;
  rhesus: string;
  lastDonation: string;
  isAvailable: boolean;
  location: string;
}

export default function PublicProfilePage() {
  const router = useRouter();
  const params = useParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [mounted, setMounted] = useState(false);
  const [contacted, setContacted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Auth Check
    const storedSession = localStorage.getItem("user_session");
    if (!storedSession) {
      router.push(`/login?redirect=/profile/${params.id}`);
      return;
    }

    // Mock Users Data lookup based on ID
    const mockUsers: Record<string, UserProfile> = {
      "user-101": {
        fullName: "Rian Hidayat",
        email: "rian.hidayat@example.com",
        bloodType: "O",
        rhesus: "+",
        lastDonation: "2026-01-10",
        isAvailable: true,
        location: "Sleman, Yogyakarta",
      },
      "user-102": {
        fullName: "Siti Rahma",
        email: "siti.rahma@example.com",
        bloodType: "A",
        rhesus: "+",
        lastDonation: "2026-05-02",
        isAvailable: false,
        location: "Bantul, Yogyakarta",
      },
      "user-103": {
        fullName: "Albertus Sandy",
        email: "albertus.s@example.com",
        bloodType: "B",
        rhesus: "-",
        lastDonation: "",
        isAvailable: true,
        location: "Kota Yogyakarta",
      },
    };

    const targetId = params.id as string;
    if (mockUsers[targetId]) {
      setProfile(mockUsers[targetId]);
    } else {
      // Default fallback fallback user
      setProfile({
        fullName: "Anggota BloodConnect",
        email: "member@bloodconnect.org",
        bloodType: "AB",
        rhesus: "+",
        lastDonation: "2026-02-14",
        isAvailable: true,
        location: "Yogyakarta",
      });
    }
  }, [params.id, router]);

  const handleContact = () => {
    setContacted(true);
    alert(`Anonymous Handshake berhasil! Jalur komunikasi langsung dibuka. Menghubungkan Anda dengan ${profile?.fullName} via WhatsApp...`);
  };

  // Eligibility calculation helper
  const checkEligibility = (dateStr: string) => {
    if (!dateStr) return { eligible: true, text: "Layak donor (Belum pernah donor sebelumnya)" };
    const donationDate = new Date(dateStr);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - donationDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays >= 90) {
      return { eligible: true, text: "Layak donor (Terakhir mendonor > 90 hari yang lalu)" };
    } else {
      const daysLeft = 90 - diffDays;
      return { eligible: false, text: `Belum layak donor (Harus menunggu ${daysLeft} hari lagi)` };
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
        <div className="mb-8">
          <button 
            onClick={() => router.back()}
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </button>
        </div>

        <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md rounded-3xl p-8 shadow-xl space-y-8">
          
          {/* Profile Header */}
          <div className="flex items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="w-20 h-20 rounded-3xl bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center text-primary border border-rose-200 dark:border-rose-900/50 relative">
              <User className="w-10 h-10" />
              {profile.isAvailable && (
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                </span>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{profile.fullName}</h2>
              <p className="text-slate-500 text-sm font-medium flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4 text-slate-400" />
                {profile.location}
              </p>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mt-2.5 ${
                profile.isAvailable 
                  ? "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400" 
                  : "bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400"
              }`}>
                {profile.isAvailable ? "Bersedia Donor" : "Tidak Siaga"}
              </span>
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

          {/* Eligibility Info */}
          <div className={`p-5 rounded-2xl border ${
            eligibility.eligible 
              ? "bg-emerald-50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-400" 
              : "bg-amber-50 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/50 text-amber-800 dark:text-amber-400"
          }`}>
            <div className="flex gap-4">
              <ShieldCheck className="w-6 h-6 shrink-0" />
              <div>
                <h4 className="font-extrabold text-sm mb-1">Status Kelayakan Donor Medis</h4>
                <p className="text-xs leading-relaxed opacity-90">{eligibility.text}</p>
              </div>
            </div>
          </div>

          {/* Anonymous Handshake CTA */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleContact}
              className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-sm hover:bg-primary/90 transition-all hover:shadow-[0_0_35px_rgba(225,29,72,0.2)] active:scale-[0.98] flex justify-center items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              {contacted ? "Hubungi via WhatsApp (Sudah Terhubung)" : "Hubungi via WhatsApp (Anonymous Handshake)"}
            </button>
            <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-3 leading-relaxed">
              *BloodConnect melindungi privasi Anda. Nomor telepon dan kontak hanya akan dibagikan kepada pihak yang bersangkutan ketika handshake disetujui.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
