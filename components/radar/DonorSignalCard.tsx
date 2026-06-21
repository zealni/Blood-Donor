"use client";

import Link from "next/link";
import { MapPin, Clock, HeartHandshake } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import type { RequestSignal } from "@/lib/types";

interface DonorSignalCardProps {
  request: RequestSignal;
  isHighlighted: boolean;
  onClick: () => void;
  onHelp: () => void;
}

/**
 * Individual blood request signal card in the donor sidebar.
 * Shows hospital, blood type, distance, urgency, and action buttons.
 */
export default function DonorSignalCard({
  request: req,
  isHighlighted,
  onClick,
  onHelp,
}: DonorSignalCardProps) {
  const { language } = useLanguage();

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
        isHighlighted
          ? "bg-primary/5 dark:bg-primary/10 border-primary shadow-md"
          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
      }`}
    >
      {/* Header: time + urgency badge */}
      <div className="flex justify-between items-start gap-2 mb-2">
        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {req.time}
        </span>
        <span
          className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-wide ${
            req.urgency === "Kritis"
              ? "bg-red-500 text-white animate-pulse"
              : req.urgency === "Tinggi"
              ? "bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400"
              : "bg-yellow-100 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400"
          }`}
        >
          {req.urgency === "Kritis"
            ? language === "en" ? "Critical" : "Kritis"
            : req.urgency === "Tinggi"
            ? language === "en" ? "High" : "Tinggi"
            : req.urgency === "Sedang"
            ? language === "en" ? "Medium" : "Sedang"
            : req.urgency}
        </span>
      </div>

      {/* Blood type + hospital info */}
      <div className="flex items-center gap-4 mb-3.5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white flex flex-col items-center justify-center shrink-0 shadow-md shadow-rose-500/20">
          <span className="text-base font-black leading-none">
            {req.bloodType.replace(/[+-]/g, "")}
          </span>
          <span className="text-[8px] font-extrabold mt-0.5 leading-none">
            {req.bloodType.includes("+") ? "Pos" : "Neg"}
          </span>
        </div>
        <div className="flex-grow min-w-0">
          <h3 className="font-black text-sm text-slate-800 dark:text-slate-200 line-clamp-1">
            {req.requesterName}
          </h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1 mt-0.5 mb-1 line-clamp-1">
            <MapPin className="w-3 h-3 text-slate-400" />
            {req.hospital}
          </p>
          <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
            {language === "en"
              ? `Distance ${req.distance} • Needs ${req.bagsNeeded} ${req.bagsNeeded === 1 ? "bag" : "bags"}`
              : `Jarak ${req.distance} • Butuh ${req.bagsNeeded} kantong`}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-3">
        <Link
          href={`/profile/${req.requesterId}`}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 py-2 text-center border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-[10px] transition-colors"
        >
          {language === "en" ? "Profile" : "Profil"}
        </Link>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onHelp();
          }}
          className="flex-1 py-2 bg-slate-900 dark:bg-white hover:bg-primary dark:hover:bg-primary text-white dark:text-slate-900 dark:hover:text-white rounded-xl font-bold text-[10px] transition-colors flex items-center justify-center gap-1 shadow-sm"
        >
          <HeartHandshake className="w-3.5 h-3.5" />
          {language === "en" ? "Help" : "Bantu"}
        </button>
      </div>
    </div>
  );
}
