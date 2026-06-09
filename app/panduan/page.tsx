"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Heart, 
  ArrowLeft, 
  ShieldCheck, 
  Activity, 
  BookOpen, 
  Info, 
  Calendar, 
  Scale, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Sparkles,
  HeartHandshake,
  TrendingUp,
  ListTodo
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BloodMatrix from "@/components/BloodMatrix";
import { useLanguage } from "@/components/LanguageProvider";

export default function GuidePage() {
  const router = useRouter();
  const { language } = useLanguage();

  // Page title dynamic update
  useEffect(() => {
    document.title = language === "en" ? "Donor Guide - BloodConnect" : "Panduan Donor - BloodConnect";
  }, [language]);

  // Eligibility Calculator State
  const [age, setAge] = useState<number>(25);
  const [weight, setWeight] = useState<number>(60);
  const [hasDonatedBefore, setHasDonatedBefore] = useState<boolean>(false);
  const [monthsSinceLast, setMonthsSinceLast] = useState<number>(3);
  const [isSick, setIsSick] = useState<boolean>(false);
  const [isFemaleCondition, setIsFemaleCondition] = useState<boolean>(false);
  const [hasChronicDisease, setHasChronicDisease] = useState<boolean>(false);

  // Check Eligibility
  const checkEligibility = () => {
    const reasons: string[] = [];
    
    if (age < 17) {
      reasons.push(language === "en" ? "Minimum age is 17 years old." : "Usia minimal adalah 17 tahun.");
    } else if (age > 65) {
      reasons.push(language === "en" ? "Maximum age is 65 years old (unless advised by doctor)." : "Usia maksimal adalah 65 tahun (kecuali atas pertimbangan dokter).");
    }
    
    if (weight < 45) {
      reasons.push(language === "en" ? "Minimum weight is 45 kg." : "Berat badan minimal adalah 45 kg.");
    }
    
    if (hasDonatedBefore && monthsSinceLast < 2) {
      reasons.push(language === "en" ? "Interval from previous donation must be at least 2 months (60 days)." : "Jeda waktu dari donor sebelumnya minimal 2 bulan (60 hari).");
    }
    
    if (isSick) {
      reasons.push(language === "en" ? "You must be in good health (free from flu, cough, fever, and antibiotics)." : "Anda harus dalam kondisi sehat (bebas dari flu, batuk, demam, dan konsumsi obat keras/antibiotik).");
    }
    
    if (isFemaleCondition) {
      reasons.push(language === "en" ? "Must not be pregnant, breastfeeding, or experiencing heavy menstruation." : "Tidak sedang hamil, menyusui, atau menstruasi berlebihan.");
    }
    
    if (hasChronicDisease) {
      reasons.push(language === "en" ? "Must be free from history of chronic diseases (heart, kidney, or hepatitis)." : "Bebas dari riwayat penyakit kronis berat (jantung, ginjal, atau hepatitis).");
    }
    
    return {
      eligible: reasons.length === 0,
      reasons
    };
  };

  const eligibilityResult = checkEligibility();

  // General Criteria Cards
  const criteriaData = [
    {
      icon: <Calendar className="w-5 h-5 text-emerald-500" />,
      titleId: "Usia",
      titleEn: "Age",
      valId: "17 s/d 60 Tahun",
      valEn: "17 to 60 Years",
      descId: "Batas usia aman untuk mendonorkan darah secara sukarela. Sampai 65 tahun diperkenankan jika mendapatkan rekomendasi khusus dokter.",
      descEn: "Safe age limit for voluntary blood donation. Up to 65 years old is allowed under specific doctor recommendation."
    },
    {
      icon: <Scale className="w-5 h-5 text-emerald-500" />,
      titleId: "Berat Badan",
      titleEn: "Weight",
      valId: "Minimal 45 kg",
      valEn: "Minimum 45 kg",
      descId: "Berat badan minimal untuk memastikan volume darah dalam tubuh cukup untuk mendonorkan sekitar 350ml - 450ml darah secara aman.",
      descEn: "Minimum weight requirement to ensure body blood volume is sufficient to safely donate around 350ml - 450ml of blood."
    },
    {
      icon: <Activity className="w-5 h-5 text-emerald-500" />,
      titleId: "Tekanan Darah",
      titleEn: "Blood Pressure",
      valId: "Normal",
      valEn: "Normal",
      descId: "Rentang tensi yang diizinkan adalah Sistole 90-160 mmHg, dan Diastole 60-100 mmHg agar tidak terjadi pusing pasca donor.",
      descEn: "Allowable blood pressure range: Systolic 90-160 mmHg, and Diastolic 60-100 mmHg to prevent post-donation dizziness."
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-emerald-500" />,
      titleId: "Kadar Hemoglobin",
      titleEn: "Hemoglobin Level",
      valId: "12,5 s/d 17,0 g/dL",
      valEn: "12.5 to 17.0 g/dL",
      descId: "Jumlah hemoglobin yang cukup dalam sel darah merah untuk menghindari risiko anemia (kurang darah) setelah proses pengambilan darah.",
      descEn: "Sufficient hemoglobin levels in red blood cells to avoid the risk of anemia (low blood count) after the donation process."
    },
    {
      icon: <Clock className="w-5 h-5 text-emerald-500" />,
      titleId: "Interval Donor",
      titleEn: "Donation Interval",
      valId: "Minimal 60 Hari",
      valEn: "Minimum 60 Days",
      descId: "Jeda waktu minimal antar donor darah lengkap (whole blood) untuk memberikan kesempatan tubuh meregenerasi sel darah merah baru.",
      descEn: "Minimum rest period between whole blood donations to give your body enough time to regenerate new red blood cells."
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
      titleId: "Kesehatan Umum",
      titleEn: "General Health",
      valId: "Prima & Bebas Obat",
      valEn: "Fit & Drug-Free",
      descId: "Tidak sedang sakit ringan (flu, batuk, demam), bebas dari penyakit menular lewat darah, dan tidak mengonsumsi obat keras/antibiotik.",
      descEn: "Not suffering from minor illnesses (flu, cough, fever), free from blood-transmissible diseases, and not taking antibiotics."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 w-full relative overflow-x-hidden text-slate-700 dark:text-slate-300">
      {/* Header / Navbar */}
      <Navbar />

      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[80px] left-[-20%] w-[600px] h-[600px] bg-emerald-500/5 dark:bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[400px] right-[-20%] w-[500px] h-[500px] bg-rose-500/5 dark:bg-rose-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Hero Header Section */}
      <section className="relative w-full max-w-7xl mx-auto px-6 pt-16 pb-12 z-10">
        <div className="flex flex-col items-center text-center">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-slate-400 hover:text-primary transition-all text-xs font-bold mb-6 hover:-translate-x-1 duration-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {language === "en" ? "Back to Home" : "Kembali ke Beranda"}
          </Link>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 text-sm font-bold mb-6 border border-emerald-500/20 backdrop-blur-sm">
            <BookOpen className="w-4 h-4" />
            <span>{language === "en" ? "Donor Education Hub" : "Pusat Edukasi Pendonor"}</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-tight max-w-3xl">
            {language === "en" ? "Blood Donor Guide" : "Panduan Lengkap Pendonor Darah"}
          </h1>
          <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            {language === "en" 
              ? "Everything you need to know about criteria, compatibility, and health preparations before becoming a life-saving hero."
              : "Semua informasi penting mengenai syarat kelayakan, kecocokan golongan darah, serta panduan medis sebelum mendonorkan darah Anda."}
          </p>
        </div>
      </section>

      {/* Main Sections Wrapper */}
      <main className="w-full max-w-7xl mx-auto px-6 pb-24 z-10 flex flex-col gap-16">
        
        {/* SECTION 1: ELIGIBILITY CALCULATOR & CRITERIA DETAILS */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Interactive Calculator (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-400 to-teal-600" />
            
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  {language === "en" ? "Eligibility Calculator" : "Kalkulator Kelayakan Donor"}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === "en" ? "Quick medical pre-screening checklist" : "Cek mandiri persyaratan umum Anda"}
                </p>
              </div>
            </div>

            {/* Slider Inputs */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">{language === "en" ? "Age" : "Usia"}</span>
                  <span className="text-sm font-black text-slate-800 dark:text-white">{age} {language === "en" ? "years" : "tahun"}</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="80" 
                  value={age} 
                  onChange={(e) => setAge(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">{language === "en" ? "Weight" : "Berat Badan"}</span>
                  <span className="text-sm font-black text-slate-800 dark:text-white">{weight} kg</span>
                </div>
                <input 
                  type="range" 
                  min="30" 
                  max="120" 
                  value={weight} 
                  onChange={(e) => setWeight(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
                />
              </div>

              {/* Has Donated Toggle */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    {language === "en" ? "Have you donated before?" : "Pernah donor sebelumnya?"}
                  </span>
                  <input 
                    type="checkbox" 
                    checked={hasDonatedBefore} 
                    onChange={(e) => setHasDonatedBefore(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="relative w-10 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500" />
                </label>
              </div>

              {/* Months since last donation slider */}
              {hasDonatedBefore && (
                <div className="animate-in slide-in-from-top-3 duration-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">
                      {language === "en" ? "Months Since Last Donation" : "Bulan Sejak Donor Terakhir"}
                    </span>
                    <span className="text-sm font-black text-slate-800 dark:text-white">
                      {monthsSinceLast} {language === "en" ? "months ago" : "bulan lalu"}
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="12" 
                    value={monthsSinceLast} 
                    onChange={(e) => setMonthsSinceLast(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Checkboxes for Medical Conditions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                <span className="text-xs font-bold text-slate-500 uppercase block">
                  {language === "en" ? "Health Conditions & Medical History" : "Kondisi Kesehatan & Riwayat Medis"}
                </span>

                <label className="flex items-start gap-3 cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-400">
                  <input 
                    type="checkbox" 
                    checked={isSick}
                    onChange={(e) => setIsSick(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 h-4.5 w-4.5 bg-slate-50 dark:bg-slate-800 dark:border-slate-700" 
                  />
                  <span>{language === "en" ? "Suffering from flu, cough, fever, or took antibiotics recently" : "Sedang flu, batuk, demam, atau minum obat keras/antibiotik baru-baru ini"}</span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-400">
                  <input 
                    type="checkbox" 
                    checked={isFemaleCondition}
                    onChange={(e) => setIsFemaleCondition(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 h-4.5 w-4.5 bg-slate-50 dark:bg-slate-800 dark:border-slate-700" 
                  />
                  <span>{language === "en" ? "Currently pregnant, breastfeeding, or heavy menstruation (female)" : "Sedang hamil, menyusui, atau mengalami menstruasi berlebih (khusus wanita)"}</span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-400">
                  <input 
                    type="checkbox" 
                    checked={hasChronicDisease}
                    onChange={(e) => setHasChronicDisease(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 h-4.5 w-4.5 bg-slate-50 dark:bg-slate-800 dark:border-slate-700" 
                  />
                  <span>{language === "en" ? "History of chronic conditions (heart disease, kidney failure, hepatitis)" : "Memiliki riwayat penyakit berat (jantung, ginjal, hepatitis, dll)"}</span>
                </label>
              </div>
            </div>

            {/* RESULTS DISPLAYER */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80">
              {eligibilityResult.eligible ? (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-800 flex flex-col gap-3 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span className="font-extrabold text-sm">
                      {language === "en" ? "You Are Eligible!" : "Anda Layak Mendonor!"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {language === "en"
                      ? "Based on your selections, you meet the general requirements to donate blood. You can start helping patients now."
                      : "Berdasarkan pengisian mandiri, Anda memenuhi kriteria umum untuk berdonor. Kontribusi Anda sangat dinantikan."}
                  </p>
                  <button
                    onClick={() => router.push("/radar/donor")}
                    className="mt-1 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/15 hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-1.5"
                  >
                    <HeartHandshake className="w-4.5 h-4.5 animate-pulse" />
                    <span>{language === "en" ? "Find Nearby Signals Now" : "Cari Sinyal Donor Sekarang"}</span>
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/5 border border-amber-200/60 dark:border-amber-800/40 flex flex-col gap-3.5 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
                    <XCircle className="w-5 h-5 shrink-0" />
                    <span className="font-extrabold text-sm">
                      {language === "en" ? "Criteria Not Met Yet" : "Belum Memenuhi Kriteria"}
                    </span>
                  </div>
                  
                  <div className="space-y-1.5">
                    {eligibilityResult.reasons.map((reason, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-400 leading-normal">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-[10px] text-slate-400 leading-relaxed italic border-t border-amber-200/30 pt-2">
                    {language === "en"
                      ? "*This calculator is for preliminary guidance. Final eligibility will be verified by PMI doctors at the hospital."
                      : "*Kalkulator ini bersifat skrining awal. Kelayakan medis akhir akan diverifikasi oleh petugas PMI / dokter di tempat donor."}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Criteria Grid Detail (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">{language === "en" ? "Requirements" : "Persyaratan"}</span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {language === "en" ? "Standard Donor Criteria" : "Kriteria Detail Pendonor Medis"}
              </h3>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {criteriaData.map((crit, idx) => (
                <div 
                  key={idx} 
                  className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl p-5 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 group-hover:scale-110 transition-transform">
                      {crit.icon}
                    </div>
                    <span className="text-xs font-extrabold px-2.5 py-1 bg-slate-50 dark:bg-slate-950 text-emerald-600 rounded-lg border border-slate-100 dark:border-slate-800 font-mono">
                      {language === "en" ? crit.valEn : crit.valId}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mb-2">
                    {language === "en" ? crit.titleEn : crit.titleId}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {language === "en" ? crit.descEn : crit.descId}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 2: INTERACTIVE BLOOD COMPATIBILITY GRID */}
        <div>
          {/* We reuse the custom BloodMatrix which has beautiful interactive grids */}
          <BloodMatrix />
        </div>

        {/* SECTION 3: HEALTH BENEFITS & PRE-DONATION PREPARATION */}
        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          
          {/* Benefits Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-md relative overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-400 to-rose-600" />
            
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500 group-hover:scale-105 transition-transform">
                  <Activity className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                    {language === "en" ? "Outstanding Health Benefits" : "Manfaat Donor Bagi Kesehatan"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === "en" ? "Why donating is great for you" : "Donor darah membuat tubuh Anda lebih sehat"}
                  </p>
                </div>
              </div>

              <ul className="space-y-4">
                {[
                  {
                    titleId: "Menjaga Kesehatan Jantung",
                    titleEn: "Maintain Heart Health",
                    descId: "Menurunkan kekentalan darah dan membuang kelebihan zat besi yang berlebih, yang dapat mengurangi risiko sumbatan pembuluh darah jantung (kolesterol/stroke).",
                    descEn: "Reduces blood viscosity and sheds excess iron levels, which can minimize the risk of cardiovascular blockages."
                  },
                  {
                    titleId: "Memicu Regenerasi Sel Darah Baru",
                    titleEn: "Stimulate Blood Cell Production",
                    descId: "Sumsum tulang belakang akan dirangsang untuk memproduksi sel darah merah baru yang segar guna menggantikan darah yang didonorkan.",
                    descEn: "Bone marrow will be stimulated to produce fresh new red blood cells to replace the donated blood."
                  },
                  {
                    titleId: "Deteksi Kesehatan Dini Gratis",
                    titleEn: "Free Mini Health Check",
                    descId: "Sebelum mendonor, tensi, denyut nadi, hemoglobin, dan penyakit menular utama (HIV, Hepatitis B/C, Sifilis) akan diperiksa secara gratis.",
                    descEn: "Before donating, your blood pressure, pulse, hemoglobin, and major infectious diseases are checked for free."
                  },
                  {
                    titleId: "Kesehatan Mental (Warm Glow)",
                    titleEn: "Mental Well-being Benefits",
                    descId: "Secara psikologis membantu menyelamatkan hingga 3 nyawa memberikan kepuasan batin yang mendalam dan memicu hormon kebahagiaan.",
                    descEn: "Psychologically, knowing you helped save up to 3 lives provides deep fulfillment and releases happiness hormones."
                  }
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-3 items-start">
                    <div className="p-1 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-500 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    </div>
                    <div>
                      <span className="font-extrabold text-xs text-slate-800 dark:text-white block">
                        {language === "en" ? item.titleEn : item.titleId}
                      </span>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal mt-0.5">
                        {language === "en" ? item.descEn : item.descId}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mt-8 p-4 bg-rose-50/50 dark:bg-slate-950 border border-rose-100/30 dark:border-slate-800 rounded-2xl text-[11px] text-slate-500 leading-relaxed italic">
              {language === "en"
                ? '"Donating blood regularly can reduce the risk of cardiovascular attacks by up to 88% based on epidemiological research."'
                : '"Mendonorkan darah secara rutin dapat membantu menurunkan risiko serangan kardiovaskular hingga 88% berdasarkan riset epidemiologi."'}
            </div>
          </div>

          {/* Preparation Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-md relative overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-400 to-indigo-600" />
            
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 group-hover:scale-105 transition-transform">
                  <ListTodo className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                    {language === "en" ? "Pre-Donation Checklist" : "Checklist Persiapan Donor"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === "en" ? "What to do before visiting the center" : "Hal penting yang perlu dipersiapkan"}
                  </p>
                </div>
              </div>

              <ul className="space-y-4">
                {[
                  {
                    titleId: "Tidur Cukup (6-8 Jam)",
                    titleEn: "Adequate Sleep (6-8 Hours)",
                    descId: "Istirahat cukup di malam sebelum donor. Kurang tidur dapat menyebabkan tekanan darah tidak stabil atau badan lemas setelah berdonor.",
                    descEn: "Rest well the night before. Lack of sleep can cause blood pressure fluctuations or post-donation fatigue."
                  },
                  {
                    titleId: "Hidrasi Tubuh Ekstra",
                    titleEn: "Extra Hydration",
                    descId: "Minum minimal 500ml - 1 liter air putih ekstra sebelum mendonor agar volume cairan tubuh terjaga dengan baik selama donor.",
                    descEn: "Drink at least 500ml - 1 liter of extra water beforehand to keep your body's fluid volume well maintained."
                  },
                  {
                    titleId: "Makan Makanan Ringan",
                    titleEn: "Eat a Light Meal",
                    descId: "Makanlah makanan bergizi ringan sekitar 2 - 4 jam sebelum donor. Hindari mendonor dengan perut kosong / kelaparan.",
                    descEn: "Have a light nutritious meal around 2-4 hours prior. Avoid donating on an empty stomach or while fasting."
                  },
                  {
                    titleId: "Hindari Alkohol & Obat-obatan",
                    titleEn: "Avoid Alcohol & Drugs",
                    descId: "Jangan mengonsumsi alkohol dalam 24 jam terakhir, dan hindari minum obat sakit kepala (aspirin/ibuprofen) dalam 3 hari terakhir.",
                    descEn: "Do not consume alcohol in the 24 hours prior, and avoid headache medication (aspirin/ibuprofen) 3 days before."
                  }
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-3 items-start">
                    <div className="p-1 rounded-full bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    </div>
                    <div>
                      <span className="font-extrabold text-xs text-slate-800 dark:text-white block">
                        {language === "en" ? item.titleEn : item.titleId}
                      </span>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal mt-0.5">
                        {language === "en" ? item.descEn : item.descId}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mt-8 p-4 bg-indigo-50/50 dark:bg-slate-950 border border-indigo-100/30 dark:border-slate-800 rounded-2xl text-[11px] text-slate-500 leading-relaxed italic">
              {language === "en"
                ? '"Donating only takes 10-15 minutes of your time, but it will give someone else a lifetime of opportunities."'
                : '"Mendonorkan darah hanya membutuhkan 10-15 menit waktu Anda, tetapi itu akan memberikan kesempatan hidup seumur hidup bagi orang lain."'}
            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
