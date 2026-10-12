import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";

const sans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans-loaded", display: "swap" });
const display = Sora({ subsets: ["latin"], variable: "--font-display-loaded", display: "swap" });

export const metadata: Metadata = {
  title: "Band9 HQ — Personal IELTS Command Center",
  description:
    "A fully personal, zero-cost IELTS preparation command center: roadmap, countdown, writing & speaking AI coach, vocabulary, mistake log, and Cambridge band calculator.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body className="bg-mesh min-h-screen antialiased" style={{ fontFamily: "var(--font-sans-loaded)" }}>
        <style>{`:root { --font-display: var(--font-display-loaded); }`}</style>
        <Sidebar />
        <MobileNav />
        <div className="lg:pl-[260px]">
          <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
          <footer className="px-4 pb-10 pt-4 text-center text-xs text-slate-600 sm:px-6 lg:px-10">
            Built for one mission: Band 9.0 · {new Date().getFullYear()}
          </footer>
        </div>
      </body>
    </html>
  );
}
