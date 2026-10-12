"use client";

import { useMemo, useState, useTransition } from "react";
import { Card, Badge, Button, ProgressBar } from "@/components/ui";
import { SKILL_LABELS, formatDate, cn } from "@/lib/utils";
import { addPhase, addTask, toggleTaskStatus, deleteTask, deletePhase } from "@/app/actions/roadmap";
import { CheckCircle2, Circle, Clock, Plus, Trash2, X } from "lucide-react";

type Phase = { id: number; title: string; description: string | null; colorTag: string | null; orderIndex: number };
type Task = {
  id: number;
  phaseId: number | null;
  title: string;
  description: string | null;
  skill: string | null;
  status: string | null;
  priority: string | null;
  dueDate: string | null;
};

const COLOR_MAP: Record<string, string> = {
  violet: "border-violet-500/30 bg-violet-500/10",
  sky: "border-sky-500/30 bg-sky-500/10",
  emerald: "border-emerald-500/30 bg-emerald-500/10",
  amber: "border-amber-500/30 bg-amber-500/10",
  rose: "border-rose-500/30 bg-rose-500/10",
};

export function RoadmapBoard({ phases, tasks }: { phases: Phase[]; tasks: Task[] }) {
  const [isPending, startTransition] = useTransition();
  const [addingTaskFor, setAddingTaskFor] = useState<number | null>(null);
  const [addingPhase, setAddingPhase] = useState(false);

  const tasksByPhase = useMemo(() => {
    const map = new Map<number, Task[]>();
    for (const t of tasks) {
      const key = t.phaseId ?? -1;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return map;
  }, [tasks]);

  function cycleStatus(task: Task) {
    const next = task.status === "todo" ? "in_progress" : task.status === "in_progress" ? "done" : "todo";
    const fd = new FormData();
    fd.set("id", String(task.id));
    fd.set("nextStatus", next);
    startTransition(() => toggleTaskStatus(fd));
  }

  function removeTask(id: number) {
    const fd = new FormData();
    fd.set("id", String(id));
    startTransition(() => deleteTask(fd));
  }

  function removePhase(id: number) {
    const fd = new FormData();
    fd.set("id", String(id));
    startTransition(() => deletePhase(fd));
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {phases.map((phase) => {
          const phaseTasks = tasksByPhase.get(phase.id) || [];
          const done = phaseTasks.filter((t) => t.status === "done").length;
          const pct = phaseTasks.length ? Math.round((done / phaseTasks.length) * 100) : 0;
          return (
            <Card key={phase.id} className={cn("border", COLOR_MAP[phase.colorTag || "violet"])}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-[var(--font-display)] text-lg font-bold text-white">{phase.title}</h3>
                  {phase.description && <p className="mt-1 text-sm text-slate-400">{phase.description}</p>}
                </div>
                <button onClick={() => removePhase(phase.id)} className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-rose-300">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <ProgressBar value={pct} tone="violet" />
                <span className="whitespace-nowrap text-xs font-semibold text-slate-400">{done}/{phaseTasks.length}</span>
              </div>

              <div className="mt-4 space-y-2">
                {phaseTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 rounded-xl border border-white/5 bg-black/20 px-3 py-2.5">
                    <button onClick={() => cycleStatus(task)} disabled={isPending} className="shrink-0">
                      {task.status === "done" ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      ) : task.status === "in_progress" ? (
                        <Clock className="h-5 w-5 text-amber-400" />
                      ) : (
                        <Circle className="h-5 w-5 text-slate-600" />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className={cn("truncate text-sm font-medium", task.status === "done" ? "text-slate-500 line-through" : "text-slate-200")}>
                        {task.title}
                      </p>
                      {task.dueDate && <p className="text-xs text-slate-500">Due {formatDate(task.dueDate)}</p>}
                    </div>
                    <Badge tone="slate" className="shrink-0">{SKILL_LABELS[task.skill || "general"]}</Badge>
                    {task.priority === "high" && <Badge tone="rose" className="shrink-0">High</Badge>}
                    <button onClick={() => removeTask(task.id)} className="shrink-0 rounded-lg p-1.5 text-slate-600 hover:bg-white/5 hover:text-rose-300">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {addingTaskFor === phase.id ? (
                <form
                  action={(fd) => {
                    fd.set("phaseId", String(phase.id));
                    startTransition(() => addTask(fd));
                    setAddingTaskFor(null);
                  }}
                  className="mt-3 flex flex-col gap-2 rounded-xl border border-dashed border-white/15 p-3 sm:flex-row"
                >
                  <input name="title" required placeholder="New task title..." className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-violet-400 focus:outline-none" />
                  <select name="skill" className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 focus:border-violet-400 focus:outline-none">
                    {Object.entries(SKILL_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                  <input type="date" name="dueDate" className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 focus:border-violet-400 focus:outline-none" />
                  <Button type="submit">Add</Button>
                </form>
              ) : (
                <button
                  onClick={() => setAddingTaskFor(phase.id)}
                  className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-violet-300 hover:text-violet-200"
                >
                  <Plus className="h-3.5 w-3.5" /> Add task
                </button>
              )}
            </Card>
          );
        })}
      </div>

      {addingPhase ? (
        <Card>
          <form
            action={(fd) => {
              startTransition(() => addPhase(fd));
              setAddingPhase(false);
            }}
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <div className="flex-1">
              <label className="text-xs font-medium text-slate-400">Phase title</label>
              <input name="title" required className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 focus:border-violet-400 focus:outline-none" />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-slate-400">Description</label>
              <input name="description" className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 focus:border-violet-400 focus:outline-none" />
            </div>
            <select name="colorTag" className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 focus:border-violet-400 focus:outline-none">
              {Object.keys(COLOR_MAP).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <Button type="submit">Create phase</Button>
          </form>
        </Card>
      ) : (
        <Button variant="outline" onClick={() => setAddingPhase(true)}>
          <Plus className="h-4 w-4" /> Add a new phase
        </Button>
      )}
    </div>
  );
}
