"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Languages } from "lucide-react";
import { AppLanguage, useLanguage } from "./LanguageProvider";

const labels: Record<AppLanguage, string> = {
  id: "Indonesia",
  en: "English",
};

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const chooseLanguage = (nextLanguage: AppLanguage) => {
    setLanguage(nextLanguage);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        title="Bahasa"
        className={`flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all font-bold ${
          compact ? "w-full px-4 py-3 text-sm" : "px-3 py-2.5 text-xs"
        }`}
        aria-label={language === "en" ? "Change language" : "Ubah bahasa"}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Languages className="w-4 h-4 text-primary" />
        <span>{labels[language]}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className={`absolute ${compact ? "left-0 right-0" : "right-0"} mt-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-1.5 z-[60] min-w-40`}>
          {(["id", "en"] as AppLanguage[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => chooseLanguage(option)}
              className={`w-full px-3 py-2 rounded-xl text-left text-sm font-bold transition-all ${
                language === option
                  ? "bg-primary/10 text-primary"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {labels[option]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
