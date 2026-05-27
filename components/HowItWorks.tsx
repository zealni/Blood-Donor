"use client";

import { Send, Bell, ShieldCheck, HeartHandshake } from "lucide-react";

interface Step {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  accentBorder: string;
}

const steps: Step[] = [
  {
    title: "Pancarkan Sinyal Darurat",
    description: "Pemohon (Seeker) membuat permintaan darurat di sistem, memasukkan golongan darah, rumah sakit, dan jumlah kantong.",
    icon: <Send className="w-7 h-7" />,
    iconBg: "bg-red-50 dark:bg-red-950/30",
    iconColor: "text-red-500",
    accentBorder: "group-hover:border-red-200 dark:group-hover:border-red-800/60",
  },
  {
    title: "Notifikasi Instan & Deteksi Jarak",
    description: "Sistem mendeteksi pendonor siaga terdekat yang memiliki golongan darah yang cocok dalam radius terpilih dan mengirim notifikasi.",
    icon: <Bell className="w-7 h-7" />,
    iconBg: "bg-blue-50 dark:bg-blue-950/30",
    iconColor: "text-blue-500",
    accentBorder: "group-hover:border-blue-200 dark:group-hover:border-blue-800/60",
  },
  {
    title: "Anonymous Handshake",
    description: "Pendonor menerima permintaan. Untuk menjaga privasi, nomor kontak (WhatsApp) baru akan terbuka setelah pendonor menekan tombol setuju.",
    icon: <ShieldCheck className="w-7 h-7" />,
    iconBg: "bg-emerald-50 dark:bg-emerald-950/30",
    iconColor: "text-emerald-500",
    accentBorder: "group-hover:border-emerald-200 dark:group-hover:border-emerald-800/60",
  },
  {
    title: "Penyelamatan Sukses",
    description: "Pendonor melakukan donor di rumah sakit tujuan. Setelah selesai, status permintaan berubah menjadi terpenuhi dan nyawa terselamatkan.",
    icon: <HeartHandshake className="w-7 h-7" />,
    iconBg: "bg-pink-50 dark:bg-pink-950/30",
    iconColor: "text-pink-500",
    accentBorder: "group-hover:border-pink-200 dark:group-hover:border-pink-800/60",
  },
];

export default function HowItWorks() {
  return (
    <section className="w-full pt-24 pb-12 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800/80 relative overflow-hidden">
      {/* Visual background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 dark:opacity-10" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
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

        {/* Step Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Horizontal connector line */}
          <div className="hidden lg:block absolute top-[32px] left-[12%] right-[12%] h-0.5 bg-slate-100 dark:bg-slate-800/50 z-0" />

          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`relative z-10 flex flex-col items-center text-center group px-4 py-6 rounded-3xl border border-transparent transition-all duration-300 hover:shadow-xl hover:bg-white dark:hover:bg-slate-800/60 hover:-translate-y-2 ${step.accentBorder}`}
            >
              {/* Icon box */}
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${step.iconBg} ${step.iconColor}`}>
                {step.icon}
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-5 mb-2 group-hover:text-primary transition-colors leading-snug">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
