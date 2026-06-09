"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const faqData: FaqItem[] = [
  {
    question: "Apakah saya memenuhi syarat untuk mendonorkan darah?",
    answer: "Syarat dasar meliputi usia 17-60 tahun, berat badan minimal 45 kg, sehat jasmani dan rohani, tekanan darah normal (sistole 90-160, diastole 60-100 mmHg), serta kadar hemoglobin (Hb) yang cukup (12.5 - 17.0 g/dL). Anda juga tidak boleh sedang mengonsumsi obat antibiotik dalam 1 minggu terakhir, memiliki riwayat penyakit tertentu, atau sedang hamil/menyusui.",
  },
  {
    question: "Berapa lama jeda waktu yang aman antar donor darah?",
    answer: "Jeda waktu ideal antar donor darah lengkap (whole blood) adalah minimal 8-12 minggu (sekitar 2 hingga 3 bulan). Hal ini untuk memastikan tubuh Anda memiliki cukup waktu guna memproduksi kembali sel darah merah baru dan mengembalikan kadar zat besi dalam darah ke tingkat yang normal.",
  },
  {
    question: "Bagaimana BloodConnect melindungi privasi kontak saya?",
    answer: "Keamanan Anda adalah prioritas kami. Kami menggunakan sistem RLS (Row Level Security) database dan mekanisme persetujuan anonim. Kontak WhatsApp atau nomor telepon Anda tidak akan pernah dipublikasikan di peta atau dasbor publik. Nomor tersebut hanya akan dienkripsi dan dikirimkan secara pribadi ke pemohon setelah Anda mengklik tombol 'Terima Permintaan' secara sadar dan sukarela.",
  },
  {
    question: "Apakah ada biaya dalam menggunakan layanan BloodConnect?",
    answer: "Tidak sama sekali. BloodConnect adalah proyek nirlaba berbasis kemanusiaan. Penggunaan website, pendaftaran pendonor, pemancaran sinyal darurat, dan koordinasi geospasial disediakan secara gratis 100% demi mempercepat penanganan situasi kritis donor darah di Indonesia.",
  },
  {
    question: "Apa bedanya BloodConnect dengan sistem stok darah PMI?",
    answer: "PMI berfokus pada penyimpanan dan pengelolaan stok darah siap pakai secara tersentralisasi. BloodConnect berfokus pada koordinasi darurat antar-personal (P2P) secara langsung dan cepat saat stok darah tertentu di rumah sakit habis atau saat keluarga pasien harus mencari donor pengganti segera di sekitar area terdekat.",
  },
];

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="w-full py-24 bg-slate-50/50 dark:bg-slate-950/20 border-t border-slate-200 dark:border-slate-800/80 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3.5 py-1.5 rounded-full">
            Tanya Jawab
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-6">
            Pertanyaan Umum
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-4 text-base md:text-lg">
            Ada pertanyaan seputar donor darah dan penggunaan platform? Kami merangkum hal-hal paling penting yang perlu Anda ketahui di sini.
          </p>
        </div>

        <div className="space-y-4">
          {faqData.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="glass dark:bg-slate-900/60 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm transition-all duration-300 overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 md:px-8 py-5 flex items-center justify-between gap-4 text-left group"
                >
                  <div className="flex items-center gap-3.5">
                    <HelpCircle className="w-5 h-5 text-primary shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="font-extrabold text-sm md:text-base text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors">
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>

                {/* Animated expand container */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 md:px-8 pb-6 text-sm text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-4">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
