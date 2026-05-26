"use client";

import { Activity, MapPin, Clock, ArrowRight, Heart } from "lucide-react";

interface RequestSignal {
  id: number;
  hospitalName: string;
  bloodType: string;
  rhesus: string;
  bagsNeeded: number;
  urgency: "Kritis" | "Tinggi" | "Sedang";
  timeAgo: string;
}

const mockRequests: RequestSignal[] = [
  {
    id: 1,
    hospitalName: "RSUP Dr. Sardjito, Yogyakarta",
    bloodType: "A",
    rhesus: "+",
    bagsNeeded: 2,
    urgency: "Kritis",
    timeAgo: "5 menit yang lalu",
  },
  {
    id: 2,
    hospitalName: "RS Bethesda, Yogyakarta",
    bloodType: "O",
    rhesus: "-",
    bagsNeeded: 1,
    urgency: "Kritis",
    timeAgo: "12 menit yang lalu",
  },
  {
    id: 3,
    hospitalName: "RS Panti Rapih, Yogyakarta",
    bloodType: "AB",
    rhesus: "+",
    bagsNeeded: 3,
    urgency: "Tinggi",
    timeAgo: "34 menit yang lalu",
  },
  {
    id: 4,
    hospitalName: "RS JIH, Sleman",
    bloodType: "B",
    rhesus: "+",
    bagsNeeded: 2,
    urgency: "Sedang",
    timeAgo: "55 menit yang lalu",
  },
];

interface ActiveRequestsProps {
  onCTA: (path: string) => void;
}

export default function ActiveRequests({ onCTA }: ActiveRequestsProps) {
  return (
    <section className="w-full py-20 bg-slate-50/50 dark:bg-slate-950/20 border-t border-slate-200 dark:border-slate-800/80 relative overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-rose-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-xs font-bold mb-4 border border-red-200/50 dark:border-red-900/30">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>Sinyal SOS Aktif (Yogyakarta & Sekitarnya)</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Kebutuhan Darah <span className="text-primary font-black">Darurat</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xl">
              Setiap detik sangat berarti. Pasien di bawah ini sedang mencari pendonor siaga. Anda dapat menyelamatkan hidup mereka sekarang.
            </p>
          </div>
          <div>
            <button
              onClick={() => onCTA("/radar/donor")}
              className="group inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-rose-600 transition-colors"
            >
              Lihat Semua Permintaan
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockRequests.map((req) => (
            <div
              key={req.id}
              className="glass dark:bg-slate-900/60 rounded-3xl p-6 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:border-red-300/40 dark:hover:border-red-900/30 flex flex-col justify-between h-full group relative overflow-hidden"
            >
              {/* Card top gradient */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {req.timeAgo}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      req.urgency === "Kritis"
                        ? "bg-red-500 text-white animate-pulse"
                        : req.urgency === "Tinggi"
                        ? "bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 border border-orange-200/50 dark:border-orange-900/30"
                        : "bg-yellow-100 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400 border border-yellow-200/50 dark:border-yellow-900/30"
                    }`}
                  >
                    {req.urgency}
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-950/30 dark:to-rose-900/20 border border-red-100 dark:border-red-900/40">
                    <span className="text-2xl font-black text-red-600 dark:text-red-400 leading-none">
                      {req.bloodType}
                    </span>
                    <span className="absolute bottom-1 right-2 text-xs font-black text-red-600 dark:text-red-400">
                      {req.rhesus}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Golongan Darah
                    </h4>
                    <p className="text-sm font-black text-slate-800 dark:text-slate-200">
                      Butuh {req.bagsNeeded} Kantong
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400 text-sm mb-6">
                  <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                  <span className="font-semibold line-clamp-2">{req.hospitalName}</span>
                </div>
              </div>

              <button
                onClick={() => onCTA("/radar/donor")}
                className="w-full py-3 bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-primary dark:hover:bg-primary transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_rgba(225,29,72,0.25)]"
              >
                <Heart className="w-3.5 h-3.5 fill-current" />
                Bantu Sekarang
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
