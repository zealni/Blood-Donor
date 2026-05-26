"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Leaflet requires the window object, which is not available during Next.js Server-Side Rendering (SSR).
// We must dynamically import it with ssr: false.
const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-square md:aspect-[4/3] bg-slate-100 dark:bg-slate-900 rounded-[2rem] border-4 border-white dark:border-slate-800 shadow-xl flex flex-col items-center justify-center text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
      <p className="font-semibold animate-pulse text-sm">Memuat Peta Interaktif...</p>
    </div>
  ),
});

export default function LiveSignalMap() {
  return (
    <div className="relative w-full aspect-square md:aspect-[4/3]">
      <MapComponent preview={true} />
    </div>
  );
}
