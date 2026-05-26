"use client";

import { useState } from "react";
import { Info, HelpCircle, Droplet } from "lucide-react";

interface BloodGroupInfo {
  name: string;
  giveTo: string[];
  receiveFrom: string[];
  description: string;
}

const bloodCompatibilityData: Record<string, BloodGroupInfo> = {
  "O-": {
    name: "O-",
    giveTo: ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
    receiveFrom: ["O-"],
    description: "Pendonor Universal. Golongan darah Anda dapat didonorkan ke semua pasien golongan darah lainnya. Namun, jika Anda memerlukan transfusi, Anda hanya dapat menerima dari golongan O-."
  },
  "O+": {
    name: "O+",
    giveTo: ["O+", "A+", "B+", "AB+"],
    receiveFrom: ["O+", "O-"],
    description: "Golongan darah paling umum. Sangat berharga untuk membantu mendonorkan darah ke lebih dari 80% populasi yang bergolongan darah rhesus positif."
  },
  "A-": {
    name: "A-",
    giveTo: ["A-", "A+", "AB-", "AB+"],
    receiveFrom: ["A-", "O-"],
    description: "Golongan darah yang tergolong langka. Sangat dicari untuk membantu pasien A- maupun golongan darah campuran AB-."
  },
  "A+": {
    name: "A+",
    giveTo: ["A+", "AB+"],
    receiveFrom: ["A+", "A-", "O+", "O-"],
    description: "Golongan darah yang sangat krusial dalam stok harian rumah sakit. Memiliki kontribusi besar bagi penanganan pasien rhesus positif."
  },
  "B-": {
    name: "B-",
    giveTo: ["B-", "B+", "AB-", "AB+"],
    receiveFrom: ["B-", "O-"],
    description: "Sangat langka dan penting. Menjadi penyelamat bagi pasien B- dan AB- yang menghadapi situasi medis mendesak."
  },
  "B+": {
    name: "B+",
    giveTo: ["B+", "AB+"],
    receiveFrom: ["B+", "B-", "O+", "O-"],
    description: "Golongan darah yang penting untuk mencukupi kebutuhan darah pasien bergolongan B+ dan AB+."
  },
  "AB-": {
    name: "AB-",
    giveTo: ["AB-", "AB+"],
    receiveFrom: ["AB-", "A-", "B-", "O-"],
    description: "Golongan darah paling langka kedua di dunia. Ketersediaan pendonor AB- sangat menentukan keselamatan pasien bergolongan serupa."
  },
  "AB+": {
    name: "AB+",
    giveTo: ["AB+"],
    receiveFrom: ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
    description: "Penerima Universal. Anda dapat menerima transfusi darah dari golongan darah manapun secara aman, namun Anda hanya bisa mendonorkan darah Anda ke sesama pemilik AB+."
  }
};

const bloodTypes = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"];

