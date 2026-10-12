"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Map,
  CalendarCheck,
  PenSquare,
  Mic,
  BookOpenCheck,
  ListChecks,
  Target,
  Library,
  ClipboardList,
  Settings,
  Sparkles,
} from "lucide-react";

const NAV = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/roadmap", label: "Roadmap", icon: Map },
  { href: "/daily", label: "Daily", icon: CalendarCheck },
  { href: "/writing", label: "Writing", icon: PenSquare },
  { href: "/speaking", label: "Speaking", icon: Mic },
  { href: "/vocabulary", label: "Vocab", icon: BookOpenCheck },
  { href: "/mistakes", label: "Mistakes", icon: ListChecks },
  { href: "/mock-tests", label: "Mock Tests", icon: Target },
  { href: "/diagnostic", label: "Diagnostic", icon: ClipboardList },
  { href: "/resources", label: "Resources", icon: Library },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <div className="sticky top-0 z-40 border-b border-white/5 bg-[#070a14]/95 backdrop-blur-xl lg:hidden">
      <div className="flex items-center gap-2 px-4 py-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <p className="font-[var(--font-display)] text-sm font-bold text-white">Band9 HQ</p>
      </div>
      <div className="scrollbar-thin flex gap-1.5 overflow-x-auto px-3 pb-3">
        {NAV.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "border-violet-500/40 bg-violet-500/15 text-violet-200"
                  : "border-white/10 text-slate-400 hover:text-slate-200",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
