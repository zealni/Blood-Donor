"use client";

import { Activity, MapPin, Clock, ArrowRight, Heart, ChevronDown } from "lucide-react";
import { useEffect, useState, useRef, useMemo } from "react";
import { createClient } from "../lib/supabase/client";
import { useLanguage } from "./LanguageProvider";

interface RequestSignal {
  id: string;
  hospitalName: string;
  bloodType: string;
  rhesus: string;
  bagsNeeded: number;
  urgency: "Kritis" | "Tinggi" | "Sedang";
  timeAgoId: string;
  timeAgoEn: string;
}

export interface RegionOption {
  id: string;
  name: string;
  nameEn: string;
  keywords: string[];
}

export const PROVINCES: RegionOption[] = [
  { id: "yogyakarta", name: "D.I. Yogyakarta", nameEn: "D.I. Yogyakarta", keywords: ["yogyakarta", "jogja", "jogjakarta", "diy", "sardjito", "panti rapih", "bethesda", "jih", "sleman", "bantul", "gunungkidul", "kulon progo", "wonosari", "wates"] },
  { id: "aceh", name: "Aceh", nameEn: "Aceh", keywords: ["aceh", "banda aceh", "meulaboh", "langsa", "lhokseumawe"] },
  { id: "sumatera-utara", name: "Sumatera Utara", nameEn: "North Sumatra", keywords: ["sumatera utara", "sumut", "medan", "binjai", "pematangsiantar", "toba", "deliserdang"] },
  { id: "sumatera-barat", name: "Sumatera Barat", nameEn: "West Sumatra", keywords: ["sumatera barat", "sumbar", "padang", "bukittinggi", "payakumbuh", "solok"] },
  { id: "riau", name: "Riau", nameEn: "Riau", keywords: ["riau", "pekanbaru", "dumai", "kampar"] },
  { id: "kepulauan-riau", name: "Kepulauan Riau", nameEn: "Riau Islands", keywords: ["kepulauan riau", "kepri", "batam", "tanjungpinang", "bintan"] },
  { id: "jambi", name: "Jambi", nameEn: "Jambi", keywords: ["jambi", "muaro jambi", "kerinci"] },
  { id: "bengkulu", name: "Bengkulu", nameEn: "Bengkulu", keywords: ["bengkulu", "bhayangkara", "m. yunus", "tiara sella", "raflesia"] },
  { id: "sumatera-selatan", name: "Sumatera Selatan", nameEn: "South Sumatra", keywords: ["sumatera selatan", "sumsel", "palembang", "lubuklinggau", "prabumulih", "ogan"] },
  { id: "bangka-belitung", name: "Kepulauan Bangka Belitung", nameEn: "Bangka Belitung Islands", keywords: ["bangka belitung", "babel", "pangkalpinang", "belitung"] },
  { id: "lampung", name: "Lampung", nameEn: "Lampung", keywords: ["lampung", "bandar lampung", "metro", "petinggi"] },
  { id: "banten", name: "Banten", nameEn: "Banten", keywords: ["banten", "tangerang", "serang", "cilegon", "pandeglang", "lebak"] },
  { id: "dki-jakarta", name: "DKI Jakarta", nameEn: "DKI Jakarta", keywords: ["jakarta", "dki", "rscm", "gatot soebroto", "harapan kita", "fatmawati", "cengkareng", "tarakan"] },
  { id: "jawa-barat", name: "Jawa Barat", nameEn: "West Java", keywords: ["jawa barat", "jabar", "bandung", "bogor", "depok", "bekasi", "cirebon", "hasan sadikin", "borromeus", "hermina", "al ihsan"] },
  { id: "jawa-tengah", name: "Jawa Tengah", nameEn: "Central Java", keywords: ["jawa tengah", "jateng", "semarang", "solo", "surakarta", "magelang", "kariadi", "moewardi", "dr. oen"] },
  { id: "jawa-timur", name: "Jawa Timur", nameEn: "East Java", keywords: ["jawa timur", "jatim", "surabaya", "malang", "sidoarjo", "soetomo", "saiful anwar", "rkz", "phc"] },
  { id: "bali", name: "Bali", nameEn: "Bali", keywords: ["bali", "denpasar", "badung", "sanglah", "tabanan", "gianyar"] },
  { id: "nusa-tenggara-barat", name: "Nusa Tenggara Barat", nameEn: "West Nusa Tenggara", keywords: ["nusa tenggara barat", "ntb", "mataram", "lombok", "sumbawa"] },
  { id: "nusa-tenggara-timur", name: "Nusa Tenggara Timur", nameEn: "East Nusa Tenggara", keywords: ["nusa tenggara timur", "ntt", "kupang", "flores", "sumba"] },
  { id: "kalimantan-barat", name: "Kalimantan Barat", nameEn: "West Kalimantan", keywords: ["kalimantan barat", "kalbar", "pontianak", "singkawang", "ketapang"] },
  { id: "kalimantan-tengah", name: "Kalimantan Tengah", nameEn: "Central Kalimantan", keywords: ["kalimantan tengah", "kalteng", "palangkaraya", "sampit", "pangkalan bun"] },
  { id: "kalimantan-selatan", name: "Kalimantan Selatan", nameEn: "South Kalimantan", keywords: ["kalimantan selatan", "kalsel", "banjarmasin", "banjarbaru", "martapura"] },
  { id: "kalimantan-timur", name: "Kalimantan Timur", nameEn: "East Kalimantan", keywords: ["kalimantan timur", "kaltim", "samarinda", "balikpapan", "kutai", "bontang"] },
  { id: "kalimantan-utara", name: "Kalimantan Utara", nameEn: "North Kalimantan", keywords: ["kalimantan utara", "kalut", "tarakan", "tanjung selor", "nunukan"] },
  { id: "sulawesi-utara", name: "Sulawesi Utara", nameEn: "North Sulawesi", keywords: ["sulawesi utara", "sulut", "manado", "bitung", "tomohon"] },
  { id: "gorontalo", name: "Gorontalo", nameEn: "Gorontalo", keywords: ["gorontalo", "limboto"] },
  { id: "sulawesi-tengah", name: "Sulawesi Tengah", nameEn: "Central Sulawesi", keywords: ["sulawesi tengah", "sulteng", "palu", "luwuk", "poso"] },
  { id: "sulawesi-barat", name: "Sulawesi Barat", nameEn: "West Sulawesi", keywords: ["sulawesi barat", "sulbar", "mamuju", "polewali"] },
  { id: "sulawesi-selatan", name: "Sulawesi Selatan", nameEn: "South Sulawesi", keywords: ["sulawesi selatan", "sulsel", "makassar", "gowa", "maros", "parepare", "palopo"] },
  { id: "sulawesi-tenggara", name: "Sulawesi Tenggara", nameEn: "Southeast Sulawesi", keywords: ["sulawesi tenggara", "sultra", "kendari", "bau-bau", "kolaka"] },
  { id: "maluku", name: "Maluku", nameEn: "Maluku", keywords: ["maluku", "ambon", "tual"] },
  { id: "maluku-utara", name: "Maluku Utara", nameEn: "North Maluku", keywords: ["maluku utara", "malut", "ternate", "tidore", "halmahera"] },
  { id: "papua-barat", name: "Papua Barat", nameEn: "West Papua", keywords: ["papua barat", "manokwari", "fakfak"] },
  { id: "papua", name: "Papua", nameEn: "Papua", keywords: ["papua", "jayapura", "sentani"] },
  { id: "papua-tengah", name: "Papua Tengah", nameEn: "Central Papua", keywords: ["papua tengah", "nabire", "mimika", "timika"] },
  { id: "papua-pegunungan", name: "Papua Pegunungan", nameEn: "Highland Papua", keywords: ["papua pegunungan", "wamena", "jayawijaya"] },
  { id: "papua-selatan", name: "Papua Selatan", nameEn: "South Papua", keywords: ["papua selatan", "merauke"] },
  { id: "papua-barat-daya", name: "Papua Barat Daya", nameEn: "Southwest Papua", keywords: ["papua barat daya", "sorong"] }
];

