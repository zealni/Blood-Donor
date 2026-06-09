"use client";

import { HeartHandshake, AlertCircle, Check } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import type { RequestSignal } from "@/lib/types";

interface HandshakeModalProps {
  request: RequestSignal;
  isSuccess: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Anonymous handshake confirmation modal.
 * Shown when a donor chooses to help a blood request.
 */
export default function HandshakeModal({
  request,
  isSuccess,
  onConfirm,
  onCancel,
}: HandshakeModalProps) {
  const { language } = useLanguage();

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
      <div className="glass dark:bg-slate-900 p-8 rounded-[2.5rem] max-w-sm w-full border border-white/20 shadow-2xl space-y-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/40 text-primary flex items-center justify-center mx-auto">
          <HeartHandshake className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            {language === "en" ? "Anonymous Agreement" : "Persetujuan Anonim"}
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {language === "en" ? (
              <>
                You chose to help the request at{" "}
                <strong className="text-slate-700 dark:text-slate-300">
                  {request.hospital}
                </strong>{" "}
                with Blood Type{" "}
                <strong className="text-primary">{request.bloodType}</strong>.
              </>
            ) : (
              <>
                Anda memilih membantu permintaan di{" "}
                <strong className="text-slate-700 dark:text-slate-300">
                  {request.hospital}
                </strong>{" "}
                dengan Golongan Darah{" "}
                <strong className="text-primary">{request.bloodType}</strong>.
              </>
            )}
          </p>
          <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200/50 dark:border-orange-900/30 text-orange-600 dark:text-orange-400 p-3.5 rounded-2xl flex gap-2 text-[10px] font-semibold leading-relaxed text-left mt-2">
            <AlertCircle className="w-4.5 h-4.5 shrink-0" />
            <span>
              {language === "en"
                ? "Your contact and the requester's contact are protected. Pressing agree will open encrypted WhatsApp coordination."
                : "Kontak Anda dan pemohon dilindungi. Menekan setuju akan membuka koordinasi via WhatsApp secara terenkripsi."}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            disabled={isSuccess}
            onClick={onCancel}
            className="flex-1 py-3 border border-slate-200 dark:border-slate-700 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {language === "en" ? "Cancel" : "Batal"}
          </button>
          <button
            disabled={isSuccess}
            onClick={onConfirm}
            className="flex-1 py-3 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/95 transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-primary/20 disabled:opacity-50"
          >
            {isSuccess ? (
              <>
                <Check className="w-4.5 h-4.5 animate-bounce" />
                {language === "en" ? "Connecting..." : "Menghubungkan..."}
              </>
            ) : (
              <>{language === "en" ? "Agree & Contact" : "Setuju & Hubungi"}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
