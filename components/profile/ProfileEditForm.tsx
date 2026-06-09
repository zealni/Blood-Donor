"use client";

import { User, Mail, MapPin, Save, ChevronDown, Check } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import CalendarPicker from "@/components/CalendarPicker";
import { provinceShortNames } from "@/lib/geo";
import type { UserProfile } from "@/lib/types";

interface ProfileEditFormProps {
  profile: UserProfile;
  initialEligibility: { eligible: boolean };
  loading: boolean;
  onSave: (data: Partial<UserProfile>) => void;
  onCancel: () => void;
}

export default function ProfileEditForm({
  profile,
  initialEligibility,
  loading,
  onSave,
  onCancel,
}: ProfileEditFormProps) {
  const { language } = useLanguage();

  const [fullName, setFullName] = useState(profile.fullName || "");
  const [bloodType, setBloodType] = useState(profile.bloodType || "");
  const [rhesus, setRhesus] = useState(profile.rhesus || "");
  const [lastDonation, setLastDonation] = useState(profile.lastDonation || "");
  const [isAvailable, setIsAvailable] = useState(profile.isAvailable !== false);
  const [location, setLocation] = useState(profile.location || "DIY");
  
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      fullName,
      bloodType: bloodType as UserProfile["bloodType"],
      rhesus: rhesus as UserProfile["rhesus"],
      lastDonation,
      isAvailable,
      location,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-extrabold mb-6">
        {language === "en" ? "Edit My Profile" : "Edit Data Profil Saya"}
      </h2>

      {/* Full Name */}
      <div>
        <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">
          {language === "en" ? "Full Name" : "Nama Lengkap"}
        </label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={language === "en" ? "Full Name" : "Nama Lengkap"}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm font-medium"
          />
        </div>
      </div>

      {/* Email (Readonly) */}
      <div>
        <label className="block text-sm font-bold mb-2 text-slate-500 dark:text-slate-400">
          {language === "en" ? "Email (Cannot be changed)" : "Email (Tidak Dapat Diubah)"}
        </label>
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
          <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">
            {language === "en" ? "Blood Type" : "Gol. Darah"}
          </label>
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
          <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">
            Rhesus
          </label>
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

      {/* Last Donation Date using CalendarPicker */}
      <div>
        <CalendarPicker
          value={lastDonation}
          onChange={(val) => {
            setLastDonation(val);
          }}
          label={language === "en" ? "Last Donation Date" : "Tanggal Donor Terakhir"}
          placeholder={language === "en" ? "Select Date" : "Pilih Tanggal"}
          language={language}
          openUpward={false}
        />
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">
          {language === "en" ? "Location / City" : "Lokasi / Kota"}
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowLocationDropdown(!showLocationDropdown)}
            className="w-full flex items-center justify-between pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
              <span
                className={`text-sm font-medium truncate ${
                  !location ? "text-slate-400" : "text-slate-900 dark:text-slate-100"
                }`}
              >
                {location || (language === "en" ? "Select Province" : "Pilih Wilayah Provinsi")}
              </span>
            </div>
            <ChevronDown
              className={`text-slate-400 w-5 h-5 shrink-0 transition-transform duration-200 ${
                showLocationDropdown ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {showLocationDropdown && (
            <>
              <div
                className="fixed inset-0 z-[90]"
                onClick={() => setShowLocationDropdown(false)}
              />
              <div className="absolute top-[calc(100%+0.5rem)] left-0 w-full max-h-60 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-[100] py-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 animate-in fade-in slide-in-from-top-2">
                {Object.values(provinceShortNames).map((provName) => (
                  <button
                    key={provName}
                    type="button"
                    onClick={() => {
                      setLocation(provName);
                      setShowLocationDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between ${
                      location === provName
                        ? "text-primary bg-primary/5 dark:bg-primary/10"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <span>{provName}</span>
                    {location === provName && (
                      <Check className="w-4 h-4 text-primary shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Availability Status */}
      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/30 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
        <div>
          <span className="block text-sm font-bold text-slate-800 dark:text-slate-200">
            {language === "en" ? "Donor Availability" : "Ketersediaan Donor"}
          </span>
          <span className="text-xs text-slate-500">
            {language === "en"
              ? "Enable to notify seekers you are willing to donate"
              : "Aktifkan untuk memberitahu pemohon bahwa Anda bersedia mendonor"}
          </span>
        </div>
        <label
          className={`relative inline-flex items-center ${
            initialEligibility.eligible ? "cursor-pointer" : ""
          }`}
        >
          <input
            type="checkbox"
            checked={isAvailable && initialEligibility.eligible}
            disabled={!initialEligibility.eligible}
            onChange={(e) => setIsAvailable(e.target.checked)}
            className="sr-only peer"
          />
          <div
            className={`w-11 h-6 rounded-full peer peer-focus:outline-none after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
              !initialEligibility.eligible
                ? "bg-slate-200 dark:bg-slate-800 opacity-50 cursor-not-allowed"
                : "bg-slate-200 dark:bg-slate-700 cursor-pointer peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-slate-600 peer-checked:bg-primary"
            }`}
          />
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
              {language === "en" ? "Save Changes" : "Simpan Perubahan"}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-2xl font-bold text-sm transition-all"
        >
          {language === "en" ? "Cancel" : "Batal"}
        </button>
      </div>
    </form>
  );
}