function getProvinceBadgeText(prov: RegionOption, lang: "id" | "en") {
  const noNearby = ["dki-jakarta", "kepulauan-riau", "sumatera-utara", "sumatera-barat", "bangka-belitung", "jawa-barat", "jawa-tengah", "jawa-timur", "nusa-tenggara-barat", "nusa-tenggara-timur", "kalimantan-barat", "kalimantan-tengah", "kalimantan-selatan", "kalimantan-timur", "kalimantan-utara", "sulawesi-utara", "sulawesi-tengah", "sulawesi-barat", "sulawesi-selatan", "sulawesi-tenggara", "maluku-utara", "papua-barat", "papua-tengah", "papua-pegunungan", "papua-selatan", "papua-barat-daya"];
  const isNoNearby = noNearby.includes(prov.id);
  
  if (lang === "en") {
    return isNoNearby 
      ? `Active SOS Signals (${prov.nameEn})` 
      : `Active SOS Signals (${prov.nameEn} and Nearby)`;
  } else {
    const displayName = prov.id === "yogyakarta" ? "Yogyakarta" : prov.name;
    return isNoNearby 
      ? `Sinyal SOS Aktif (${prov.name})` 
      : `Sinyal SOS Aktif (${displayName} & Sekitarnya)`;
  }
}

