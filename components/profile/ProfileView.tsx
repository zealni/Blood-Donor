"use client";

import { User, Mail, MapPin, Calendar, Sparkles, ShieldAlert, Edit3 } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import CalendarPicker from "@/components/CalendarPicker";
import type { UserProfile } from "@/lib/types";

interface ProfileViewProps {
  profile: UserProfile;
  eligibility: { eligible: boolean; daysLeft: number; neverDonated: boolean };
  onAvailabilityChange: (checked: boolean) => void;
  onUpdateLastDonation: (dateStr: string) => void;
}

export default function ProfileView({
  profile,
  eligibility,
  onAvailabilityChange,
  onUpdateLastDonation,
}: ProfileViewProps) {
  const { language } = useLanguage();
  const dateLocale = language === "en" ? "en-US" : "id-ID";

  return (
    <div className="space-y-8">
      {/* Profile Card Header */}
      <div className="flex items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="w-20 h-20 rounded-3xl bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center text-primary border border-rose-200 dark:border-rose-900/50 relative">
          <User className="w-10 h-10" />
          {!eligibility.eligible ? (
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white dark:border-slate-900" />
            </span>
          ) : profile.isAvailable ? (
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white dark:border-slate-900" />
            </span>
          ) : null}
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {profile.fullName}
          </h2>
          <p className="text-slate-500 text-sm font-medium flex items-center gap-1 mt-1">
            <Mail className="w-4 h-4 text-slate-400" />
            {profile.email}
          </p>
          <p className="text-slate-500 text-sm font-medium flex items-center gap-1 mt-1">
            <MapPin className="w-4 h-4 text-slate-400" />
            {profile.location || "-"}
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
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              {language === "en" ? "Blood Type" : "Golongan Darah"}
            </span>
            <span className="text-sm font-extrabold text-slate-700 dark:text-slate-300">
              Rhesus {profile.rhesus === "+" ? "Positif (+)" : "Negatif (-)"}
            </span>
          </div>
        </div>

        <div className="relative bg-slate-50 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-4 flex flex-col justify-center">
          <CalendarPicker
            value={profile.lastDonation}
            onChange={onUpdateLastDonation}
            language={language}
            openUpward={false}
            label={language === "en" ? "Last Donation" : "Donor Terakhir"}
            placeholder={language === "en" ? "Never" : "Belum Pernah"}
          />
        </div>
      </div>

      {/* Eligibility Section (Calculated) */}
      <div
        className={`p-5 rounded-2xl border ${
          eligibility.eligible
            ? "bg-emerald-50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-400"
            : "bg-amber-50 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/50 text-amber-800 dark:text-amber-400"
        }`}
      >
        <div className="flex gap-4">
          {eligibility.eligible ? (
            <Sparkles className="w-6 h-6 shrink-0" />
          ) : (
            <ShieldAlert className="w-6 h-6 shrink-0" />
          )}
          <div>
            <h4 className="font-extrabold text-sm mb-1">
              {eligibility.neverDonated
                ? (language === "en" ? "Ready to Donate!" : "Siap Menjadi Pendonor!")
                : eligibility.eligible
                ? (language === "en" ? "Eligible to Donate!" : "Anda Layak Donor Darah!")
                : (language === "en" ? "Not Eligible Yet" : "Belum Layak Donor")}
            </h4>
            <p className="text-xs leading-relaxed opacity-90">
              {eligibility.neverDonated
                ? (language === "en"
                  ? "You have never donated or data is missing. You can start being a hero anytime!"
                  : "Anda belum pernah mendonor darah atau data donor belum diisi. Anda bisa mulai menjadi pahlawan kapan saja!")
                : eligibility.eligible
                ? (language === "en"
                  ? "It's been more than 90 days since your last donation. You are ready to help someone in need."
                  : "Jeda waktu sejak donor terakhir Anda sudah melebihi 90 hari. Anda bisa bersiap untuk membantu pemohon donor kapan saja.")
                : (language === "en"
                  ? `You can donate again in ${eligibility.daysLeft} days (Minimum 90 days interval).`
                  : `Anda baru bisa mendonorkan darah lagi dalam ${eligibility.daysLeft} hari ke depan (Jeda minimal 90 hari setelah donor terakhir).`)}
            </p>
          </div>
        </div>
      </div>

      {/* Status Info */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <span className="block text-sm font-bold text-slate-800 dark:text-slate-200">
            {language === "en" ? "Donor Standby Status" : "Status Siaga Pendonor"}
          </span>
          <span className="text-xs text-slate-500">
            {profile.isAvailable
              ? (language === "en" ? "You are visible to seekers." : "Anda terlihat oleh pemohon donor.")
              : (language === "en" ? "Your status is hidden." : "Status Anda disembunyikan.")}
          </span>
        </div>
        <label
          className={`relative inline-flex items-center ${
            eligibility.eligible ? "cursor-pointer" : ""
          }`}
        >
          <input
            type="checkbox"
            checked={!!profile.isAvailable && eligibility.eligible}
            disabled={!eligibility.eligible}
            onChange={(e) => onAvailabilityChange(e.target.checked)}
            className="sr-only peer"
          />
          <div
            className={`w-11 h-6 rounded-full peer peer-focus:outline-none after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
              !eligibility.eligible
                ? "bg-slate-200 dark:bg-slate-800 opacity-50 cursor-not-allowed"
                : "bg-slate-200 dark:bg-slate-700 cursor-pointer peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-slate-600 peer-checked:bg-primary"
            }`}
          />
        </label>
      </div>
    </div>
  );
}
