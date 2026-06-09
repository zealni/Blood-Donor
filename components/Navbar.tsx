"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { 
  Heart, 
  Home,
  Bell, 
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
  FileText,
  Settings
} from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "./LanguageProvider";
import { createClient } from "@/lib/supabase/client";
import dynamic from "next/dynamic";
import { getDistance, parseWkbHexPoint } from "@/lib/geo";

const NotificationSettingsModal = dynamic(() => import("./NotificationSettingsModal"), {
  ssr: false,
});

interface UserSession {
  email: string;
  fullName: string;
  isLoggedIn: boolean;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { language } = useLanguage();
  const [session, setSession] = useState<UserSession | null>(null);
  
  // Interactive UI Dropdowns and Modals state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPmiWidgetOpen, setIsPmiWidgetOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isEduOpen, setIsEduOpen] = useState(false);
  
  const handleEduClick = () => {
    if (pathname.startsWith("/radar")) {
      setIsEduOpen(true);
      setIsNotificationOpen(false);
      setIsPmiWidgetOpen(false);
      setIsProfileOpen(false);
    } else {
      router.push("/panduan");
    }
    setIsMobileMenuOpen(false);
  };
  
  // Refs for clicking outside to close
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const pmiRef = useRef<HTMLDivElement>(null);

  // Notification Settings state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTrigger, setSettingsTrigger] = useState(0);
  const [settings, setSettings] = useState<any>({
    radius: 10,
    centerMode: "current",
    customCenter: [-7.795, 110.369],
    customCenterName: "D.I. Yogyakarta",
    filterMode: "compatible",
    guestBloodType: "O",
    guestRhesus: "+"
  });

