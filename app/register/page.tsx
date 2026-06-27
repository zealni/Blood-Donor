"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Heart, User, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import CalendarPicker from "@/components/CalendarPicker";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Security: validate redirect to prevent open redirect attacks
  const rawRedirect = searchParams.get("redirect") || "/radar/donor";
  const redirectPath = rawRedirect.startsWith("/") ? rawRedirect : "/radar/donor";

  // Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bloodType, setBloodType] = useState<"A" | "B" | "AB" | "O" | "">("");
  const [rhesus, setRhesus] = useState<"+" | "-" | "">("");
  const [lastDonation, setLastDonation] = useState("");

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const language = "id";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validations
    if (!fullName.trim()) {
      setError("Nama Lengkap tidak boleh kosong.");
      return;
    }
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
    if (!bloodType) {
      setError("Silakan pilih golongan darah.");
      return;
    }
    if (!rhesus) {
      setError("Silakan pilih rhesus.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      if (!supabase) {
        throw new Error("Layanan autentikasi tidak tersedia. Periksa konfigurasi.");
      }

      // 1. Register via Supabase Auth (password is hashed automatically)
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Pass extra profile data to be used by the DB trigger (handle_new_user)
          data: {
            full_name: fullName,
          },
          // After email confirmation, redirect to radar/donor
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${redirectPath}`,
        },
      });

      if (signUpError) {
        console.error("Supabase signUp error:", signUpError.message);
        if (signUpError.message.includes("already registered") || signUpError.message.includes("User already exists")) {
          throw new Error("Email sudah terdaftar. Silakan gunakan email lain atau masuk.");
        }
        throw new Error("Gagal mendaftar. Silakan coba lagi.");
      }

      if (!authData.user) {
        throw new Error("Gagal membuat akun. Silakan coba lagi.");
      }

      // 2. Upsert profile details (blood type, rhesus, etc.)
      // The trigger already created a basic profile row; we update it with medical info.
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert([
          {
            id: authData.user.id,
            email: email,
            full_name: fullName,
            blood_type: bloodType,
            rhesus: rhesus,
            last_donation: lastDonation || null,
            is_available: true,
            location: "POINT(110.380 -7.775)", // Default center Yogyakarta
          },
        ]);

      if (profileError) {
        // Log detailed error server-side only
        console.error("Profile upsert error:", profileError.message);
        throw new Error("Gagal menyimpan profil. Silakan coba lagi.");
      }

      // 3. Session is now handled by Supabase Auth (httpOnly cookies)
      // No localStorage writes needed.

      router.push(redirectPath);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat mendaftar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg z-10">
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
        <p className="text-slate-500 dark:text-slate-400 text-sm">Daftar sekali untuk menjadi pendonor sekaligus pemohon donor</p>
      </div>

      {/* Register Card */}
      <div className="bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md rounded-3xl p-8 shadow-xl">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl text-red-600 dark:text-red-400 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" translate="no" lang="id">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Nama Lengkap</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nama lengkap sesuai KTP"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Kata Sandi</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full pl-12 pr-12 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
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

          {/* Medical Info Fields: Blood Type and Rhesus */}
          <div className="grid grid-cols-2 gap-4">
            {/* Blood Type Selector */}
            <div>
              <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Gol. Darah</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(["A", "B", "AB", "O"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setBloodType(type)}
                    className={`py-2 rounded-xl border text-sm font-extrabold transition-all ${
                      bloodType === type
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Rhesus Selector */}
            <div>
              <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Rhesus</label>
              <div className="grid grid-cols-2 gap-1.5">
                {(["+", "-"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setRhesus(type)}
                    className={`py-2 rounded-xl border text-sm font-extrabold transition-all ${
                      rhesus === type
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    {type === "+" ? "Pos (+)" : "Neg (-)"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Last Donation Date with new Component */}
          <div>
            <CalendarPicker
              value={lastDonation}
              onChange={(val) => setLastDonation(val)}
              label="Tanggal Donor Terakhir (Opsional)"
              placeholder="Pilih Tanggal"
              language={language}
              openUpward={true}
            />
            <p className="text-[11px] text-slate-400 mt-1">Kosongkan jika Anda belum pernah mendonorkan darah.</p>
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
                Daftar & Masuk
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer inside Card */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center text-sm text-slate-500 dark:text-slate-400">
          Sudah punya akun?{" "}
          <Link href={`/login${redirectPath ? `?redirect=${redirectPath}` : ""}`} className="text-primary hover:underline font-bold">
            Masuk di Sini
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 dark:bg-slate-950 px-6 py-12 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      <Suspense fallback={<div className="text-slate-500">Memuat...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
