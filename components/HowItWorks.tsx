"use client";

import { Send, Bell, ShieldCheck, HeartHandshake } from "lucide-react";

interface Step {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  colorClass: string;
  numberColorClass: string;
}

const steps: Step[] = [
  {
    number: "01",
    title: "Pancarkan Sinyal Darurat",
    description: "Pemohon (Seeker) membuat permintaan darurat di sistem, memasukkan golongan darah, rumah sakit, dan jumlah kantong.",
    icon: <Send className="w-6 h-6" />,
    colorClass: "from-red-500 to-rose-500 text-red-500 bg-red-50 dark:bg-red-950/30",
    numberColorClass: "text-red-500/20 dark:text-red-500/10"
  },
  {
    number: "02",
    title: "Notifikasi Instan & Deteksi Jarak",
    description: "Sistem mendeteksi pendonor siaga terdekat yang memiliki golongan darah yang cocok dalam radius terpilih dan mengirim notifikasi.",
    icon: <Bell className="w-6 h-6" />,
    colorClass: "from-blue-500 to-indigo-500 text-blue-500 bg-blue-50 dark:bg-blue-950/30",
    numberColorClass: "text-blue-500/20 dark:text-blue-500/10"
  },
  {
    number: "03",
    title: "Anonymous Handshake",
    description: "Pendonor menerima permintaan. Untuk menjaga privasi, nomor kontak (WhatsApp) baru akan terbuka setelah pendonor menekan tombol setuju.",
    icon: <ShieldCheck className="w-6 h-6" />,
    colorClass: "from-emerald-500 to-teal-500 text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
    numberColorClass: "text-emerald-500/20 dark:text-emerald-500/10"
  },
  {
    number: "04",
    title: "Penyelamatan Sukses",
    description: "Pendonor melakukan donor di rumah sakit tujuan. Setelah selesai, status permintaan berubah menjadi terpenuhi dan nyawa terselamatkan.",
    icon: <HeartHandshake className="w-6 h-6" />,
    colorClass: "from-pink-500 to-rose-500 text-pink-500 bg-pink-50 dark:bg-pink-950/30",
    numberColorClass: "text-pink-500/20 dark:text-pink-500/10"
  },
];

export default function HowItWorks() {
  return (
    <section className="w-full py-24 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800/80 relative overflow-hidden">
      {/* Visual background lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 dark:opacity-10" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3.5 py-1.5 rounded-full">
            Alur Sistem
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-6">
            Bagaimana <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-rose-500">BloodConnect</span> Bekerja
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-4 text-base md:text-lg">
            Kami memangkas rantai pencarian donor tradisional yang lambat dengan sistem otomatisasi berbasis geolokasi real-time.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connector line for large screens */}
          <div className="hidden lg:block absolute top-[48px] left-[12%] right-[12%] h-0.5 bg-slate-100 dark:bg-slate-800/50 z-0" />

          {steps.map((step, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center text-center group">
              {/* Icon & Number container */}
              <div className="relative flex items-center justify-center w-24 h-24 mb-2">
                {/* Number watermark (large, themed, absolute behind/beside the icon) */}
                <span className={`absolute left-1/2 top-1/2 -translate-y-1/2 translate-x-[15%] text-7xl font-black select-none z-0 transition-all duration-350 group-hover:scale-110 group-hover:translate-x-[20%] group-hover:-translate-y-[55%] ${step.numberColorClass}`}>
                  {step.number}
                </span>

                {/* Icon container */}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-slate-800 transition-all duration-300 group-hover:scale-110 shadow-md ${step.colorClass.split(" ")[2]} ${step.colorClass.split(" ")[3]} z-10 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2`}>
                  <div className={`bg-gradient-to-br ${step.colorClass.split(" ")[0]} ${step.colorClass.split(" ")[1]} bg-clip-text text-transparent`}>
                    {step.icon}
                  </div>
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-4 mb-3 group-hover:text-primary transition-colors">
                {step.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