  const [realRequests, setRealRequests] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [userBloodInfo, setUserBloodInfo] = useState({ type: "O", rhesus: "+" });
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);

  // Load notification settings from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("notification_settings");
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch (e) { console.error(e); }
    }
  }, [settingsTrigger]);

  // Load read notification ids from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("read_notifications");
    if (stored) {
      try {
        setReadNotificationIds(JSON.parse(stored));
      } catch (e) { console.error(e); }
    }
  }, []);

  // Geolocation for radius center (if current mode is active)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => console.log("GPS permission not granted for notifications center:", err)
      );
    }
  }, []);

  // Fetch open requests from Supabase
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    async function fetchRequests() {
      try {
        const { data, error } = await supabase
          .from("blood_requests")
          .select("id, hospital_name, blood_type, rhesus, bags_needed, urgency, created_at, status, hospital_coord")
          .eq("status", "open");

        if (data && !error) {
          setRealRequests(data);
        }
      } catch (e) { console.error(e); }
    }

    fetchRequests();

    // Realtime Postgres listener for new emergency signals
    const channel = supabase
      .channel("navbar-notifications-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "blood_requests" }, () => fetchRequests())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Fetch profile blood info if user is logged in
  useEffect(() => {
    if (session?.isLoggedIn) {
      const stored = localStorage.getItem("user_session");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.id) {
            const supabase = createClient();
            if (supabase) {
              supabase.from("profiles").select("blood_type, rhesus").eq("id", parsed.id).single()
                .then((res: any) => {
                  const data = res.data;
                  if (data) {
                    setUserBloodInfo({ type: data.blood_type || "O", rhesus: data.rhesus || "+" });
                  }
                });
            }
          }
        } catch (e) { console.error(e); }
      }
    }
  }, [session?.isLoggedIn]);

  // Blood type compatibility helper
  const isCompatible = (donorBlood: string, donorRhesus: string, recipientBlood: string, recipientRhesus: string): boolean => {
    const donor = `${donorBlood}${donorRhesus}`;
    const recipient = `${recipientBlood}${recipientRhesus}`;
    
    const compatibilityMap: Record<string, string[]> = {
      "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
      "O+": ["O+", "A+", "B+", "AB+"],
      "A-": ["A-", "A+", "AB-", "AB+"],
      "A+": ["A+", "AB+"],
      "B-": ["B-", "B+", "AB-", "AB+"],
      "B+": ["B+", "AB+"],
      "AB-": ["AB-", "AB+"],
      "AB+": ["AB+"]
    };
    
    return compatibilityMap[donor]?.includes(recipient) ?? false;
  };

  // Format time ago for emergency signals
  const formatTimeAgo = (dateStr: string) => {
    const diffMs = new Date().getTime() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return language === "en" ? "Just now" : "Baru saja";
    if (diffMins < 60) return language === "en" ? `${diffMins}m ago` : `${diffMins} mnt lalu`;
    if (diffHours < 24) return language === "en" ? `${diffHours}h ago` : `${diffHours} jam lalu`;
    return language === "en" ? `${diffDays}d ago` : `${diffDays} hari lalu`;
  };

  // Compute dynamic notification list
  const computedNotifications = useMemo(() => {
    let centerLat = -7.795;
    let centerLng = 110.369;
    
    if (settings.centerMode === "current" && userLocation) {
      centerLat = userLocation[0];
      centerLng = userLocation[1];
    } else if (settings.centerMode === "custom" && settings.customCenter) {
      centerLat = settings.customCenter[0];
      centerLng = settings.customCenter[1];
    }
    
    const donorType = session?.isLoggedIn ? userBloodInfo.type : (settings.guestBloodType || "O");
    const donorRhesus = session?.isLoggedIn ? userBloodInfo.rhesus : (settings.guestRhesus || "+");

    const mappedEmergencies = realRequests.map(req => {
      const coords = parseWkbHexPoint(req.hospital_coord);
      const lat = coords ? coords[0] : -7.795;
      const lng = coords ? coords[1] : 110.369;
      const distance = getDistance(centerLat, centerLng, lat, lng);
      
      let isCompatibleMatch = true;
      if (settings.filterMode === "exact") {
        isCompatibleMatch = req.blood_type === donorType && req.rhesus === donorRhesus;
      } else if (settings.filterMode === "compatible") {
        isCompatibleMatch = isCompatible(donorType, donorRhesus, req.blood_type, req.rhesus);
      }
      
      return {
        id: req.id,
        type: "emergency",
        title: language === "en" 
          ? `Emergency: ${req.urgency} (${req.blood_type}${req.rhesus})` 
          : `Sinyal Darurat ${req.urgency} (${req.blood_type}${req.rhesus})`,
        message: language === "en"
          ? `${req.hospital_name} needs ${req.bags_needed} bags of blood! Distance: ${distance.toFixed(1)} km.`
          : `${req.hospital_name} membutuhkan ${req.bags_needed} kantong darah segera! Jarak: ${distance.toFixed(1)} km.`,
        time: formatTimeAgo(req.created_at),
        rawTime: req.created_at,
        unread: !readNotificationIds.includes(req.id),
        link: `/radar/donor?highlight=${req.id}`,
        distance,
        isCompatibleMatch
      };
    }).filter(req => {
      const matchesDistance = req.distance <= settings.radius;
      const matchesBlood = req.isCompatibleMatch;
      return matchesDistance && matchesBlood;
    });

    const mockNotifs = [
      {
        id: "mock-achievement-1",
        type: "achievement",
        title: language === "en" ? "New Achievement" : "Pencapaian Baru",
        message: language === "en" 
          ? "Congratulations! You earned the 'First Hero' badge." 
          : "Selamat! Anda mendapatkan lencana 'Pahlawan Pertama'.",
        time: formatTimeAgo(new Date(new Date().getTime() - 3600000).toISOString()),
        rawTime: new Date(new Date().getTime() - 3600000).toISOString(),
        unread: !readNotificationIds.includes("mock-achievement-1"),
      },
      {
        id: "mock-pmi-1",
        type: "pmi",
        title: language === "en" ? "Mobile Donor Schedule" : "Jadwal Pendonor Keliling",
        message: language === "en"
          ? "PMI Sleman at Sleman City Hall from 09:00 to 13:00 today."
          : "PMI Sleman di Sleman City Hall pukul 09:00 - 13:00 hari ini.",
        time: formatTimeAgo(new Date(new Date().getTime() - 3600000 * 3).toISOString()),
        rawTime: new Date(new Date().getTime() - 3600000 * 3).toISOString(),
        unread: !readNotificationIds.includes("mock-pmi-1"),
      }
    ];

    return [...mappedEmergencies, ...mockNotifs].sort((a, b) => {
      return new Date(b.rawTime).getTime() - new Date(a.rawTime).getTime();
    });
  }, [realRequests, settings, userLocation, userBloodInfo, readNotificationIds, session, language]);

  const unreadCount = computedNotifications.filter(n => n.unread).length;
  const handleSettingsSave = () => setSettingsTrigger(prev => prev + 1);



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

    // Force light mode
    document.documentElement.classList.remove("dark");
    localStorage.removeItem("theme");

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


  const handleLogout = async () => {
    try {
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.error("Error signing out from Supabase:", e);
    }
    localStorage.removeItem("user_session");
    setSession(null);
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const markAllAsRead = () => {
    const ids = computedNotifications.map(n => n.id);
    setReadNotificationIds(ids);
    localStorage.setItem("read_notifications", JSON.stringify(ids));
  };

  const handleNotificationClick = (n: any) => {
    if (!readNotificationIds.includes(n.id)) {
      const updated = [...readNotificationIds, n.id];
      setReadNotificationIds(updated);
      localStorage.setItem("read_notifications", JSON.stringify(updated));
    }
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


            </div>

            {/* Middle Nav Capsule (Links) */}
            <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 px-2 py-1.5 rounded-full">
              <Link 
                href="/" 
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-1.5 ${
                  isActive("/") 
                    ? "bg-white dark:bg-slate-800 text-primary shadow-sm" 
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Home className="w-4 h-4 text-primary" />
                Beranda
              </Link>
              <Link 
                href="/radar/donor" 
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-1.5 ${
                  isActive("/radar/donor") || isActive("/radar/seeker")
                    ? "bg-white dark:bg-slate-800 text-primary shadow-sm" 
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <MapPin className="w-4 h-4 text-rose-500" />
                Peta
              </Link>
              <button 
                onClick={() => {
                  setIsLeaderboardOpen(true);
                  setIsNotificationOpen(false);
                  setIsPmiWidgetOpen(false);
                  setIsProfileOpen(false);
                }}
                className="px-4 py-2 rounded-full text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-1.5"
              >
                <Award className="w-4 h-4 text-amber-500" />
                {language === "en" ? "Impact" : "Dampak"}
              </button>
              <button 
                onClick={handleEduClick}
                className="px-4 py-2 rounded-full text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-1.5"
              >
                <BookOpen className="w-4 h-4 text-emerald-500" />
                {language === "en" ? "Guide" : "Panduan"}
              </button>
            </div>

            {/* Right Buttons: Theme, Notif, Session/Login */}
            <div className="hidden lg:flex items-center gap-4">
              <LanguageSwitcher />


              {/* Notification Center */}
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={() => {
                    setIsNotificationOpen(!isNotificationOpen);
                    setIsPmiWidgetOpen(false);
                    setIsProfileOpen(false);
                  }}
                  className="relative p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all text-slate-600 dark:text-slate-300"
                  title="Notifikasi"
                  aria-label={language === "en" ? "Notifications" : "Notifikasi"}
                  aria-expanded={isNotificationOpen}
                  aria-haspopup="true"
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
                        {language === "en" ? "Notifications" : "Pemberitahuan"}
                      </span>
                      
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => {
                            setIsSettingsOpen(true);
                            setIsNotificationOpen(false);
                          }}
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
                          title={language === "en" ? "Settings" : "Pengaturan"}
                          aria-label={language === "en" ? "Notification settings" : "Pengaturan notifikasi"}
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                        
                        {unreadCount > 0 && (
                          <button 
                            onClick={markAllAsRead}
                            className="text-xs font-bold text-primary hover:underline"
                          >
                            {language === "en" ? "Mark read" : "Tandai dibaca"}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-2 py-1 pr-1">
                      {computedNotifications.length > 0 ? (
                        computedNotifications.map(n => (
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
                        ))
                      ) : (
                        <div className="py-8 text-center text-slate-400 text-xs font-medium">
                          {language === "en" ? "No emergency signals nearby." : "Tidak ada sinyal darurat di dekat Anda."}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Session Action Area */}
              {session?.isLoggedIn ? (
                <div className="relative" ref={profileRef}>
                  <button 
                    onClick={() => {
                      setIsProfileOpen(!isProfileOpen);
                      setIsNotificationOpen(false);
                      setIsPmiWidgetOpen(false);
                    }}
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all font-bold text-sm text-slate-700 dark:text-slate-200 shadow-sm"
                    aria-label={language === "en" ? "User menu" : "Menu pengguna"}
                    aria-expanded={isProfileOpen}
                    aria-haspopup="true"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs border border-primary/20">
                      {session.fullName.charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[160px] truncate">{session.fullName}</span>
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
                aria-label={language === "en" ? "Notifications" : "Notifikasi"}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-rose-500"></span>
                )}
              </button>


              <button
                onClick={() => {
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                  setIsNotificationOpen(false);
                  setIsPmiWidgetOpen(false);
                  setIsProfileOpen(false);
                }}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label={isMobileMenuOpen ? (language === "en" ? "Close menu" : "Tutup menu") : (language === "en" ? "Open menu" : "Buka menu")}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200 z-50">
            <LanguageSwitcher compact />

            <div className="space-y-1.5">
              <Link 
                href="/" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-base font-bold ${
                  isActive("/") ? "bg-primary/10 text-primary" : "text-slate-700 dark:text-slate-300"
                }`}
              >
                <Home className="w-5 h-5 text-primary" />
                Beranda
              </Link>
              <Link 
                href="/radar/donor" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-base font-bold ${
                  isActive("/radar/donor") || isActive("/radar/seeker") ? "bg-primary/10 text-primary" : "text-slate-700 dark:text-slate-300"
                }`}
              >
                <MapPin className="w-5 h-5 text-rose-500" />
                Peta
              </Link>
              <button 
                onClick={() => { setIsLeaderboardOpen(true); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-base font-bold text-slate-700 dark:text-slate-300 text-left"
              >
                <Award className="w-5 h-5 text-amber-500" />
                {language === "en" ? "Humanitarian Impact" : "Dampak Kemanusiaan"}
              </button>
              <button 
                onClick={handleEduClick}
                className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-base font-bold text-slate-700 dark:text-slate-300 text-left"
              >
                <BookOpen className="w-5 h-5 text-emerald-500" />
                {language === "en" ? "Donor Guide" : "Panduan Donor"}
              </button>
            </div>



            {/* Mobile notification dropdown area inside drawer */}
            {isNotificationOpen && (
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-xs font-black text-slate-400 block mb-1">PEMBERITAHUAN BARU</span>
                {computedNotifications.length > 0 ? (
                  computedNotifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => handleNotificationClick(n)}
                      className="p-2.5 bg-white dark:bg-slate-950 rounded-lg text-xs cursor-pointer"
                    >
                      <span className="font-bold text-slate-800 dark:text-white block">{n.title}</span>
                      <p className="text-slate-500 mt-0.5">{n.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-400 text-xs font-medium">
                    {language === "en" ? "No signals nearby." : "Tidak ada sinyal di sekitar."}
                  </div>
                )}
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

      {/* --- HUMANITARIAN IMPACT & PERSONAL MILESTONES MODAL --- */}
      {isLeaderboardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header decoration */}
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-400 via-primary to-blue-500" />
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/10 text-primary">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {language === "en" ? "Humanitarian Impact" : "Dampak Kemanusiaan"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === "en" ? "Community impact and your personal milestones" : "Kontribusi Anda dan dampak nyata komunitas Yogyakarta"}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsLeaderboardOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable container */}
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
              
              {/* OPSI B: Dampak Kolektif Komunitas */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-950 dark:to-slate-900/50 border border-slate-200/50 dark:border-slate-800">
                <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3.5 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
                  {language === "en" ? "Yogyakarta Community Stats" : "Dampak Komunitas Yogyakarta"}
                </h4>

                {/* Grid stats */}
                <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-xl font-black text-primary block">142</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase leading-snug">
                      {language === "en" ? "Bags Collected" : "Kantong Darah"}
                    </span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 block">426</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase leading-snug">
                      {language === "en" ? "Lives Helped" : "Jiwa Terbantu"}
                    </span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-xl font-black text-blue-500 block">89</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase leading-snug">
                      {language === "en" ? "Active Donors" : "Pendonor Siaga"}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 mb-1.5">
                    <span>{language === "en" ? "Monthly Target Supply" : "Target Suplai Bulanan"}</span>
                    <span>71% (142 / 200 {language === "en" ? "Bags" : "Kantong"})</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: "71%" }}
                    />
                  </div>
                  <p className="text-[9px] text-slate-400 mt-2 leading-relaxed">
                    {language === "en"
                      ? "*Target is set dynamically to supply critical blood levels at Yogyakarta Red Cross (PMI) hospitals."
                      : "*Target disesuaikan untuk memenuhi kebutuhan stok darah kritis di PMI & rumah sakit Yogyakarta."}
                  </p>
                </div>
              </div>

              {/* OPSI A: Lencana & Riwayat Anda (Pribadi) */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80">
                <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  {language === "en" ? "Your Private Milestones" : "Pencapaian Pribadi Anda"}
                </h4>

                {session?.isLoggedIn ? (
                  <div className="space-y-5">
                    {/* User personal stats */}
                    <div className="grid grid-cols-3 gap-2 py-3 px-4 bg-slate-50 dark:bg-slate-950 rounded-xl text-center">
                      <div>
                        <span className="text-xs font-bold text-slate-400 block leading-tight">Total Donor</span>
                        <span className="text-sm font-black text-slate-800 dark:text-white">3x</span>
                      </div>
                      <div className="border-x border-slate-200/50 dark:border-slate-800">
                        <span className="text-xs font-bold text-slate-400 block leading-tight">Poin</span>
                        <span className="text-sm font-black text-primary">150</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 block leading-tight">Lives Saved</span>
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">9 Jiwa</span>
                      </div>
                    </div>

                    {/* Badges list */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
                        {language === "en" ? "Unlocked Badges" : "Koleksi Lencana Anda"}
                      </span>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/30 dark:bg-slate-900/30 flex gap-2.5 items-center">
                          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-lg shrink-0">
                            🛡️
                          </div>
                          <div>
                            <span className="font-extrabold text-xs text-slate-800 dark:text-white block">Langkah Awal</span>
                            <span className="text-[9px] text-slate-400 block leading-tight">Terdaftar Siaga</span>
                          </div>
                        </div>

                        <div className="p-3 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/30 dark:bg-slate-900/30 flex gap-2.5 items-center">
                          <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center text-lg shrink-0">
                            🎖️
                          </div>
                          <div>
                            <span className="font-extrabold text-xs text-slate-800 dark:text-white block">Pahlawan Pertama</span>
                            <span className="text-[9px] text-slate-400 block leading-tight">1x Donor Verifikasi</span>
                          </div>
                        </div>

                        <div className="p-3 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/30 dark:bg-slate-900/30 flex gap-2.5 items-center">
                          <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center text-lg shrink-0">
                            📢
                          </div>
                          <div>
                            <span className="font-extrabold text-xs text-slate-800 dark:text-white block">Penjaga Sinyal</span>
                            <span className="text-[9px] text-slate-400 block leading-tight">Bagikan Info SOS</span>
                          </div>
                        </div>

                        <div className="p-3 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex gap-2.5 items-center opacity-40">
                          <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center text-lg shrink-0">
                            🔒
                          </div>
                          <div>
                            <span className="font-extrabold text-xs text-slate-400 block">Pendonor Setia</span>
                            <span className="text-[9px] text-slate-400 block leading-tight">Butuh 5x Donor</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 px-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center">
                    <span className="text-2xl mb-2">🔒</span>
                    <span className="font-bold text-xs text-slate-700 dark:text-slate-300 block mb-1">
                      {language === "en" ? "Personal Milestones" : "Pencapaian Kemanusiaan Pribadi"}
                    </span>
                    <p className="text-[10px] text-slate-400 max-w-[240px] leading-relaxed mb-4">
                      {language === "en"
                        ? "Log in to track your donation counts, earn humanitarian badges, and calculate saved lives."
                        : "Masuk untuk mencatat frekuensi donor Anda, membuka lencana kehormatan, dan melacak kontribusi penyelamatan nyawa secara privat."}
                    </p>
                    <Link
                      href="/login"
                      onClick={() => setIsLeaderboardOpen(false)}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-850 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-extrabold text-[10px] rounded-lg shadow-sm transition-all"
                    >
                      {language === "en" ? "Log In Now" : "Masuk Sekarang"}
                    </Link>
                  </div>
                )}
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

              {/* Hybrid Link to Full Education Page */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => {
                    setIsEduOpen(false);
                    router.push("/panduan");
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] duration-200"
                >
                  <span>{language === "en" ? "View Full Guide & Donation Tips →" : "Lihat Panduan Lengkap & Tips Donor →"}</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* --- NOTIFICATION SETTINGS MODAL --- */}
      {isSettingsOpen && (
        <NotificationSettingsModal
          onClose={() => setIsSettingsOpen(false)}
          onSave={handleSettingsSave}
          userSession={session}
        />
      )}
    </>
  );
}
