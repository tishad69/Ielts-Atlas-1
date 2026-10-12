"use client";

import { useMemo, useState, useTransition } from "react";
import { Card, Button, Badge, SectionHeading, EmptyState } from "@/components/ui";
import { SKILL_LABELS, formatDate } from "@/lib/utils";
import { addDailyLog, deleteDailyLog } from "@/app/actions/dailyLogs";
import { Trash2 } from "lucide-react";

type Log = {
  id: number;
  logDate: string;
  skill: string;
  minutesSpent: number | null;
  notes: string | null;
  mood: string | null;
};

const MOODS = [
  { value: "great", emoji: "🔥", label: "Great" },
  { value: "good", emoji: "🙂", label: "Good" },
  { value: "okay", emoji: "😐", label: "Okay" },
  { value: "tough", emoji: "😓", label: "Tough" },
];

export function DailyBoard({ logs }: { logs: Log[] }) {
  const [isPending, startTransition] = useTransition();
  const [mood, setMood] = useState("good");

  const totalsBySkill = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const l of logs) totals[l.skill] = (totals[l.skill] || 0) + (l.minutesSpent || 0);
    return totals;
  }, [logs]);

  const totalMinutes = Object.values(totalsBySkill).reduce((a, b) => a + b, 0);

  function remove(id: number) {
    const fd = new FormData();
    fd.set("id", String(id));
    startTransition(() => deleteDailyLog(fd));
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <Card>
          <p className="text-xs text-slate-500">Total hours</p>
          <p className="font-[var(--font-display)] text-2xl font-bold text-white">{(totalMinutes / 60).toFixed(1)}h</p>
        </Card>
        {Object.entries(SKILL_LABELS)
          .filter(([k]) => ["listening", "reading", "writing", "speaking"].includes(k))
          .map(([k, label]) => (
            <Card key={k}>
              <p className="text-xs text-slate-500">{label}</p>
              <p className="font-[var(--font-display)] text-2xl font-bold text-white">{(((totalsBySkill[k] || 0)) / 60).toFixed(1)}h</p>
            </Card>
          ))}
      </div>

      <Card>
        <SectionHeading title="Log today's session" />
        <form
          action={(fd) => {
            fd.set("mood", mood);
            startTransition(() => addDailyLog(fd));
          }}
          className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5"
        >
          <div>
            <label className="text-xs font-medium text-slate-400">Date</label>
            <input type="date" name="logDate" defaultValue={new Date().toISOString().slice(0, 10)} className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 focus:border-violet-400 focus:outline-none" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400">Skill</label>
            <select name="skill" className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 focus:border-violet-400 focus:outline-none">
              {Object.entries(SKILL_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400">Minutes</label>
            <input type="number" name="minutesSpent" min={1} defaultValue={30} required className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 focus:border-violet-400 focus:outline-none" />
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="text-xs font-medium text-slate-400">Mood</label>
            <div className="mt-1 flex gap-1">
              {MOODS.map((m) => (
                <button
                  type="button"
                  key={m.value}
                  onClick={() => setMood(m.value)}
                  className={`flex-1 rounded-lg border px-2 py-2 text-lg transition-colors ${mood === m.value ? "border-violet-400 bg-violet-500/15" : "border-white/10 bg-black/30"}`}
                  title={m.label}
                >
                  {m.emoji}
                </button>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2 lg:col-span-5">
            <label className="text-xs font-medium text-slate-400">Notes</label>
            <input name="notes" placeholder="What did you cover today?" className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-violet-400 focus:outline-none" />
          </div>
          <div className="sm:col-span-2 lg:col-span-5">
            <Button type="submit" disabled={isPending}>Save log</Button>
          </div>
        </form>
      </Card>

      <Card>
        <SectionHeading title="History" />
        <div className="mt-4 space-y-2">
          {logs.length === 0 ? (
            <EmptyState title="No logs yet" description="Add your first study session above." />
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
                <span className="text-lg">{MOODS.find((m) => m.value === log.mood)?.emoji || "📘"}</span>
                <div className="min-w-[90px] text-xs text-slate-500">{formatDate(log.logDate)}</div>
                <Badge tone="slate">{SKILL_LABELS[log.skill]}</Badge>
                <span className="text-sm font-semibold text-slate-200">{log.minutesSpent} min</span>
                {log.notes && <span className="flex-1 truncate text-sm text-slate-400">{log.notes}</span>}
                <button onClick={() => remove(log.id)} className="ml-auto rounded-lg p-1.5 text-slate-600 hover:bg-white/5 hover:text-rose-300">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
