"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Heart, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/radar/donor";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Simple Validations
    if (!email) {
      setError("Email tidak boleh kosong.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Format email tidak valid.");
      return;
    }
    if (!password) {
      setError("Kata sandi tidak boleh kosong.");
      return;
    }
    if (password.length < 6) {
      setError("Kata sandi minimal 6 karakter.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      if (!supabase) {
        throw new Error("Supabase client tidak terinisialisasi. Periksa konfigurasi.");
      }

      // 1. Fetch profile from Supabase Profiles Table directly (Custom Auth)
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Error fetching profile from Supabase:", profileError);
        throw new Error("Gagal terhubung ke database. Silakan coba lagi.");
      }

      if (!profile) {
        throw new Error("Akun tidak ditemukan. Silakan periksa kembali email Anda.");
      }

      // 2. Verify Password
      // Note: In production, use bcrypt or similar to compare hashed passwords!
      if (profile.password !== password) {
        throw new Error("Email atau kata sandi salah. Silakan periksa kembali.");
      }

      const userId = profile.id;
      let fullName = profile.full_name || "Pengguna BloodConnect";
      let bloodType = (profile.blood_type || "O") as "A" | "B" | "AB" | "O" | "";
      let rhesus = (profile.rhesus || "+") as "+" | "-" | "";
      let lastDonation = profile.last_donation || "";
      let isAvailable = profile.is_available !== false;

      // 3. Save user session in Local Storage
      const activeSession = {
        id: userId,
        email,
        fullName,
        bloodType,
        rhesus,
        lastDonation,
        isAvailable,
        isLoggedIn: true,
      };
      localStorage.setItem("user_session", JSON.stringify(activeSession));

      // Sync registered_users in local storage as a fallback/compatibility measure
      const storedUsers = localStorage.getItem("registered_users");
      let usersList = [];
      if (storedUsers) {
        try {
          usersList = JSON.parse(storedUsers);
        } catch (e) {
          console.error(e);
        }
      }
      const userIndex = usersList.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (userIndex === -1) {
        usersList.push(activeSession);
      } else {
        usersList[userIndex] = activeSession;
      }
      localStorage.setItem("registered_users", JSON.stringify(usersList));

      // 4. Redirect to target path
      router.push(redirectPath);
      router.refresh();
    } catch (err: any) {
      console.error("Login error:", err);
      let msg = err.message || "Terjadi kesalahan saat masuk.";
      if (msg.includes("Invalid login credentials") || msg.includes("Invalid credentials")) {
        msg = "Email atau kata sandi salah. Silakan periksa kembali.";
      } else if (msg.includes("Email not confirmed")) {
        msg = "Email Anda belum diverifikasi. Silakan periksa email Anda.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md z-10">
      {/* Brand Logo */}
      <div className="flex flex-col items-center mb-8">
        <Link href="/" className="flex items-center gap-2 mb-2">
          <div className="relative">
            <Heart className="text-primary w-8 h-8 fill-primary" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">BloodConnect</span>
        </Link>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Masuk untuk mengakses dasbor donor Anda</p>
      </div>

      {/* Login Card */}
      <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md rounded-3xl p-8 shadow-xl">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl text-red-600 dark:text-red-400 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Kata Sandi</label>
              <a href="#" className="text-xs text-primary hover:underline font-bold">Lupa Kata Sandi?</a>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold hover:bg-primary/90 transition-all hover:shadow-[0_0_30px_rgba(225,29,72,0.2)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-8 text-sm"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Masuk ke Dasbor
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer inside Card */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-sm text-slate-500 dark:text-slate-400">
          Belum terdaftar?{" "}
          <Link href={`/register${redirectPath ? `?redirect=${redirectPath}` : ""}`} className="text-primary hover:underline font-bold">
            Daftar Sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 dark:bg-slate-950 px-6 py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <Suspense fallback={<div className="text-slate-500">Memuat...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
