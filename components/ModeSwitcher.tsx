"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "./LanguageProvider";

interface ModeSwitcherProps {
  /** Currently active mode */
  activeMode: "donor" | "seeker";
}

/**
 * Segmented mode toggle between Donor and Seeker radar views.
 * Used in both radar/donor and radar/seeker sidebars.
 */
export default function ModeSwitcher({ activeMode }: ModeSwitcherProps) {
  const router = useRouter();
  const { language } = useLanguage();

  return (
    <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
      <button
        type="button"
        className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
          activeMode === "donor"
            ? "font-black bg-white dark:bg-slate-800 text-primary shadow-sm"
            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-350"
        }`}
        onClick={() => router.push("/radar/donor")}
      >
        {language === "en" ? "Donor Mode" : "Mode Pendonor"}
      </button>
      <button
        type="button"
        className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
          activeMode === "seeker"
            ? "font-black bg-white dark:bg-slate-800 text-primary shadow-sm"
            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-350"
        }`}
        onClick={() => router.push("/radar/seeker")}
      >
        {language === "en" ? "Seeker Mode" : "Mode Pemohon"}
      </button>
    </div>
  );
}
