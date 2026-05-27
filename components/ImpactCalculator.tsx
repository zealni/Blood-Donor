"use client";

import { useState } from "react";
import { Heart, Award, Sparkles, Droplet } from "lucide-react";

export default function ImpactCalculator() {
  const [donationsPerYear, setDonationsPerYear] = useState<number>(2);
  const [yearsCount, setYearsCount] = useState<number>(3);

  const totalBags = donationsPerYear * yearsCount;
  const livesSaved = totalBags * 3;
  const volumeML = totalBags * 350;

  // Feedback messages based on lives saved
  const getMotivationalMessage = (lives: number) => {
    if (lives <= 6) return "Langkah awal yang luar biasa! Setiap tetes darah Anda adalah harapan baru bagi keluarga pasien.";
    if (lives <= 18) return "Pahlawan Komunitas! Anda berkontribusi aktif memberikan harapan hidup bagi belasan pasien.";
    return "Pahlawan Kemanusiaan Sejati! Dedikasi Anda memberikan dampak luar biasa dalam menyelamatkan puluhan nyawa.";
  };

  // Calculate percentages for visual filling (capped at 100%)
  const fillPercentage = Math.min((totalBags / 40) * 100, 100);

  return (
    <section className="w-full py-24 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800/80 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-red-500/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3.5 py-1.5 rounded-full">
            Kalkulator Dampak
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-6">
            Dampak Donasi Anda
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-4 text-base md:text-lg">
            Satu kantong darah dapat dipisahkan menjadi sel darah merah, plasma, dan trombosit untuk menyelamatkan hingga tiga nyawa. Lihat dampak nyata yang bisa Anda ciptakan.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-stretch">
          {/* Left Side: Inputs */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="glass dark:bg-slate-900/60 p-8 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-8 h-full flex flex-col justify-center">
              {/* Frequency slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-sm md:text-base text-slate-800 dark:text-slate-200">
                    Frekuensi Donor Per Tahun
                  </h3>
                  <span className="px-3 py-1 bg-red-100 dark:bg-red-950/40 text-primary font-black text-sm rounded-lg border border-red-200/30">
                    {donationsPerYear} Kali
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                  Secara medis, donor darah dapat dilakukan setiap 3 bulan (maksimal 4 kali setahun).
                </p>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="1"
                  value={donationsPerYear}
                  onChange={(e) => setDonationsPerYear(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>1x (12 Bln)</span>
                  <span>2x (6 Bln)</span>
                  <span>3x (4 Bln)</span>
                  <span>4x (3 Bln)</span>
                </div>
              </div>

              {/* Years selector pills */}
              <div className="space-y-4">
                <h3 className="font-extrabold text-sm md:text-base text-slate-800 dark:text-slate-200">
                  Komitmen Jangka Waktu (Tahun)
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 3, 5, 10].map((yr) => (
                    <button
                      key={yr}
                      onClick={() => setYearsCount(yr)}
                      className={`py-3 rounded-xl font-bold text-xs md:text-sm border transition-all ${
                        yearsCount === yr
                          ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-transparent shadow-md"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                      }`}
                    >
                      {yr} {yr === 1 ? "Tahun" : "Thn"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Center/Right Side: Dynamic Visualization */}
          <div className="lg:col-span-7 grid md:grid-cols-2 gap-6">
            {/* Visual Droplet animation panel */}
            <div className="glass dark:bg-slate-900/60 p-8 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800 shadow-xl flex flex-col justify-between items-center text-center relative overflow-hidden h-full">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">
                Visualisasi Volume Darah
              </h3>
              
              <div className="my-8 relative w-36 h-48 border-[6px] border-slate-200 dark:border-slate-700 rounded-b-[4rem] rounded-t-3xl overflow-hidden flex items-end justify-center shadow-inner">
                {/* Liquid level */}
                <div
                  style={{ height: `${fillPercentage}%` }}
                  className="w-full bg-gradient-to-t from-red-600 to-rose-500 absolute bottom-0 left-0 right-0 transition-all duration-500 flex items-center justify-center"
                >
                  {/* Wave effect overlay */}
                  <div className="absolute top-0 left-0 right-0 h-4 bg-white/20 dark:bg-black/20 animate-pulse" />
                  {fillPercentage > 15 && (
                    <span className="font-black text-xs text-white drop-shadow-md select-none">
                      {volumeML >= 1000 ? `${(volumeML / 1000).toFixed(1)}L` : `${volumeML}ml`}
                    </span>
                  )}
                </div>
              </div>

              <div className="w-full">
                <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Total Volume Terkumpul
                </p>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                  {volumeML.toLocaleString("id-ID")} ml
                </h4>
              </div>
            </div>

            {/* Numeric Stats */}
            <div className="flex flex-col gap-6 h-full">
              {/* Stat card 1 */}
              <div className="glass dark:bg-slate-900/60 p-6 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-xl flex-1 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/20 text-red-500 flex items-center justify-center shrink-0">
                  <Droplet className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Kantong Darah
                  </span>
                  <h4 className="text-3xl font-black text-slate-900 dark:text-white leading-none mt-1">
                    {totalBags}
                  </h4>
                  <p className="text-[10px] font-semibold text-slate-400 mt-1">didonasikan</p>
                </div>
              </div>

              {/* Stat card 2 */}
              <div className="glass dark:bg-slate-900/60 p-6 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-xl flex-1 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 flex items-center justify-center shrink-0">
                  <Heart className="w-6 h-6 fill-current animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Jiwa Terselamatkan
                  </span>
                  <h4 className="text-3xl font-black text-rose-500 leading-none mt-1">
                    ~{livesSaved}
                  </h4>
                  <p className="text-[10px] font-semibold text-slate-400 mt-1">potensi nyawa dibantu</p>
                </div>
              </div>

              {/* Motivational Card */}
              <div className="bg-gradient-to-br from-red-500 to-rose-600 text-white p-6 rounded-[2rem] shadow-xl flex-1 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <Award className="w-6 h-6 text-white/80" />
                  <Sparkles className="w-4 h-4 text-white/50" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white/90 leading-relaxed italic">
                    "{getMotivationalMessage(livesSaved)}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
