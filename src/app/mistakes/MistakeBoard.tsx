"use client";

import { useMemo, useState, useTransition } from "react";
import { Card, Button, Badge, EmptyState } from "@/components/ui";
import { SKILL_LABELS, formatDate, cn } from "@/lib/utils";
import { addMistake, toggleMistakeResolved, deleteMistake } from "@/app/actions/mistakes";
import { Plus, Trash2, CheckCircle2, Circle } from "lucide-react";

type Mistake = {
  id: number;
  skill: string;
  questionType: string | null;
  description: string;
  correction: string | null;
  source: string | null;
  resolved: boolean | null;
  createdAt: Date | string;
};

export function MistakeBoard({ rows }: { rows: Mistake[] }) {
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<"all" | "open" | "resolved">("open");

  const filtered = useMemo(() => {
    if (filter === "open") return rows.filter((r) => !r.resolved);
    if (filter === "resolved") return rows.filter((r) => r.resolved);
    return rows;
  }, [rows, filter]);

  function toggle(r: Mistake) {
    const fd = new FormData();
    fd.set("id", String(r.id));
    fd.set("resolved", String(Boolean(r.resolved)));
    startTransition(() => toggleMistakeResolved(fd));
  }

  function remove(id: number) {
    const fd = new FormData();
    fd.set("id", String(id));
    startTransition(() => deleteMistake(fd));
  }

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="mb-3 font-[var(--font-display)] text-lg font-bold text-white">Log a new mistake</h3>
        <form
          action={(fd) => startTransition(() => addMistake(fd))}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          <select name="skill" className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 focus:border-violet-400 focus:outline-none">
            {Object.entries(SKILL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <input name="questionType" placeholder="Question type (e.g. T/F/NG)" className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-violet-400 focus:outline-none" />
          <input name="source" placeholder="Source (e.g. Cambridge 15 Test 2)" className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-violet-400 focus:outline-none" />
          <div className="lg:col-span-1" />
          <input name="description" required placeholder="What went wrong? *" className="sm:col-span-2 lg:col-span-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-violet-400 focus:outline-none" />
          <input name="correction" placeholder="Correct approach / rule" className="sm:col-span-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-violet-400 focus:outline-none" />
          <Button type="submit"><Plus className="h-4 w-4" /> Add to log</Button>
        </form>
      </Card>

      <div className="flex gap-2">
        {(["open", "resolved", "all"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn("rounded-full px-4 py-2 text-sm font-semibold capitalize transition-colors", filter === f ? "bg-violet-500/20 text-violet-200 ring-1 ring-violet-500/30" : "text-slate-400 hover:text-slate-200")}>
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <EmptyState title="Nothing here" description="Great — either you're mistake-free or haven't logged any yet." />
        ) : (
          filtered.map((m) => (
            <Card key={m.id} className={cn(m.resolved && "opacity-60")}>
              <div className="flex items-start gap-3">
                <button onClick={() => toggle(m)} disabled={isPending} className="mt-0.5 shrink-0">
                  {m.resolved ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <Circle className="h-5 w-5 text-slate-600" />}
                </button>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="slate">{SKILL_LABELS[m.skill]}</Badge>
                    {m.questionType && <Badge tone="amber">{m.questionType}</Badge>}
                    {m.source && <span className="text-xs text-slate-500">{m.source}</span>}
                    <span className="ml-auto text-xs text-slate-600">{formatDate(m.createdAt as string)}</span>
                  </div>
                  <p className={cn("mt-2 text-sm text-slate-200", m.resolved && "line-through")}>{m.description}</p>
                  {m.correction && <p className="mt-1 text-sm text-emerald-300/90">→ {m.correction}</p>}
                </div>
                <button onClick={() => remove(m.id)} className="shrink-0 rounded-lg p-1.5 text-slate-600 hover:bg-white/5 hover:text-rose-300">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
