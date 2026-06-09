"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "./LanguageProvider";
import { createClient } from "@/lib/supabase/client";
import {
  provinceShortNames,
  provinceCenters,
  parseWkbHexPoint,
  getDistance,
  getProvinceBaseline,
} from "@/lib/geo";
import type { BloodStock } from "@/lib/types";

interface BloodStockWidgetProps {
  userProvince: string;
  onProvinceChange: (province: string) => void;
}

/**
 * PMI Blood Stock Widget with province dropdown.
 * Shows real-time stock data fetched from Supabase.
 * Used in both Donor and Seeker radar sidebars.
 */
export default function BloodStockWidget({
  userProvince,
  onProvinceChange,
}: BloodStockWidgetProps) {
  const { language } = useLanguage();
  const [isPmiDropdownOpen, setIsPmiDropdownOpen] = useState(false);
  const pmiDropdownRef = useRef<HTMLDivElement>(null);

  const [bloodStocks, setBloodStocks] = useState<BloodStock[]>([
    { type: "A", count: 45, status: "Cukup", statusEn: "Sufficient", color: "bg-emerald-500" },
    { type: "B", count: 28, status: "Menipis", statusEn: "Low", color: "bg-amber-500" },
    { type: "O", count: 82, status: "Aman", statusEn: "Safe", color: "bg-emerald-500" },
    { type: "AB", count: 15, status: "Kritis", statusEn: "Critical", color: "bg-rose-500" },
  ]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pmiDropdownRef.current && !pmiDropdownRef.current.contains(event.target as Node)) {
        setIsPmiDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch stock from Supabase
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    async function fetchStock() {
      try {
        const provKey =
          Object.keys(provinceShortNames).find(
            (key) => provinceShortNames[key] === userProvince
          ) || "yogyakarta";

        const center = provinceCenters[provKey] || [-7.795, 110.369];

        const { data: profiles, error } = await supabase
          .from("profiles")
          .select("blood_type, location")
          .eq("is_available", true);

        if (error) {
          console.error("Error fetching profiles for stock:", error);
          return;
        }

        const dbCounts = { A: 0, B: 0, O: 0, AB: 0 };
        if (profiles) {
          profiles.forEach((p: any) => {
            if (p.location && p.blood_type) {
              const coords = parseWkbHexPoint(p.location);
              if (coords) {
                const dist = getDistance(coords[0], coords[1], center[0], center[1]);
                if (dist < 150) {
                  const bt = p.blood_type.toUpperCase();
                  if (bt in dbCounts) {
                    dbCounts[bt as keyof typeof dbCounts]++;
                  }
                }
              }
            }
          });
        }

        const baseline = getProvinceBaseline(provKey);
        const newA = baseline.A + dbCounts.A;
        const newB = baseline.B + dbCounts.B;
        const newO = baseline.O + dbCounts.O;
        const newAB = baseline.AB + dbCounts.AB;

        const getStatus = (count: number, limitLow: number, limitCrit: number) => {
          if (count <= limitCrit)
            return { status: "Kritis", statusEn: "Critical", color: "bg-rose-500" };
          if (count <= limitLow)
            return { status: "Menipis", statusEn: "Low", color: "bg-amber-500" };
          if (count < limitLow * 2)
            return { status: "Cukup", statusEn: "Sufficient", color: "bg-emerald-500" };
          return { status: "Aman", statusEn: "Safe", color: "bg-emerald-500" };
        };

        setBloodStocks([
          { type: "A", count: newA, ...getStatus(newA, 20, 12) },
          { type: "B", count: newB, ...getStatus(newB, 15, 8) },
          { type: "O", count: newO, ...getStatus(newO, 30, 18) },
          { type: "AB", count: newAB, ...getStatus(newAB, 8, 4) },
        ]);
      } catch (err) {
        console.error("Error fetching stock:", err);
      }
    }

    fetchStock();

    const channel = supabase
      .channel("stock-profiles-changes-" + userProvince)
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () =>
        fetchStock()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userProvince]);

  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl">
      <div className="relative" ref={pmiDropdownRef}>
        <div
          onClick={() => setIsPmiDropdownOpen(!isPmiDropdownOpen)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsPmiDropdownOpen(!isPmiDropdownOpen);
            }
          }}
          role="button"
          tabIndex={0}
          aria-expanded={isPmiDropdownOpen}
          aria-haspopup="listbox"
          aria-label={language === "en" ? "Select province for blood stock" : "Pilih provinsi untuk stok darah"}
          className="flex justify-between items-center mb-3 cursor-pointer hover:opacity-85 transition-opacity focus:outline-none focus:ring-1 focus:ring-primary focus:rounded-xl"
        >
          <div className="flex items-center gap-1.5 bg-white/50 dark:bg-slate-900/50 px-2 py-1 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1">
              {language === "en"
                ? `PMI ${userProvince}: READY`
                : `PMI ${userProvince}: SIAGA`}
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </span>
          </div>
          <span className="text-[9px] text-slate-450 font-black px-2 py-1 bg-slate-200/50 dark:bg-slate-800 rounded-full leading-none shrink-0">
            {language === "en" ? "Actual Stock" : "Stok Aktual"}
          </span>
        </div>

        {/* Province Dropdown */}
        {isPmiDropdownOpen && (
          <div className="absolute left-0 mt-1 w-full max-h-56 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xl z-50 py-1.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
            {Object.keys(provinceShortNames).map((key) => {
              const label = provinceShortNames[key];
              const isSelected = label === userProvince;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onProvinceChange(label);
                    localStorage.setItem("detected_province", key);
                    window.dispatchEvent(new Event("local-storage-update"));
                    setIsPmiDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-rose-500/10 dark:bg-rose-500/5 text-primary border-l-4 border-rose-500"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  PMI {label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Stock Grid */}
      <div className="grid grid-cols-4 gap-2">
        {bloodStocks.map((stock) => (
          <div
            key={stock.type}
            className="py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 text-center flex flex-col justify-between items-center shadow-sm"
            title={
              language === "en"
                ? `Stock ${stock.type}: ${stock.count} bags (${stock.statusEn})`
                : `Stok ${stock.type}: ${stock.count} kantong (${stock.status})`
            }
          >
            <span className="text-xs font-black text-slate-800 dark:text-white leading-none">
              {stock.type}
            </span>
            <span className={`w-1.5 h-1.5 rounded-full ${stock.color} my-1.5`} />
            <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 leading-none">
              {stock.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
