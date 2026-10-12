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
  { href: "/daily", label: "Daily Tracker", icon: CalendarCheck },
  { href: "/writing", label: "Writing Lab", icon: PenSquare },
  { href: "/speaking", label: "Speaking Lab", icon: Mic },
  { href: "/vocabulary", label: "Vocabulary", icon: BookOpenCheck },
  { href: "/mistakes", label: "Mistake Log", icon: ListChecks },
  { href: "/mock-tests", label: "Mock Tests & Band Calc", icon: Target },
  { href: "/diagnostic", label: "Diagnostic Test", icon: ClipboardList },
  { href: "/resources", label: "Resource Library", icon: Library },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col border-r border-white/5 bg-[#070a14]/90 backdrop-blur-xl lg:flex">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-lg shadow-violet-900/40">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-[var(--font-display)] text-base font-bold leading-none text-white">Band9 HQ</p>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-slate-500">IELTS Command Center</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2 scrollbar-thin">
        {NAV.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-gradient-to-r from-violet-500/20 to-cyan-500/10 text-white ring-1 ring-inset ring-violet-500/30"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-100",
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active ? "text-violet-300" : "text-slate-500 group-hover:text-slate-300")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="m-3 rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/10 to-cyan-500/5 p-4">
        <p className="text-xs font-semibold text-violet-300">Target: Band 9.0</p>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
          Every feature here is free &amp; runs locally — no subscriptions. Add an OPENAI_API_KEY anytime to unlock live AI examiner mode.
        </p>
      </div>
    </aside>
  );
}
