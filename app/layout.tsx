import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { LanguageProvider } from "@/components/LanguageProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://blood-donor-six.vercel.app"),
  title: "BloodConnect - Donor Darah Darurat",
  description: "Sistem koordinasi donor darah darurat secara waktu nyata.",
  openGraph: {
    title: "BloodConnect - Donor Darah Darurat",
    description: "Temukan & Bantu Mereka yang Membutuhkan Darah Saat Ini Juga.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body 
        className={`${inter.variable} font-sans bg-slate-50 dark:bg-slate-950`}
        suppressHydrationWarning
      >
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
