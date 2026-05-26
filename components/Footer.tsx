"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Send, Github, Twitter, Instagram, PhoneCall, Mail, MapPin } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const storedSession = localStorage.getItem("user_session");
    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession);
        if (parsed.isLoggedIn) {
          setIsLoggedIn(true);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Remove hash from URL to avoid ghost scroll on next visit
    history.replaceState(null, "", window.location.pathname);
  };

  const handleScrollToFaq = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById("faq");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="w-full bg-slate-900 text-slate-400 border-t border-slate-800 relative z-10 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-12 gap-12 pb-16 border-b border-slate-800">

        {/* Brand Information */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleScrollToTop}>
            <div className="relative">
              <Heart className="text-primary w-8 h-8 fill-primary" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white">BloodConnect</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
            Platform koordinasi donor darah darurat berbasis geolokasi *real-time*. Mempertemukan pahlawan donor dengan pasien kritis secara instan dan aman.
          </p>
          <div className="flex gap-4">
            <a href="#" className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-primary hover:text-white transition-all">
              <Github className="w-4 h-4" />
            </a>
            <a href="#" className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-primary hover:text-white transition-all">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-primary hover:text-white transition-all">
              <Instagram className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Navigation Section 1 */}
        <div className="lg:col-span-2 space-y-4">
          <h4 className="font-bold text-sm uppercase tracking-wider text-slate-200">
            Layanan
          </h4>
          <ul className="space-y-2.5 text-sm font-semibold">
            <li>
              <Link href={isLoggedIn ? "/radar/seeker" : "/login?redirect=/radar/seeker"} className="hover:text-primary transition-colors">
                Butuh Donor Darah
              </Link>
            </li>
            <li>
              <Link href={isLoggedIn ? "/radar/donor" : "/login?redirect=/radar/donor"} className="hover:text-primary transition-colors">
                Gabung Jadi Donor
              </Link>
            </li>
            <li>
              <Link href="/#blood-matrix" className="hover:text-primary transition-colors">
                Stok Darah PMI (Mock)
              </Link>
            </li>
            <li>
              <Link href={isLoggedIn ? "/profile" : "/register"} className="hover:text-primary transition-colors">
                {isLoggedIn ? "Profil Saya" : "Registrasi Anggota"}
              </Link>
            </li>
          </ul>
        </div>

        {/* Navigation Section 2 */}
        <div className="lg:col-span-2 space-y-4">
          <h4 className="font-bold text-sm uppercase tracking-wider text-slate-200">
            Kontak Darurat
          </h4>
          <ul className="space-y-3.5 text-sm font-medium">
            <li className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-primary shrink-0" />
              <span>Ambulans: 118</span>
            </li>
            <li className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-primary shrink-0" />
              <span>PMI Pusat: (021) 7992325</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="text-xs break-all">mortala.production@gmail.com</span>
            </li>
          </ul>
        </div>

        {/* Newsletter subscription */}
        <div className="lg:col-span-4 space-y-4">
          <h4 className="font-bold text-sm uppercase tracking-wider text-slate-200">
            Kabar Kemanusiaan
          </h4>
          <p className="text-sm text-slate-400 leading-relaxed">
            Dapatkan informasi edukasi donor darah, tips kesehatan, dan kisah sukses penyelamatan nyawa langsung ke email Anda.
          </p>
          <form onSubmit={handleSubscribe} className="relative flex items-center">
            <input
              type="email"
              placeholder="Alamat email Anda"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-primary text-sm pr-12 font-medium"
              required
            />
            <button
              type="submit"
              className="absolute right-1.5 p-2 bg-primary hover:bg-rose-600 transition-colors rounded-lg text-white"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          {subscribed && (
            <p className="text-xs font-bold text-emerald-400 animate-pulse mt-2">
              Terima kasih! Anda berhasil berlangganan kabar kemanusiaan kami.
            </p>
          )}
        </div>
      </div>

      {/* Copyright Credits */}
      <div className="max-w-7xl mx-auto px-6 pt-10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-500">
        <p>&copy; {new Date().getFullYear()} Mortala Production. Hak Cipta Dilindungi Undang-Undang.</p>
        <div className="flex gap-6">
          <button onClick={handleScrollToFaq} className="hover:text-slate-300">Syarat &amp; Ketentuan</button>
          <button onClick={handleScrollToFaq} className="hover:text-slate-300">Kebijakan Privasi</button>
          <button onClick={handleScrollToTop} className="hover:text-primary font-bold">
            Kembali ke Atas ↑
          </button>
        </div>
      </div>
    </footer>
  );
}