function getTimeAgo(dateString: string, lang: "id" | "en") {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.round(diffMs / 60000);
  
  if (diffMins < 1) return lang === "en" ? "Just now" : "Baru saja";
  
  if (diffMins < 60) {
    return lang === "en" 
      ? `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago` 
      : `${diffMins} menit yang lalu`;
  }
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) {
    return lang === "en"
      ? `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`
      : `${diffHours} jam yang lalu`;
  }
  
  const diffDays = Math.floor(diffHours / 24);
  return lang === "en"
    ? `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`
    : `${diffDays} hari yang lalu`;
}

interface ActiveRequestsProps {
  onCTA: (path: string) => void;
}

export default function ActiveRequests({ onCTA }: ActiveRequestsProps) {
  const { language } = useLanguage();
  const [selectedRegion, setSelectedRegion] = useState("yogyakarta");
  const [isOpen, setIsOpen] = useState(false);
  const [allDbRequests, setAllDbRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load user session location on mount or detect via GPS/IP
  useEffect(() => {
    const storedSession = typeof window !== "undefined" ? localStorage.getItem("user_session") : null;
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession);
        const userLoc = session.location?.toLowerCase();
        if (userLoc) {
          const matched = PROVINCES.find(prov => 
            prov.name.toLowerCase().includes(userLoc) || 
            userLoc.includes(prov.id) ||
            prov.keywords.some(kw => userLoc.includes(kw))
          );
          if (matched) {
            setSelectedRegion(matched.id);
            return;
          }
        }
      } catch (e) {
        console.error("Failed to parse user session location:", e);
      }
    }

    // Check localStorage cache for previously auto-detected province
    const cachedDetected = typeof window !== "undefined" ? localStorage.getItem("detected_province") : null;
    if (cachedDetected) {
      const matched = PROVINCES.find(p => p.id === cachedDetected);
      if (matched) {
        setSelectedRegion(matched.id);
        return;
      }
    }

    // Fallback: Detect location via IP Geolocation APIs
    async function detectProvinceByIP() {
      const apis = [
        {
          url: "https://ipapi.co/json/",
          getRegion: (data: any) => data.region || data.region_name || data.city
        },
        {
          url: "https://freeipapi.com/api/json",
          getRegion: (data: any) => data.regionName || data.cityName
        },
        {
          url: "https://ipinfo.io/json",
          getRegion: (data: any) => data.region || data.city
        }
      ];

      for (const api of apis) {
        try {
          const res = await fetch(api.url);
          if (res.ok) {
            const data = await res.json();
            const rawRegion = api.getRegion(data);
            if (rawRegion && typeof rawRegion === "string") {
              const regionLower = rawRegion.toLowerCase();
              const matched = PROVINCES.find(prov => {
                if (prov.name.toLowerCase().includes(regionLower) || regionLower.includes(prov.name.toLowerCase())) return true;
                if (prov.id.includes(regionLower) || regionLower.includes(prov.id)) return true;
                return prov.keywords.some(kw => regionLower.includes(kw) || kw.includes(regionLower));
              });

              if (matched) {
                console.log(`Detected province via IP geolocation (${api.url}):`, matched.name);
                setSelectedRegion(matched.id);
                localStorage.setItem("detected_province", matched.id);
                return;
              }
            }
          }
        } catch (err) {
          console.warn(`Failed to fetch from ${api.url}:`, err);
        }
      }
      // If geolocation fails, default to yogyakarta
      setSelectedRegion("yogyakarta");
    }

    // Try HTML5 Browser Geolocation (Highly Accurate GPS/Wi-Fi) first
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Reverse geocode via OSM Nominatim (free, open source)
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
              {
                headers: {
                  "Accept-Language": "id,en"
                }
              }
            );
            if (res.ok) {
              const data = await res.json();
              const stateName = data.address?.state || data.address?.province || data.address?.region || data.address?.city;
              if (stateName && typeof stateName === "string") {
                const stateLower = stateName.toLowerCase();
                const matched = PROVINCES.find(prov => {
                  if (prov.name.toLowerCase().includes(stateLower) || stateLower.includes(prov.name.toLowerCase())) return true;
                  if (prov.id.includes(stateLower) || stateLower.includes(prov.id)) return true;
                  return prov.keywords.some(kw => stateLower.includes(kw) || kw.includes(stateLower));
                });
                
                if (matched) {
                  console.log("Detected province via GPS + Reverse Geocode:", matched.name);
                  setSelectedRegion(matched.id);
                  localStorage.setItem("detected_province", matched.id);
                  return;
                }
              }
            }
          } catch (err) {
            console.warn("GPS Reverse geocoding failed, falling back to IP:", err);
          }
          // Fallback to IP if reverse geocoding did not yield a matched province
          detectProvinceByIP();
        },
        (error) => {
          if (error.code === 1 || error.code === error.PERMISSION_DENIED) {
            console.log("GPS access denied by user. Respecting preference, not falling back to IP.");
            alert(language === "en"
              ? "Please grant location access to this website in your browser settings."
              : "Mohon berikan izin akses lokasi untuk website ini pada pengaturan browser Anda.");
            return;
          }
          if (error.code === 2 || error.code === error.POSITION_UNAVAILABLE) {
            console.log("GPS device location is disabled.");
            alert(language === "en"
              ? "Location service is inactive. Please enable GPS or location services on your device."
              : "Layanan lokasi tidak aktif. Mohon aktifkan GPS atau layanan lokasi pada perangkat Anda.");
            return;
          }
          console.log("GPS access failed, falling back to IP:", error.message);
          detectProvinceByIP();
        },
        { enableHighAccuracy: false, timeout: 6000, maximumAge: 600000 }
      );
    } else {
      detectProvinceByIP();
    }
  }, []);

  // Listen to external province/location updates (e.g. from radar page or GPS detection)
  useEffect(() => {
    const syncProvince = () => {
      const cachedDetected = localStorage.getItem("detected_province");
      if (cachedDetected) {
        const matched = PROVINCES.find(p => p.id === cachedDetected);
        if (matched) {
          setSelectedRegion(matched.id);
        }
      }
    };

    window.addEventListener("storage", syncProvince);
    window.addEventListener("local-storage-update", syncProvince);
    return () => {
      window.removeEventListener("storage", syncProvince);
      window.removeEventListener("local-storage-update", syncProvince);
    };
  }, []);

  // Fetch open blood requests from Supabase
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setLoading(false);
      return;
    }
    
    async function loadRequests() {
      try {
        const { data, error } = await supabase
          .from('blood_requests')
          .select('id, hospital_name, blood_type, rhesus, bags_needed, urgency, created_at')
          .eq('status', 'open');
        
        if (error) throw error;
        setAllDbRequests(data || []);
      } catch (err) {
        console.error("Error fetching blood requests for homepage:", err);
      } finally {
        setLoading(false);
      }
    }

    loadRequests();

    const channel = supabase
      .channel('homepage-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blood_requests' }, () => {
        loadRequests();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Map and filter requests
  const mappedRequests: RequestSignal[] = useMemo(() => {
    return allDbRequests.map(item => ({
      id: item.id,
      hospitalName: item.hospital_name,
      bloodType: item.blood_type,
      rhesus: item.rhesus,
      bagsNeeded: item.bags_needed,
      urgency: item.urgency || "Sedang",
      timeAgoId: getTimeAgo(item.created_at, "id"),
      timeAgoEn: getTimeAgo(item.created_at, "en")
    }));
  }, [allDbRequests]);

  const selectedRegionObj = useMemo(() => {
    return PROVINCES.find(p => p.id === selectedRegion);
  }, [selectedRegion]);

  const filteredRequests = useMemo(() => {
    if (!selectedRegionObj) return [];
    return mappedRequests.filter(req => {
      const hospital = req.hospitalName.toLowerCase();
      return selectedRegionObj.keywords.some(kw => hospital.includes(kw));
    });
  }, [mappedRequests, selectedRegionObj]);

  // Precalculate counts of active requests for all provinces for O(1) render lookups
  const provinceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    PROVINCES.forEach(prov => {
      let count = 0;
      mappedRequests.forEach(req => {
        const hospital = req.hospitalName.toLowerCase();
        if (prov.keywords.some(kw => hospital.includes(kw))) {
          count++;
        }
      });
      counts[prov.id] = count;
    });
    return counts;
  }, [mappedRequests]);

  // Count active signals per province (in-memory for maximum performance)
  const getProvinceSignalCount = (province: RegionOption) => {
    return provinceCounts[province.id] || 0;
  };

  // Order provinces dynamically: selected/active province at the top, others sorted alphabetically
  const orderedProvinces = useMemo(() => {
    const sorted = [...PROVINCES].sort((a, b) => {
      const nameA = language === "en" ? a.nameEn : a.name;
      const nameB = language === "en" ? b.nameEn : b.name;
      return nameA.localeCompare(nameB);
    });
    const active = sorted.find(p => p.id === selectedRegion);
    const others = sorted.filter(p => p.id !== selectedRegion);
    return active ? [active, ...others] : sorted;
  }, [selectedRegion, language]);

  return (
    <section 
      data-no-translate="true"
      className="w-full py-20 bg-slate-50/50 dark:bg-slate-950/20 border-t border-slate-200 dark:border-slate-800/80 relative overflow-hidden"
    >
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-rose-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            {/* Custom Premium Dropdown Filter */}
            <div className="relative inline-block mb-4 z-[50]" ref={dropdownRef}>
              <button
                type="button"
                id="province-dropdown-trigger"
                onClick={() => setIsOpen(!isOpen)}
                className="group flex items-center gap-2.5 px-4.5 py-2.5 rounded-full bg-white dark:bg-slate-900/80 backdrop-blur-md text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200/80 dark:border-slate-800/80 shadow-md shadow-slate-100/50 dark:shadow-none hover:shadow-red-500/10 hover:border-red-400 dark:hover:border-red-900/60 transition-all duration-300 active:scale-95 cursor-pointer"
              >
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-450 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                <MapPin className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
                <span className="tracking-wide text-slate-700 dark:text-slate-350">
                  {selectedRegionObj ? getProvinceBadgeText(selectedRegionObj, language) : (language === "en" ? "Active SOS Signals" : "Sinyal SOS Aktif")}
                </span>
                {filteredRequests.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-black shadow-sm tracking-normal">
                    {filteredRequests.length}
                  </span>
                )}
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-650 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div 
                  id="province-dropdown-menu"
                  className="absolute left-0 mt-2 w-80 max-h-80 overflow-y-auto rounded-3xl border border-slate-250/50 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-2xl z-[100] py-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  <div className="px-4 py-2 text-[10px] font-extrabold text-slate-400 dark:text-slate-555 uppercase tracking-wider border-b border-slate-100 dark:border-slate-850 mb-1.5 flex items-center justify-between">
                    <span>{language === "en" ? "Select Province Region" : "Pilih Wilayah Provinsi"}</span>
                    <span>{language === "en" ? "SOS Signals" : "Sinyal SOS"}</span>
                  </div>
                  {orderedProvinces.map((prov) => {
                    const count = getProvinceSignalCount(prov);
                    const isSelected = prov.id === selectedRegion;
                    return (
                      <button
                        key={prov.id}
                        id={`province-option-${prov.id}`}
                        type="button"
                        onClick={() => {
                          setSelectedRegion(prov.id);
                          if (typeof window !== "undefined") {
                            localStorage.setItem("detected_province", prov.id);
                            window.dispatchEvent(new Event("local-storage-update"));
                          }
                          setIsOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-bold flex items-center justify-between transition-all duration-150 ${
                          isSelected
                            ? 'bg-red-500/10 dark:bg-red-500/5 text-primary border-l-4 border-red-500'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-red-500' : 'text-slate-400 dark:text-slate-650'}`} />
                          <span className="truncate">{language === "en" ? prov.nameEn : prov.name}</span>
                          {isSelected && (
                            <span className="inline-block px-1.5 py-0.5 rounded bg-red-500 text-white text-[8px] font-black uppercase tracking-wider scale-90 shrink-0">
                              {language === "en" ? "Active" : "Aktif"}
                            </span>
                          )}
                        </div>
                        {count > 0 ? (
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold shadow-sm shrink-0 ${
                            isSelected
                              ? 'bg-red-500 text-white'
                              : 'bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400'
                          }`}>
                            {count}
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-300 dark:text-slate-700 shrink-0">-</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {language === "en" ? (
                <>Blood Needs <span className="text-primary font-black">Emergency</span></>
              ) : (
                <>Kebutuhan Darah <span className="text-primary font-black">Darurat</span></>
              )}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xl">
              {language === "en"
                ? "Every second matters. The patients below are looking for ready donors. You can help save their lives now."
                : "Setiap detik sangat berarti. Pasien di bawah ini sedang mencari pendonor siaga. Anda dapat menyelamatkan hidup mereka sekarang."}
            </p>
          </div>
          <div>
            <button
              onClick={() => onCTA("/radar/donor")}
              className="group inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-rose-600 transition-colors cursor-pointer"
            >
              {language === "en" ? "View All Requests" : "Lihat Semua Permintaan"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="glass dark:bg-slate-900/60 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 animate-pulse flex flex-col justify-between h-full"
              >
                <div>
                  <div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded-lg mb-4" />
                  <div className="flex gap-4 mb-6">
                    <div className="w-14 h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded mt-4" />
                </div>
                <div className="w-full h-10 bg-slate-200 dark:bg-slate-800 rounded-xl mt-6" />
              </div>
            ))
          ) : filteredRequests.length === 0 ? (
            <div className="col-span-full py-12 text-center flex flex-col items-center justify-center bg-slate-100/50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-350 dark:border-slate-800 animate-in fade-in duration-300">
              <Heart className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">
                {language === "en" ? "No Emergency Signals Yet" : "Belum Ada Sinyal Darurat"}
              </h3>
              <p className="text-slate-500 dark:text-slate-500 text-sm max-w-sm mt-2">
                {language === "en"
                  ? "Currently, there are no patients in need of emergency blood donation in the selected region."
                  : "Saat ini tidak ada pasien yang membutuhkan donor darah darurat di wilayah terpilih."}
              </p>
            </div>
          ) : (
            filteredRequests.map((req) => (
              <div
                key={req.id}
                className="glass dark:bg-slate-900/60 rounded-3xl p-6 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:border-red-300/40 dark:hover:border-red-900/30 flex flex-col justify-between h-full group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {language === "en" ? req.timeAgoEn : req.timeAgoId}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        req.urgency === "Kritis"
                          ? "bg-red-500 text-white animate-pulse"
                          : req.urgency === "Tinggi"
                          ? "bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 border border-orange-200/50 dark:border-orange-900/30"
                          : "bg-yellow-100 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400 border border-yellow-200/50 dark:border-yellow-900/30"
                      }`}
                    >
                      {language === "en"
                        ? (req.urgency === "Kritis" ? "Critical" : req.urgency === "Tinggi" ? "High" : "Medium")
                        : (req.urgency === "Kritis" ? "Kritis" : req.urgency === "Tinggi" ? "Tinggi" : "Sedang")
                      }
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-950/30 dark:to-rose-900/20 border border-red-100 dark:border-red-900/40">
                      <span className="text-2xl font-black text-red-600 dark:text-red-400 leading-none">
                        {req.bloodType}
                      </span>
                      <span className="absolute bottom-1 right-2 text-xs font-black text-red-600 dark:text-red-400">
                        {req.rhesus}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {language === "en" ? "Blood Type" : "Tipe Darah"}
                      </h4>
                      <p className="text-sm font-black text-slate-800 dark:text-slate-200">
                        {language === "en" 
                          ? `Needs ${req.bagsNeeded} ${req.bagsNeeded === 1 ? "Bag" : "Bags"}` 
                          : `Butuh ${req.bagsNeeded} Kantong`
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400 text-sm mb-6">
                    <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                    <span className="font-semibold line-clamp-2">{req.hospitalName}</span>
                  </div>
                </div>

                <button
                  onClick={() => onCTA("/radar/donor")}
                  className="w-full py-3 bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-primary dark:hover:bg-primary transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_rgba(225,29,72,0.25)] cursor-pointer"
                >
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  {language === "en" ? "Help Now" : "Bantu Sekarang"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
