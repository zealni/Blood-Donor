"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { 
  Heart, 
  Bell, 
  Sun, 
  Moon, 
  User, 
  LogOut, 
  Award, 
  BookOpen, 
  Activity, 
  Menu, 
  X, 
  ChevronDown, 
  AlertCircle, 
  Check, 
  ShieldCheck, 
  MapPin, 
  FileText 
} from "lucide-react";

interface UserSession {
  email: string;
  fullName: string;
  isLoggedIn: boolean;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<UserSession | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  
  // Interactive UI Dropdowns and Modals state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPmiWidgetOpen, setIsPmiWidgetOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isEduOpen, setIsEduOpen] = useState(false);
  
  // Refs for clicking outside to close
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const pmiRef = useRef<HTMLDivElement>(null);

  // Mock Notifications Data
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "emergency",
      title: "Sinyal Darurat Kritis (A+)",
      message: "RSUP Dr. Sardjito membutuhkan 2 kantong darah A+ segera!",
      time: "5 mnt lalu",
      unread: true,
      link: "/radar/donor?highlight=1"
    },
    {
      id: 2,
      type: "achievement",
      title: "Pencapaian Baru",
      message: "Selamat! Anda mendapatkan lencana 'Pahlawan Pertama'.",
      time: "1 jam lalu",
      unread: true,
    },
    {
      id: 3,
      type: "pmi",
      title: "Jadwal Donor Keliling",
      message: "PMI Sleman di Sleman City Hall pukul 09:00 - 13:00 hari ini.",
      time: "3 jam lalu",
      unread: false,
    }
  ]);

  // Count unread notifications
  const unreadCount = notifications.filter(n => n.unread).length;

  // Mock Leaderboard Data
  const leaderboardData = [
    { rank: 1, name: "Budi Santoso", points: 850, badge: "Pahlawan Legendaris", donations: 12, city: "Sleman" },
    { rank: 2, name: "Siti Rahma", points: 720, badge: "Pahlawan Emas", donations: 10, city: "Bantul" },
    { rank: 3, name: "Ahmad Fauzi", points: 610, badge: "Pahlawan Emas", donations: 8, city: "Yogyakarta" },
    { rank: 4, name: "Dewi Lestari", points: 480, badge: "Pendonor Setia", donations: 6, city: "Kulon Progo" },
    { rank: 5, name: "Rian Hidayat", points: 350, badge: "Pendonor Setia", donations: 5, city: "Gunungkidul" },
  ];

  // Mock PMI Blood Stock level
  const bloodStocks = [
    { type: "A", count: 45, status: "Cukup", color: "bg-emerald-500" },
    { type: "B", count: 28, status: "Menipis", color: "bg-amber-500" },
    { type: "O", count: 82, status: "Aman", color: "bg-emerald-500" },
    { type: "AB", count: 15, status: "Kritis", color: "bg-rose-500" },
  ];

  useEffect(() => {
    // Session state
    const storedSession = localStorage.getItem("user_session");
    if (storedSession) {
      try {
        setSession(JSON.parse(storedSession));
      } catch (e) {
        console.error("Failed to parse user session", e);
      }
    }

    // Theme state
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }

    // Click outside handler
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (pmiRef.current && !pmiRef.current.contains(event.target as Node)) {
        setIsPmiWidgetOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user_session");
    setSession(null);
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleNotificationClick = (n: typeof notifications[0]) => {
    // Mark as read
    setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, unread: false } : item));
    setIsNotificationOpen(false);
    if (n.link) {
      router.push(n.link);
    }
  };

  // Helper to determine if link is active
  const isActive = (path: string) => pathname === path;

  return (
    <>
      <nav className="w-full sticky top-0 z-50 transition-all duration-300 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Left Brand and PMI widget */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="relative">
                  <Heart className="text-primary w-8 h-8 fill-primary group-hover:scale-110 transition-transform" />
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
                  </span>
                </div>
                <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                  BloodConnect
                </span>
              </Link>

              {/* PMI stock mini widget */}
              <div className="relative hidden md:block" ref={pmiRef}>
                <button 
                  onClick={() => setIsPmiWidgetOpen(!isPmiWidgetOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800/70 transition-all shadow-sm"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>PMI DIY: SIAGA</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isPmiWidgetOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* PMI Stock Dropdown Popover */}
                {isPmiWidgetOpen && (
                  <div className="absolute left-0 mt-2 w-72 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-primary" />
                        Stok Darah PMI DIY
                      </span>
                      <span className="text-[10px] text-slate-400">Aktual: Hari Ini</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {bloodStocks.map(stock => (
                        <div key={stock.type} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-slate-800 dark:text-white">{stock.type}</span>
                            <span className={`w-1.5 h-1.5 rounded-full ${stock.color}`} />
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-slate-800 dark:text-white block leading-none">{stock.count}</span>
                            <span className="text-[9px] font-semibold text-slate-400">{stock.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-[10px] text-center text-slate-400 italic">
                      Membutuhkan golongan AB- / O- mendesak. Hubungi PMI terdekat.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Middle Nav Capsule (Links) */}
            <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 px-2 py-1.5 rounded-full">
              <Link 
                href="/" 
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  isActive("/") 
                    ? "bg-white dark:bg-slate-800 text-primary shadow-sm" 
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Beranda
              </Link>
              <Link 
                href="/radar/donor" 
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  isActive("/radar/donor") || isActive("/radar/seeker")
                    ? "bg-white dark:bg-slate-800 text-primary shadow-sm" 
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Peta Radar
              </Link>
              <button 
                onClick={() => setIsLeaderboardOpen(true)}
                className="px-4 py-2 rounded-full text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-1.5"
              >
                <Award className="w-4 h-4 text-amber-500" />
                Peringkat
              </button>
              <button 
                onClick={() => setIsEduOpen(true)}
                className="px-4 py-2 rounded-full text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-1.5"
              >
                <BookOpen className="w-4 h-4 text-emerald-500" />
                Panduan
              </button>
            </div>

            {/* Right Buttons: Theme, Notif, Session/Login */}
            <div className="hidden lg:flex items-center gap-4">
              
              {/* Mode Switcher Toggle for Radar pages */}
              {pathname.startsWith("/radar") && (
                <div className="flex gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-full border border-slate-200/50 dark:border-slate-800/50 mr-1.5">
                  <button
                    onClick={() => router.push("/radar/donor")}
                    className={`px-3.5 py-1.5 rounded-full font-bold text-xs transition-all ${
                      pathname === "/radar/donor"
                        ? "bg-white dark:bg-slate-800 text-primary shadow-sm"
                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    }`}
                  >
                    Mode Pendonor
                  </button>
                  <button
                    onClick={() => router.push("/radar/seeker")}
                    className={`px-3.5 py-1.5 rounded-full font-bold text-xs transition-all ${
                      pathname === "/radar/seeker"
                        ? "bg-white dark:bg-slate-800 text-primary shadow-sm"
                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    }`}
                  >
                    Mode Pemohon
                  </button>
                </div>
              )}

              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all text-slate-600 dark:text-slate-300"
                title={theme === "light" ? "Mode Gelap" : "Mode Terang"}
              >
                {theme === "light" ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5" />}
              </button>

              {/* Notification Center */}
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="relative p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all text-slate-600 dark:text-slate-300"
                  title="Notifikasi"
                >
                  <Bell className="w-4.5 h-4.5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white ring-2 ring-white dark:ring-slate-950">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {isNotificationOpen && (
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                        <Bell className="w-4 h-4 text-primary" />
                        Pemberitahuan
                      </span>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          Tandai dibaca
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-2 py-1 pr-1">
                      {notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => handleNotificationClick(n)}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                            n.unread 
                              ? "bg-rose-50/55 dark:bg-primary/5 border-rose-100 dark:border-primary/20" 
                              : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className={`text-xs font-black leading-tight ${n.unread ? "text-slate-800 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}>
                              {n.title}
                            </span>
                            <span className="text-[9px] text-slate-400 shrink-0">{n.time}</span>
                          </div>
                          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-normal">
                            {n.message}
                          </p>
                          {n.unread && n.type === 'emergency' && (
                            <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-primary">
                              Bantu Sekarang &rarr;
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* User Session Action Area */}
              {session?.isLoggedIn ? (
                <div className="relative" ref={profileRef}>
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all font-bold text-sm text-slate-700 dark:text-slate-200 shadow-sm"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs border border-primary/20">
                      {session.fullName.charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[100px] truncate">{session.fullName}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                      <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                        <span className="font-black text-sm text-slate-800 dark:text-white block truncate">{session.fullName}</span>
                        <span className="text-xs text-slate-400 block truncate leading-tight">{session.email}</span>
                      </div>
                      
                      <div className="p-1 space-y-0.5">
                        <Link 
                          href="/profile" 
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          Profil Saya
                        </Link>
                        
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Keluar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link 
                    href="/login" 
                    className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    Masuk
                  </Link>
                  <Link 
                    href="/register" 
                    className="px-6 py-2.5 text-sm font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full hover:scale-105 transition-all shadow-md shadow-slate-900/10 hover:shadow-slate-900/20"
                  >
                    Daftar
                  </Link>
                </div>
              )}

            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center gap-2">
              {/* Notif Badge on Mobile */}
              <button 
                onClick={() => { setIsMobileMenuOpen(true); setIsNotificationOpen(true); }}
                className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-rose-500"></span>
                )}
              </button>

              <button 
                onClick={toggleTheme}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300"
              >
                {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200 z-50">
            <div className="space-y-1.5">
              <Link 
                href="/" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-bold ${
                  isActive("/") ? "bg-primary/10 text-primary" : "text-slate-700 dark:text-slate-300"
                }`}
              >
                Beranda
              </Link>
              <Link 
                href="/radar/donor" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-bold ${
                  isActive("/radar/donor") || isActive("/radar/seeker") ? "bg-primary/10 text-primary" : "text-slate-700 dark:text-slate-300"
                }`}
              >
                Peta Radar
              </Link>
              <button 
                onClick={() => { setIsLeaderboardOpen(true); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-base font-bold text-slate-700 dark:text-slate-300 text-left"
              >
                <Award className="w-5 h-5 text-amber-500" />
                Papan Peringkat
              </button>
              <button 
                onClick={() => { setIsEduOpen(true); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-base font-bold text-slate-700 dark:text-slate-300 text-left"
              >
                <BookOpen className="w-5 h-5 text-emerald-500" />
                Panduan Donor
              </button>
            </div>

            {/* Mobile Mode Switcher Toggle for Radar pages */}
            {pathname.startsWith("/radar") && (
              <div className="px-1 py-1">
                <div className="flex gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                  <button
                    onClick={() => { router.push("/radar/donor"); setIsMobileMenuOpen(false); }}
                    className={`flex-1 py-2 rounded-lg font-bold text-xs text-center transition-all ${
                      pathname === "/radar/donor"
                        ? "bg-white dark:bg-slate-800 text-primary shadow-sm"
                        : "text-slate-550 dark:text-slate-400"
                    }`}
                  >
                    Mode Pendonor
                  </button>
                  <button
                    onClick={() => { router.push("/radar/seeker"); setIsMobileMenuOpen(false); }}
                    className={`flex-1 py-2 rounded-lg font-bold text-xs text-center transition-all ${
                      pathname === "/radar/seeker"
                        ? "bg-white dark:bg-slate-800 text-primary shadow-sm"
                        : "text-slate-550 dark:text-slate-400"
                    }`}
                  >
                    Mode Pemohon
                  </button>
                </div>
              </div>
            )}

            {/* Mobile notification dropdown area inside drawer */}
            {isNotificationOpen && (
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-xs font-black text-slate-400 block mb-1">PEMBERITAHUAN BARU</span>
                {notifications.map(n => (
                  <div 
                    key={n.id} 
                    onClick={() => handleNotificationClick(n)}
                    className="p-2.5 bg-white dark:bg-slate-950 rounded-lg text-xs"
                  >
                    <span className="font-bold text-slate-800 dark:text-white block">{n.title}</span>
                    <p className="text-slate-500 mt-0.5">{n.message}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Mobile User session / CTA button */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              {session?.isLoggedIn ? (
                <div className="space-y-2">
                  <div className="px-4 py-2">
                    <span className="font-bold text-sm text-slate-800 dark:text-white block">{session.fullName}</span>
                    <span className="text-xs text-slate-400 block">{session.email}</span>
                  </div>
                  <Link 
                    href="/profile" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-center px-4 py-3 rounded-xl text-sm font-bold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                  >
                    Profil Saya
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-center px-4 py-3 rounded-xl text-sm font-bold bg-red-50 dark:bg-red-950/20 text-red-500"
                  >
                    Keluar
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link 
                    href="/login" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-center py-3 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-900"
                  >
                    Masuk
                  </Link>
                  <Link 
                    href="/register" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-center py-3 rounded-xl text-sm font-bold text-white bg-primary hover:bg-rose-600"
                  >
                    Daftar
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* --- LEADERS BOARD MODAL (PREMIUM POPUP) --- */}
      {isLeaderboardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header decoration */}
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-300 via-rose-500 to-indigo-500" />
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Pahlawan Bulan Ini</h3>
                  <p className="text-xs text-slate-400">Peringkat kontributor pendonor darah terbanyak</p>
                </div>
              </div>
              <button 
                onClick={() => setIsLeaderboardOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {leaderboardData.map((user) => (
                <div 
                  key={user.rank}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    user.rank === 1 
                      ? "bg-amber-50/50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20" 
                      : user.rank === 2
                      ? "bg-slate-50/50 dark:bg-slate-200/5 border-slate-200/50 dark:border-slate-200/10"
                      : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Circle */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                      user.rank === 1 ? "bg-amber-500 text-white" :
                      user.rank === 2 ? "bg-slate-400 text-white" :
                      user.rank === 3 ? "bg-amber-700 text-white" :
                      "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    }`}>
                      {user.rank}
                    </div>
                    <div>
                      <span className="font-bold text-sm text-slate-800 dark:text-white block">
                        {user.name}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-rose-500" />
                        {user.city} &bull; {user.badge}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className="font-black text-sm text-slate-800 dark:text-white block">{user.points} Poin</span>
                    <span className="text-[10px] font-semibold text-slate-400">{user.donations}x Donor</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black border border-primary/20">
                  {session?.isLoggedIn ? session.fullName.charAt(0).toUpperCase() : "?"}
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-400 block">Peringkat Anda</span>
                  <span className="font-bold text-sm text-slate-800 dark:text-white">
                    {session?.isLoggedIn ? session.fullName : "Silakan masuk terlebih dahulu"}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-black text-sm text-primary block">{session?.isLoggedIn ? "120 Poin" : "-"}</span>
                <span className="text-[10px] font-semibold text-slate-400">{session?.isLoggedIn ? "1x Donor" : "-"}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- EDU DONOR MODAL --- */}
      {isEduOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header decoration */}
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-300 via-teal-500 to-cyan-500" />
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Panduan Edu-Donor</h3>
                  <p className="text-xs text-slate-400">Informasi penting untuk calon pahlawan pendonor darah</p>
                </div>
              </div>
              <button 
                onClick={() => setIsEduOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Contents */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              
              {/* Syarat umum */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/20">
                <h4 className="text-sm font-black text-emerald-800 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Kriteria Umum Calon Pendonor:
                </h4>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 pl-5 list-disc">
                  <li><strong>Usia:</strong> 17 s/d 60 tahun (atau sampai 65 tahun atas pertimbangan dokter).</li>
                  <li><strong>Berat Badan:</strong> Minimal 45 kg.</li>
                  <li><strong>Tekanan Darah:</strong> Sistole 90-160 mmHg, Diastole 60-100 mmHg.</li>
                  <li><strong>Kadar Hemoglobin (Hb):</strong> 12,5 g/dL s/d 17,0 g/dL.</li>
                  <li><strong>Interval Donor:</strong> Minimal 60 hari sejak donor darah sebelumnya.</li>
                  <li><strong>Kesehatan Umum:</strong> Tidak sedang flu, batuk, demam, atau minum antibiotik.</li>
                </ul>
              </div>

              {/* Blood Matrix Info */}
              <div>
                <h4 className="text-sm font-black text-slate-800 dark:text-white mb-2 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-primary animate-pulse" />
                  Skema Transfusi &amp; Kecocokan Golongan Darah
                </h4>
                <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
                  <table className="min-w-full text-xs text-left divide-y divide-slate-100 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-950 font-bold text-slate-600 dark:text-slate-400">
                      <tr>
                        <th className="px-4 py-2">Tipe Darah</th>
                        <th className="px-4 py-2">Bisa Mendonor Ke (Resipien)</th>
                        <th className="px-4 py-2">Bisa Menerima Dari (Donor)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      <tr>
                        <td className="px-4 py-2.5 font-bold">A+</td>
                        <td className="px-4 py-2.5">A+, AB+</td>
                        <td className="px-4 py-2.5">A+, A-, O+, O-</td>
                      </tr>
                      <tr className="bg-slate-50/30 dark:bg-slate-900/30">
                        <td className="px-4 py-2.5 font-bold">B+</td>
                        <td className="px-4 py-2.5">B+, AB+</td>
                        <td className="px-4 py-2.5">B+, B-, O+, O-</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 font-bold">O+</td>
                        <td className="px-4 py-2.5">O+, A+, B+, AB+</td>
                        <td className="px-4 py-2.5">O+, O-</td>
                      </tr>
                      <tr className="bg-slate-50/30 dark:bg-slate-900/30">
                        <td className="px-4 py-2.5 font-bold">AB+</td>
                        <td className="px-4 py-2.5">AB+ (Penerima Universal)</td>
                        <td className="px-4 py-2.5">Semua Golongan Darah</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 font-bold text-rose-500">O-</td>
                        <td className="px-4 py-2.5 text-rose-500 font-bold">Semua Golongan (Donor Universal)</td>
                        <td className="px-4 py-2.5">O-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Manfaat */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-3 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
                  <span className="font-bold text-xs text-slate-800 dark:text-white block mb-1">Manfaat Bagi Kesehatan Anda:</span>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Membantu menurunkan risiko penyakit jantung, menyeimbangkan kadar zat besi, memicu regenerasi sel darah baru, dan memberikan kepuasan mental yang mendalam.
                  </p>
                </div>
                <div className="p-3 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
                  <span className="font-bold text-xs text-slate-800 dark:text-white block mb-1">Apa yang perlu dipersiapkan?</span>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Tidur cukup minimal 6-8 jam sebelum mendonor, minum air putih ekstra (minimal 500ml), makan makanan bergizi ringan, dan hindari konsumsi alkohol / obat sakit kepala.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
