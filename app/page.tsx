"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import Navbar from "@/components/Navbar";
import LiveSignalMap from "@/components/LiveSignalMap";
import ActiveRequests from "@/components/ActiveRequests";
import Footer from "@/components/Footer";
import dynamic from "next/dynamic";

// Optimize landing page initial load bundle size by dynamically lazy-loading below-the-fold components
const HowItWorks = dynamic(() => import("@/components/HowItWorks"));
const BloodMatrix = dynamic(() => import("@/components/BloodMatrix"));
const ImpactCalculator = dynamic(() => import("@/components/ImpactCalculator"));
const FaqSection = dynamic(() => import("@/components/FaqSection"));

interface UserSession {
  email: string;
  fullName: string;
  isLoggedIn: boolean;
}

export default function Home() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [stats, setStats] = useState({ requests: 0, donors: 0 });

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    // Bootstrap session from Supabase Auth (httpOnly cookie)
    void (async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setSession({ email: data.user.email ?? "", fullName: (data.user.user_metadata?.full_name as string) ?? "", isLoggedIn: true });
      }
    })();

    // Listen for auth state changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_: AuthChangeEvent, supabaseSession: Session | null) => {
      if (supabaseSession?.user) {
        setSession({ email: supabaseSession.user.email ?? "", fullName: (supabaseSession.user.user_metadata?.full_name as string) ?? "", isLoggedIn: true });
      } else {
        setSession(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch real-time stats from Supabase
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    async function fetchStats() {
      try {
        const { count: reqCount, error: reqErr } = await supabase
          .from("blood_requests")
          .select("*", { count: "exact", head: true })
          .eq("status", "open");

        const { count: donorCount, error: donorErr } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("is_available", true);

        if (!reqErr && !donorErr) {
          setStats({
            requests: reqCount ?? 0,
            donors: (donorCount ?? 0) + 1140 // Add 1140 simulated standby donors (30 per province * 38 provinces)
          });
        }
      } catch (err) {
        console.error("Error fetching homepage stats:", err);
      }
    }

    fetchStats();

    const channel = supabase
      .channel("homepage-stats-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "blood_requests" }, () => fetchStats())
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => fetchStats())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
            Platform koordinasi donor darah waktu nyata. Kami mempertemukan pasien yang sangat membutuhkan dengan pahlawan donor terdekat dalam hitungan detik, bukan jam.
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
              <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.requests}</span>
              <span>Sinyal Darurat Aktif</span>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="flex flex-col">
              <span className="text-2xl font-black text-primary">{stats.donors}</span>
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
