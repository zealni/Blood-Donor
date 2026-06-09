"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Edit3 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { provinceCenters, provinceShortNames } from "@/lib/geo";
import type { UserProfile } from "@/lib/types";
import ProfileView from "@/components/profile/ProfileView";
import ProfileEditForm from "@/components/profile/ProfileEditForm";

export default function ProfileDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
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
    } catch (e) {
      console.error(e);
      router.push("/login?redirect=/profile");
    }
  }, [router]);

  // Eligibility calculation helper
  const checkEligibility = (dateStr?: string) => {
    if (!dateStr) return { eligible: true, daysLeft: 0, neverDonated: true };
    const donationDate = new Date(dateStr);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - donationDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays >= 90) {
      return { eligible: true, daysLeft: 0, neverDonated: false };
    } else {
      return { eligible: false, daysLeft: 90 - diffDays, neverDonated: false };
    }
  };

  const handleSaveForm = async (updatedData: Partial<UserProfile>) => {
    if (!profile) return;
    
    if (!updatedData.fullName?.trim()) {
      setMessage({ type: "error", text: "Nama Lengkap tidak boleh kosong." });
      return;
    }
    if (!updatedData.bloodType || !updatedData.rhesus) {
      setMessage({ type: "error", text: "Mohon lengkapi Golongan Darah dan Rhesus." });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const updatedProfile: UserProfile = {
        ...profile,
        ...updatedData,
        email: profile.email || "",
      };

      const supabase = createClient();
      if (supabase && profile.id) {
        const provKey = Object.keys(provinceShortNames).find(
          (key) => provinceShortNames[key] === updatedProfile.location
        ) || "yogyakarta";
        
        const center = provinceCenters[provKey] || [-7.775, 110.380];
        const pointWKT = `POINT(${center[1]} ${center[0]})`;

        const { error } = await supabase
          .from("profiles")
          .upsert([
            {
              id: profile.id,
              full_name: updatedProfile.fullName,
              blood_type: updatedProfile.bloodType,
              rhesus: updatedProfile.rhesus,
              last_donation: updatedProfile.lastDonation || null,
              is_available: updatedProfile.isAvailable,
              location: pointWKT
            }
          ]);

        if (error) {
          console.error("Error upserting profile in Supabase:", error);
        }
      }

      // Update session in localStorage
      localStorage.setItem("user_session", JSON.stringify(updatedProfile));
      
      setProfile(updatedProfile);
      setIsEditing(false);
      setMessage({ type: "success", text: "Profil berhasil diperbarui!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Terjadi kesalahan saat memperbarui profil." });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAvailability = async (available: boolean) => {
    if (!profile) return;
    const updatedProfile = { ...profile, isAvailable: available };
    setProfile(updatedProfile);
    localStorage.setItem("user_session", JSON.stringify(updatedProfile));
    
    const supabase = createClient();
    if (supabase && profile.id) {
      await supabase
        .from("profiles")
        .update({ is_available: available })
        .eq("id", profile.id);
    }
  };

  const handleUpdateLastDonation = async (dateStr: string) => {
    if (!profile) return;
    const newEligibility = checkEligibility(dateStr);
    const newIsAvailable = newEligibility.eligible ? profile.isAvailable : false;
    
    const updatedProfile = { 
      ...profile, 
      lastDonation: dateStr, 
      isAvailable: newIsAvailable 
    };
    
    setProfile(updatedProfile);
    localStorage.setItem("user_session", JSON.stringify(updatedProfile));
    
    const supabase = createClient();
    if (supabase && profile.id) {
      await supabase
        .from("profiles")
        .update({ 
          last_donation: dateStr || null, 
          is_available: newIsAvailable 
        })
        .eq("id", profile.id);
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
            Kembali ke Dasbor
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
            <ProfileEditForm
              profile={profile}
              initialEligibility={eligibility}
              loading={loading}
              onSave={handleSaveForm}
              onCancel={() => {
                setIsEditing(false);
                setMessage({ type: "", text: "" });
              }}
            />
          ) : (
            <ProfileView
              profile={profile}
              eligibility={eligibility}
              onAvailabilityChange={handleUpdateAvailability}
              onUpdateLastDonation={handleUpdateLastDonation}
            />
          )}
        </div>
      </div>
    </div>
  );
}
