"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import LiveSignalMap from "@/components/LiveSignalMap";
import ActiveRequests from "@/components/ActiveRequests";
import HowItWorks from "@/components/HowItWorks";
import BloodMatrix from "@/components/BloodMatrix";
import ImpactCalculator from "@/components/ImpactCalculator";
import FaqSection from "@/components/FaqSection";
import Footer from "@/components/Footer";

interface UserSession {
  email: string;
  fullName: string;
  isLoggedIn: boolean;
}

export default function Home() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);

  useEffect(() => {
    const storedSession = localStorage.getItem("user_session");
    if (storedSession) {
      try {
        setSession(JSON.parse(storedSession));
      } catch (e) {
        console.error("Failed to parse user session", e);
      }
    }
  }, []);

  const handleCTA = (targetPath: string) => {
    if (session?.isLoggedIn) {
      router.push(targetPath);
    } else {
      router.push(`/login?redirect=${targetPath}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-slate-50 dark:bg-slate-950 relative overflow-hidden w-full">
      {/* Reusable Premium Navbar */}
      <Navbar />

      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />


      {/* Hero Section with Map */}
      <main className="w-full max-w-7xl mx-auto px-6 pt-12 pb-24 grid lg:grid-cols-2 gap-16 items-center z-10 flex-grow">
        
        {/* Left Column: Copywriting & CTA */}
        <div className="flex flex-col items-start text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-8 border border-primary/20 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>Sistem Donor Darurat Aktif</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1] text-slate-900 dark:text-white">
            Waktu Adalah <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-rose-400">
              Nyawa.
            </span>
          </h1>
          
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-xl leading-relaxed">
            Platform koordinasi donor darah *real-time*. Kami mempertemukan pasien yang sangat membutuhkan dengan pahlawan donor terdekat dalam hitungan detik, bukan jam.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <button 
              onClick={() => handleCTA("/radar/seeker")} 
              className="group flex-1 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all hover:shadow-[0_0_30px_rgba(225,29,72,0.3)] hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              Butuh Darah
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => handleCTA("/radar/donor")} 
              className="flex-1 px-8 py-4 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white rounded-2xl font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all hover:-translate-y-1 flex items-center justify-center gap-2 shadow-sm backdrop-blur-sm"
            >
              Jadi Pendonor
            </button>
          </div>

          {/* Stats / Trust Indicators */}
          <div className="mt-12 flex items-center gap-8 text-sm font-medium text-slate-500">
            <div className="flex flex-col">
              <span className="text-2xl font-black text-slate-900 dark:text-white">124</span>
              <span>Sinyal Darurat Aktif</span>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="flex flex-col">
              <span className="text-2xl font-black text-primary">859</span>
              <span>Pendonor Siaga</span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Signal Map */}
        <div className="relative w-full">
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-[2.5rem] blur-2xl opacity-50" />
          <LiveSignalMap />
        </div>
      </main>

      {/* Sinyal Darurat Aktif Terkini */}
      <ActiveRequests onCTA={handleCTA} />

      {/* Cara Kerja BloodConnect */}
      <HowItWorks />

      {/* Matriks Kecocokan Golongan Darah */}
      <BloodMatrix />

      {/* Kalkulator Dampak Donor */}
      <ImpactCalculator />

      {/* FAQ Section */}
      <FaqSection />

      {/* Footer Lengkap */}
      <Footer />
    </div>
  );
}
