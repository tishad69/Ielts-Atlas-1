"use client";

import { useMemo, useState, useTransition } from "react";
import { Card, Button, Badge, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { submitWriting, deleteWriting } from "@/app/actions/writing";
import { ChevronDown, ChevronUp, Trash2, Sparkles, Loader2 } from "lucide-react";

type Submission = {
  id: number;
  taskType: string | null;
  prompt: string | null;
  essayText: string;
  wordCount: number | null;
  bandOverall: number | null;
  bandTa: number | null;
  bandCc: number | null;
  bandLr: number | null;
  bandGr: number | null;
  feedback: unknown;
  rewriteText: string | null;
  engine: string | null;
  createdAt: Date | string;
};

function BandPill({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-white/10 bg-black/20 px-3 py-2">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <span className="font-[var(--font-display)] text-lg font-bold text-white">{value ?? "—"}</span>
    </div>
  );
}

export function WritingLab({ submissions, aiMode }: { submissions: Submission[]; aiMode: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [essay, setEssay] = useState("");
  const [taskType, setTaskType] = useState("task2");
  const [expanded, setExpanded] = useState<number | null>(submissions[0]?.id ?? null);

  const wordCount = useMemo(() => essay.trim().split(/\s+/).filter(Boolean).length, [essay]);
  const minWords = taskType === "task1" ? 150 : 250;

  function remove(id: number) {
    const fd = new FormData();
    fd.set("id", String(id));
    startTransition(() => deleteWriting(fd));
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-[var(--font-display)] text-lg font-bold text-white">Submit a new essay</h3>
          <Badge tone={aiMode ? "emerald" : "slate"}>
            {aiMode ? "AI Examiner (GPT) active" : "Free heuristic examiner"}
          </Badge>
        </div>
        <form
          action={(fd) => {
            startTransition(() => {
              submitWriting(fd).then(() => setEssay(""));
            });
          }}
          className="space-y-3"
        >
          <div className="flex flex-wrap gap-3">
            <select name="taskType" value={taskType} onChange={(e) => setTaskType(e.target.value)} className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 focus:border-violet-400 focus:outline-none">
              <option value="task1">Task 1 (Report/Letter)</option>
              <option value="task2">Task 2 (Essay)</option>
            </select>
            <input name="prompt" placeholder="Paste the question/prompt here (optional but improves scoring)" className="min-w-[260px] flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-violet-400 focus:outline-none" />
          </div>
          <textarea
            name="essayText"
            required
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            rows={10}
            placeholder="Paste or write your essay here..."
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm leading-relaxed text-slate-200 placeholder:text-slate-500 focus:border-violet-400 focus:outline-none"
          />
          <div className="flex items-center justify-between">
            <p className={`text-xs font-medium ${wordCount >= minWords ? "text-emerald-400" : "text-amber-400"}`}>
              {wordCount} words · minimum {minWords}
            </p>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Get my band score
            </Button>
          </div>
        </form>
      </Card>

      <div className="space-y-4">
        {submissions.length === 0 ? (
          <EmptyState title="No essays submitted yet" description="Your scored essays will appear here with full feedback." />
        ) : (
          submissions.map((s) => {
            const fb = (s.feedback as { strengths?: string[]; issues?: string[] }) || {};
            const isOpen = expanded === s.id;
            return (
              <Card key={s.id}>
                <button onClick={() => setExpanded(isOpen ? null : s.id)} className="flex w-full items-center justify-between gap-3 text-left">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/10 font-[var(--font-display)] text-lg font-bold text-white">
                      {s.bandOverall ?? "—"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">
                        {s.taskType === "task1" ? "Task 1" : "Task 2"} · {s.wordCount} words
                      </p>
                      <p className="text-xs text-slate-500">{formatDate(s.createdAt as string)} · {s.engine === "ai" ? "AI examiner" : "Heuristic examiner"}</p>
                    </div>
                  </div>
                  {isOpen ? <ChevronUp className="h-5 w-5 text-slate-500" /> : <ChevronDown className="h-5 w-5 text-slate-500" />}
                </button>

                {isOpen && (
                  <div className="mt-5 space-y-5 border-t border-white/5 pt-5">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <BandPill label="Task Achv." value={s.bandTa} />
                      <BandPill label="Coherence" value={s.bandCc} />
                      <BandPill label="Lexical" value={s.bandLr} />
                      <BandPill label="Grammar" value={s.bandGr} />
                    </div>

                    {s.prompt && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Prompt</p>
                        <p className="mt-1 text-sm text-slate-400">{s.prompt}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-400">Strengths</p>
                        <ul className="space-y-1.5">
                          {(fb.strengths || []).map((item: string, i: number) => (
                            <li key={i} className="text-sm text-slate-300">✓ {item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-rose-400">Issues to fix</p>
                        <ul className="space-y-1.5">
                          {(fb.issues || []).map((item: string, i: number) => (
                            <li key={i} className="text-sm text-slate-300">⚠ {item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-violet-300">Original vs. Band 9 Rewrite</p>
                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                          <p className="mb-2 text-xs font-semibold text-slate-500">Your original</p>
                          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-400">{s.essayText}</p>
                        </div>
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4">
                          <p className="mb-2 text-xs font-semibold text-emerald-400">Band 9 version</p>
                          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">{s.rewriteText}</p>
                        </div>
                      </div>
                    </div>

                    <button onClick={() => remove(s.id)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300">
                      <Trash2 className="h-3.5 w-3.5" /> Delete this submission
                    </button>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
