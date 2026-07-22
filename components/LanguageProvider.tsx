"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { translateValue, applyLanguage } from '@/lib/i18n/translator';


export type AppLanguage = "id" | "en";

interface LanguageContextValue {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>("id");

  const setLanguage = (nextLanguage: AppLanguage) => {
    setLanguageState(nextLanguage);
    localStorage.setItem("bloodconnect_language", nextLanguage);
  };

  useEffect(() => {
    const storedLanguage = localStorage.getItem("bloodconnect_language");
    if (storedLanguage === "en" || storedLanguage === "id") {
      setLanguageState(storedLanguage);
    }
  }, []);

  useEffect(() => {
    applyLanguage(language);

    const originalAlert = window.alert;
    window.alert = (message?: any) => {
      if (typeof message === "string") {
        originalAlert(translateValue(message, language));
      } else {
        originalAlert(message);
      }
    };

    let frame = 0;
    const observer = new MutationObserver((mutations) => {
      // Skip scheduling translation if all mutations occurred inside data-no-translate elements
      const hasOutsideMutation = mutations.some((mutation) => {
        let node: Node | null = mutation.target;
        while (node && node !== document.body) {
          if (node.nodeType === 1) {
            const el = node as Element;
            if (el.getAttribute("data-no-translate") === "true") {
              return false;
            }
          }
          node = node.parentNode;
        }
        return true;
      });

      if (!hasOutsideMutation) return;

      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => applyLanguage(language));
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["placeholder", "title", "aria-label"],
    });

    return () => {
      window.alert = originalAlert;
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage }), [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}
