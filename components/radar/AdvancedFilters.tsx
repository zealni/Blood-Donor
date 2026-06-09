"use client";

import { useLanguage } from "@/components/LanguageProvider";

interface AdvancedFiltersProps {
  bloodType: string;
  urgency: string;
  onBloodTypeChange: (value: string) => void;
  onUrgencyChange: (value: string) => void;
}

/**
 * Collapsible advanced filter panel for blood type + urgency.
 * Used in the donor radar sidebar.
 */
export default function AdvancedFilters({
  bloodType,
  urgency,
  onBloodTypeChange,
  onUrgencyChange,
}: AdvancedFiltersProps) {
  const { language } = useLanguage();

  return (
    <div className="shrink-0 border border-rose-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg bg-rose-50/20 dark:bg-slate-950/20 p-5 space-y-4 animate-in slide-in-from-top-4 duration-300">
      <div className="flex justify-between items-center border-b border-rose-100/50 dark:border-slate-800 pb-2">
        <span className="text-[10px] font-black text-slate-400 tracking-wider">
          {language === "en" ? "ADVANCED FILTERS" : "FILTER LANJUTAN"}
        </span>
        {(bloodType !== "all" || urgency !== "all") && (
          <button
            type="button"
            onClick={() => {
              onBloodTypeChange("all");
              onUrgencyChange("all");
            }}
            className="text-[9px] font-black text-rose-500 hover:text-rose-600 transition-colors uppercase"
          >
            {language === "en" ? "Reset Filters" : "Atur Ulang Filter"}
          </button>
        )}
      </div>

      {/* Blood Type & Rhesus Grid */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">
            {language === "en" ? "Blood Type & Rhesus" : "Golongan Darah & Rhesus"}
          </label>
          {bloodType !== "all" && (
            <span className="text-[9px] font-black text-primary px-2 py-0.5 bg-primary/10 rounded-full uppercase leading-none">
              {language === "en" ? `Active: ${bloodType}` : `Aktif: ${bloodType}`}
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-1.5 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-2xl border border-slate-200/40 dark:border-slate-800/30">
          {["all", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => onBloodTypeChange(b)}
              className={`py-2 rounded-xl text-[10px] font-black transition-all ${
                bloodType === b
                  ? "bg-primary text-white shadow-sm scale-[1.02]"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/40 dark:hover:bg-slate-800/40"
              }`}
            >
              {b === "all"
                ? language === "en" ? "All Blood" : "Semua Gol."
                : b}
            </button>
          ))}
        </div>
      </div>

      {/* Urgency Level */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">
            {language === "en" ? "Urgency Level" : "Tingkat Urgensi"}
          </label>
          {urgency !== "all" && (
            <span className="text-[9px] font-black text-primary px-2 py-0.5 bg-primary/10 rounded-full uppercase leading-none">
              {urgency === "Kritis"
                ? language === "en" ? "Critical" : "Kritis"
                : urgency === "Tinggi"
                ? language === "en" ? "High" : "Tinggi"
                : urgency === "Sedang"
                ? language === "en" ? "Medium" : "Sedang"
                : urgency}
            </span>
          )}
        </div>
        <div className="grid grid-cols-4 gap-1.5 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-2xl border border-slate-200/40 dark:border-slate-800/30">
          {["all", "Kritis", "Tinggi", "Sedang"].map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => onUrgencyChange(u)}
              className={`py-2 rounded-xl text-[9px] font-black transition-all ${
                urgency === u
                  ? "bg-primary text-white shadow-sm scale-[1.02]"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/40 dark:hover:bg-slate-800/40"
              }`}
            >
              {u === "all"
                ? language === "en" ? "All" : "Semua"
                : u === "Kritis"
                ? language === "en" ? "Critical" : "Kritis"
                : u === "Tinggi"
                ? language === "en" ? "High" : "Tinggi"
                : u === "Sedang"
                ? language === "en" ? "Medium" : "Sedang"
                : u}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
