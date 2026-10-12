"use client";

import { useEffect, useState } from "react";

function getParts(target: Date) {
  const now = new Date().getTime();
  const diff = Math.max(0, target.getTime() - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds, isPast: diff === 0 };
}

export function Countdown({ examDate }: { examDate: string | null }) {
  const target = examDate ? new Date(examDate) : null;
  const [parts, setParts] = useState(() => (target ? getParts(target) : null));

  useEffect(() => {
    if (!target) return;
    const id = setInterval(() => setParts(getParts(target)), 1000);
    return () => clearInterval(id);
  }, [examDate]);

  if (!target || !parts) {
    return <p className="text-sm text-slate-400">Set your exam date in Settings to start the live countdown.</p>;
  }

  const units = [
    { label: "Days", value: parts.days },
    { label: "Hours", value: parts.hours },
    { label: "Min", value: parts.minutes },
    { label: "Sec", value: parts.seconds },
  ];

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {units.map((u, idx) => (
        <div key={u.label} className="flex items-center gap-2 sm:gap-3">
          <div className="flex min-w-[64px] flex-col items-center rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 sm:min-w-[76px] sm:px-4 sm:py-3">
            <span className="font-[var(--font-display)] text-2xl font-bold tabular-nums text-white sm:text-3xl">
              {String(u.value).padStart(2, "0")}
            </span>
            <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{u.label}</span>
          </div>
          {idx < units.length - 1 && <span className="text-xl font-bold text-slate-600">:</span>}
        </div>
      ))}
    </div>
  );
}
