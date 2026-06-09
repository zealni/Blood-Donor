"use client";

import { useLanguage } from "@/components/LanguageProvider";

interface RadiusFilterProps {
  value: number;
  onChange: (value: number) => void;
}

/**
 * Quick segmented radius filter tabs.
 * Options: All, 1km, 3km, 5km, 10km
 */
export default function RadiusFilter({ value, onChange }: RadiusFilterProps) {
  const { language } = useLanguage();

  return (
    <div className="shrink-0 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl">
      <div className="flex justify-between items-center mb-2">
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
          {language === "en" ? "Search Radius" : "Radius Jangkauan"}
        </label>
        <span className="text-[9px] font-black text-primary px-2 py-0.5 bg-primary/10 rounded-full leading-none">
          {value === 0
            ? language === "en" ? "All Distances" : "Semua Jarak"
            : `${value} km`}
        </span>
      </div>
      <div className="grid grid-cols-5 gap-1 bg-white dark:bg-slate-900 p-0.5 rounded-xl border border-slate-200/30 dark:border-slate-800/30">
        {[0, 1, 3, 5, 10].map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => onChange(r)}
            className={`py-1.5 rounded-lg text-[9px] font-black transition-all ${
              value === r
                ? "bg-primary text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            {r === 0 ? (language === "en" ? "All" : "Semua") : `${r}km`}
          </button>
        ))}
      </div>
    </div>
  );
}