export default function BloodMatrix() {
  const [selectedType, setSelectedType] = useState<string>("O-");
  const selectedInfo = bloodCompatibilityData[selectedType];

  return (
    <section id="blood-matrix" className="w-full py-24 bg-slate-50/50 dark:bg-slate-950/20 border-t border-slate-200 dark:border-slate-800/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3.5 py-1.5 rounded-full">
            Edukasi Medis
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-6">
            Kecocokan Golongan Darah
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-4 text-base md:text-lg">
            Ketahui siapa saja yang dapat menerima donor dari Anda, dan dari siapa saja Anda bisa menerima bantuan transfusi.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12 items-center">
          {/* Left: Explanation and selected group info */}
          <div className="lg:col-span-2 flex flex-col justify-center">
            <div className="glass dark:bg-slate-900/60 p-8 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800 shadow-xl relative overflow-hidden">
              {/* Decorative background droplet outline */}
              <Droplet className="absolute -bottom-10 -right-10 w-44 h-44 text-red-500/5 dark:text-red-500/5 stroke-[0.5]" />
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl">
                  {selectedType}
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                    Detail Golongan Darah {selectedType}
                  </h3>
                  <p className="text-xs font-medium text-slate-400">Rhesus {selectedType.includes("+") ? "Positif (+)" : "Negatif (-)"}</p>
                </div>
              </div>

              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                {selectedInfo.description}
              </p>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    Bisa Mendonorkan Ke:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedInfo.giveTo.map((t) => (
                      <span
                        key={t}
                        className="px-3 py-1 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-extrabold text-xs rounded-lg border border-red-100 dark:border-red-900/30"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    Bisa Menerima Donor Dari:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedInfo.receiveFrom.map((t) => (
                      <span
                        key={t}
                        className="px-3 py-1 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-extrabold text-xs rounded-lg border border-blue-100 dark:border-blue-900/30"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Grid of compatibility */}
          <div className="lg:col-span-3">
            <div className="glass dark:bg-slate-900/60 p-8 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-extrabold text-base md:text-lg text-slate-800 dark:text-slate-200">
                  Pilih Golongan Darah Anda
                </h3>
                <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" />
                  Sentuh golongan darah
                </span>
              </div>

              {/* Selection list */}
              <div className="grid grid-cols-4 gap-3 md:gap-4 mb-8">
                {bloodTypes.map((type) => {
                  const isSelected = selectedType === type;
                  return (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`h-16 md:h-20 rounded-2xl font-black text-lg md:text-xl transition-all duration-300 flex items-center justify-center border hover:-translate-y-0.5 ${
                        isSelected
                          ? "bg-primary border-primary text-white shadow-[0_0_20px_rgba(225,29,72,0.35)]"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>

              {/* Grid Compatibility Display */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Visualisasi Kecocokan Kompatibilitas
                </h4>
                <div className="grid grid-cols-4 gap-3">
                  {bloodTypes.map((type) => {
                    const canGive = selectedInfo.giveTo.includes(type);
                    const canReceive = selectedInfo.receiveFrom.includes(type);
                    const isSelected = selectedType === type;

                    let bgStyle = "bg-slate-100/50 dark:bg-slate-800/40 border-transparent text-slate-400 dark:text-slate-600";
                    let prefix = "";

                    if (isSelected) {
                      bgStyle = "bg-primary border-primary text-white font-extrabold shadow-sm";
                    } else if (canGive && canReceive) {
                      bgStyle = "bg-gradient-to-br from-red-50 to-blue-50 dark:from-red-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-900/30 text-purple-700 dark:text-purple-400 font-extrabold";
                      prefix = "🔄 ";
                    } else if (canGive) {
                      bgStyle = "bg-red-50 dark:bg-red-950/20 border-red-200/50 dark:border-red-900/30 text-red-600 dark:text-red-400 font-extrabold";
                      prefix = "⬆️ ";
                    } else if (canReceive) {
                      bgStyle = "bg-blue-50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 font-extrabold";
                      prefix = "⬇️ ";
                    }

                    return (
                      <div
                        key={type}
                        className={`h-12 rounded-xl border text-[11px] font-bold flex flex-col items-center justify-center transition-all ${bgStyle}`}
                      >
                        <span>{prefix}{type}</span>
                        {(canGive || canReceive) && !isSelected && (
                          <span className="text-[8px] font-medium uppercase tracking-tighter mt-0.5">
                            {canGive && canReceive ? "Donor & Recv" : canGive ? "Penerima" : "Pendonor"}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-4 mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-wide justify-center">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-primary" />
                    <span>Dipilih</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-red-100 dark:bg-red-950/30 border border-red-200 dark:border-red-900/30" />
                    <span>Bisa Menerima Donor Anda</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-blue-100 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/30" />
                    <span>Bisa Mendonor ke Anda</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-purple-100 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/30" />
                    <span>Dua-duanya (Dua Arah)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
