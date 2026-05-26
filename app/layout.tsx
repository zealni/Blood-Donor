import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "BloodConnect - Emergency Blood Donation",
  description: "Real-time emergency blood donation coordination system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className={`${inter.variable} font-sans bg-slate-50 dark:bg-slate-950`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
