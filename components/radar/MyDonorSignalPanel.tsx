"use client";

import { useState, useRef, useEffect } from "react";
import { MapPin, ChevronDown, Crosshair, Info } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

interface MyDonorSignalPanelProps {
  isAvailable: boolean;
  myCoords: [number, number] | null;
  broadcastBloodType: string;
  broadcastRhesus: string;
  isSelectingOnMap: boolean;
  onToggleAvailable: (checked: boolean) => void;
  onUpdateSignal: (
    avail: boolean,
    coords?: [number, number],
    bloodType?: string,
    rhesus?: string
  ) => void;
  onBloodTypeChange: (bt: string) => void;
  onRhesusChange: (rh: string) => void;
  onToggleMapSelection: (selecting: boolean) => void;
}

/**
 * "Sinyal Donor Saya" panel — donor's own signal status and controls.
 * Includes availability toggle, blood type selector, location controls.
 */
export default function MyDonorSignalPanel({
  isAvailable,
  myCoords,
  broadcastBloodType,
  broadcastRhesus,
  isSelectingOnMap,
  onToggleAvailable,
  onUpdateSignal,
  onBloodTypeChange,
  onRhesusChange,
  onToggleMapSelection,
}: MyDonorSignalPanelProps) {
  const { language } = useLanguage();
  const [isCardExpanded, setIsCardExpanded] = useState(true);
  const [isBloodTypeDropdownOpen, setIsBloodTypeDropdownOpen] = useState(false);
  const bloodTypeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        bloodTypeDropdownRef.current &&
        !bloodTypeDropdownRef.current.contains(event.target as Node)
      ) {
        setIsBloodTypeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={`p-4 rounded-2xl border transition-all duration-300 space-y-3 ${
        isAvailable
          ? "bg-rose-500/[0.04] dark:bg-rose-500/[0.02] border-rose-500/20 shadow-sm shadow-rose-500/5"
          : "bg-slate-50/50 dark:bg-slate-950/40 border-slate-200/50 dark:border-slate-800/40"
      }`}
    >
      {/* Header with toggle */}
        <div
          onClick={() => {
            if (isAvailable) setIsCardExpanded(!isCardExpanded);
          }}
          onKeyDown={(e) => {
            if (isAvailable && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              setIsCardExpanded(!isCardExpanded);
            }
          }}
          role={isAvailable ? "button" : undefined}
          tabIndex={isAvailable ? 0 : -1}
          aria-expanded={isAvailable ? isCardExpanded : undefined}
          aria-label={language === "en" ? "Toggle my donor signal details" : "Buka/tutup detail sinyal donor saya"}
          className={`flex items-center justify-between ${
            isAvailable ? "cursor-pointer select-none group focus:outline-none focus:ring-1 focus:ring-rose-500 focus:rounded-lg" : ""
          }`}
        >
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            {isAvailable && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isAvailable ? "bg-emerald-500" : "bg-slate-400"
              }`}
            />
          </span>
          <span
            data-no-translate="true"
            className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider"
          >
            {language === "en" ? "My Donor Signal" : "Sinyal Donor Saya"}
          </span>
          {isAvailable && (
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-450 dark:text-slate-500 transition-transform duration-300 group-hover:text-primary ${
                isCardExpanded ? "rotate-180" : ""
              }`}
            />
          )}
        </div>
        <label
          className="relative inline-flex items-center cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={isAvailable}
            onChange={(e) => {
              onToggleAvailable(e.target.checked);
              if (!e.target.checked) {
                onToggleMapSelection(false);
              } else {
                setIsCardExpanded(true);
              }
            }}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500 transition-colors" />
        </label>
      </div>

      {/* Expanded content */}
      {isAvailable && isCardExpanded && (
        <div className="text-[10px] text-slate-500 dark:text-slate-400 space-y-3 border-t border-rose-500/10 pt-3 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Blood Type & Coordinates Grid */}
          <div className="grid grid-cols-2 gap-2">
            {/* Blood Type Box */}
            <div className="relative" ref={bloodTypeDropdownRef}>
              <button
                type="button"
                onClick={() => setIsBloodTypeDropdownOpen(!isBloodTypeDropdownOpen)}
                aria-expanded={isBloodTypeDropdownOpen}
                aria-haspopup="listbox"
                aria-label={language === "en" ? "Change blood type" : "Ubah golongan darah"}
                className="w-full h-full min-h-[46px] flex flex-col justify-center bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200/50 dark:border-slate-800/65 shadow-sm hover:border-rose-500/30 dark:hover:border-rose-500/30 hover:shadow-md transition-all text-left"
              >
                <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">
                  {language === "en" ? "Blood Type" : "Golongan Darah"}
                </span>
                <div className="flex items-center justify-between w-full font-black text-xs text-rose-600 dark:text-rose-450">
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-1.5 w-1.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500" />
                    </span>
                    <span className="text-xs font-black tracking-wide bg-gradient-to-r from-rose-600 to-red-500 dark:from-rose-400 dark:to-red-400 bg-clip-text text-transparent">
                      {broadcastBloodType}
                      {broadcastRhesus}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-300 ${
                      isBloodTypeDropdownOpen ? "rotate-180 text-rose-500" : ""
                    }`}
                  />
                </div>
              </button>

              {isBloodTypeDropdownOpen && (
                <div className="absolute left-0 mt-1.5 w-[210px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-3">
                  <div className="space-y-1.5">
                    <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      {language === "en" ? "Choose Blood Type" : "Pilih Golongan Darah"}
                    </span>
                    <div className="grid grid-cols-4 gap-1 bg-slate-50 dark:bg-slate-950/60 p-0.5 rounded-xl border border-slate-100 dark:border-slate-800/40">
                      {["A", "B", "AB", "O"].map((bt) => (
                        <button
                          key={bt}
                          type="button"
                          onClick={() => {
                            onBloodTypeChange(bt);
                            if (isAvailable) {
                              onUpdateSignal(true, myCoords || undefined, bt, broadcastRhesus);
                            }
                          }}
                          className={`py-1.5 text-xs font-black rounded-lg transition-all ${
                            broadcastBloodType === bt
                              ? "bg-rose-500 text-white shadow-sm shadow-rose-500/20 scale-[1.05]"
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
                          }`}
                        >
                          {bt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      {language === "en" ? "Choose Rhesus" : "Pilih Rhesus"}
                    </span>
                    <div className="grid grid-cols-2 gap-1 bg-slate-50 dark:bg-slate-950/60 p-0.5 rounded-xl border border-slate-100 dark:border-slate-800/40">
                      {[
                        { value: "+", label: "Rh +" },
                        { value: "-", label: "Rh -" },
                      ].map((rh) => (
                        <button
                          key={rh.value}
                          type="button"
                          onClick={() => {
                            onRhesusChange(rh.value);
                            if (isAvailable) {
                              onUpdateSignal(true, myCoords || undefined, broadcastBloodType, rh.value);
                            }
                          }}
                          className={`py-1.5 text-[9px] font-black rounded-lg transition-all ${
                            broadcastRhesus === rh.value
                              ? "bg-rose-500 text-white shadow-sm shadow-rose-500/20 scale-[1.03]"
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
                          }`}
                        >
                          {rh.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Coordinates Box */}
            <div className="flex flex-col justify-center bg-white dark:bg-slate-900 px-3 py-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/65 shadow-sm min-w-0">
              <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">
                {language === "en" ? "My Coordinates" : "Koordinat Saya"}
              </span>
              {myCoords ? (
                <span className="font-mono text-[9px] font-black text-slate-700 dark:text-slate-250 truncate">
                  {myCoords[0].toFixed(5)}, {myCoords[1].toFixed(5)}
                </span>
              ) : (
                <span className="text-[9px] font-black text-rose-500 dark:text-rose-450 animate-pulse">
                  {language === "en" ? "Not Set" : "Belum Diatur"}
                </span>
              )}
            </div>
          </div>


          {/* Location Action Buttons */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  onToggleMapSelection(false);
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      async (pos) => {
                        try {
                          const res = await fetch(`/api/hospitals?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`);
                          if (res.ok) {
                            const hospital = await res.json();
                            // Removed hospital name resolution since Pos Siaga is removed
                          }
                        } catch (err) {
                          console.error("Error resolving nearest hospital name for GPS:", err);
                        }
                        // Update signal with the exact GPS coordinates, do not snap to hospital coordinates
                        onUpdateSignal(true, [pos.coords.latitude, pos.coords.longitude]);
                      },
                      (err) => {
                        if (err.code === 1 || err.code === err.PERMISSION_DENIED) {
                          alert(
                            language === "en"
                              ? "Please grant location access to this website in your browser settings."
                              : "Mohon berikan izin akses lokasi untuk website ini pada pengaturan browser Anda."
                          );
                        } else if (err.code === 2 || err.code === err.POSITION_UNAVAILABLE) {
                          alert(
                            language === "en"
                              ? "Location service is inactive. Please enable GPS or location services on your device."
                              : "Layanan lokasi tidak aktif. Mohon aktifkan GPS atau layanan lokasi pada perangkat Anda."
                          );
                        } else {
                          alert(
                            language === "en"
                              ? "Failed to detect location."
                              : "Gagal mendeteksi lokasi."
                          );
                        }
                      }
                    );
                  } else {
                    alert(
                      language === "en"
                        ? "Browser does not support geolocation."
                        : "Browser tidak mendukung geolokasi."
                    );
                  }
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 rounded-xl text-[10px] font-extrabold hover:border-primary dark:hover:border-primary/60 hover:text-primary transition-all active:scale-[0.97] shadow-sm cursor-pointer"
              >
                <Crosshair className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="truncate">
                  {language === "en" ? "Current GPS" : "Lokasi Sekarang"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onToggleMapSelection(!isSelectingOnMap)}
                className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-[10px] font-extrabold border transition-all active:scale-[0.97] shadow-sm cursor-pointer ${
                  isSelectingOnMap
                    ? "bg-rose-500 border-transparent text-white shadow-md scale-[1.02]"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:border-primary dark:hover:border-primary/60 hover:text-primary"
                }`}
              >
                <MapPin
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isSelectingOnMap ? "text-white" : "text-amber-500"
                  }`}
                />
                <span className="truncate">
                  {language === "en" ? "Pin on Map" : "Pilih di Peta"}
                </span>
              </button>
            </div>

            {isSelectingOnMap && (
              <div className="flex gap-1.5 items-start p-2.5 bg-rose-500/10 dark:bg-rose-500/5 border border-rose-500/20 text-rose-700 dark:text-rose-350 rounded-xl text-[9px] font-bold leading-normal">
                <Info className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span>
                  {language === "en"
                    ? "Click anywhere on the map to set your location."
                    : "Klik di mana saja pada peta untuk menentukan lokasi Anda."}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
