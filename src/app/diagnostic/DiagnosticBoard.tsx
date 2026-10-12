"use client";

import { useState, useTransition } from "react";
import { Card, Button, Badge, EmptyState } from "@/components/ui";
import { formatDate, cn } from "@/lib/utils";
import { submitDiagnostic } from "@/app/actions/diagnostic";
import { CheckCircle2 } from "lucide-react";

type QBank = Record<string, Array<{ q: string; options: string[]; answer: number }>>;
type Attempt = { id: number; skill: string; score: number; totalQuestions: number; bandEstimate: number | null; createdAt: Date | string };

const SKILLS = [
  { key: "grammar", label: "Grammar", emoji: "✍️" },
  { key: "vocabulary", label: "Vocabulary", emoji: "📚" },
  { key: "reading", label: "Reading Strategy", emoji: "📖" },
  { key: "listening", label: "Listening Strategy", emoji: "🎧" },
];

export function DiagnosticBoard({ questions, attempts }: { questions: QBank; attempts: Attempt[] }) {
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  const latestBySkill = new Map<string, Attempt>();
  for (const a of attempts) if (!latestBySkill.has(a.skill)) latestBySkill.set(a.skill, a);

  function startQuiz(skill: string) {
    setActiveSkill(skill);
    setAnswers({});
    setResult(null);
  }

  function submit() {
    if (!activeSkill) return;
    const fd = new FormData();
    fd.set("skill", activeSkill);
    (questions[activeSkill] || []).forEach((_, idx) => {
      fd.set(`answer-${idx}`, String(answers[idx] ?? -1));
    });
    startTransition(() => {
      submitDiagnostic(fd).then(() => {
        const correct = (questions[activeSkill] || []).filter((q, i) => answers[i] === q.answer).length;
        setResult(`You scored ${correct}/${(questions[activeSkill] || []).length}`);
      });
    });
  }

  const activeQuestions = activeSkill ? questions[activeSkill] || [] : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {SKILLS.map((s) => {
          const latest = latestBySkill.get(s.key);
          return (
            <Card key={s.key} hover className="cursor-pointer" >
              <button onClick={() => startQuiz(s.key)} className="w-full text-left">
                <p className="text-2xl">{s.emoji}</p>
                <p className="mt-2 text-sm font-semibold text-slate-200">{s.label}</p>
                <p className="mt-1 text-xs text-slate-500">{(questions[s.key] || []).length} questions</p>
                {latest && <Badge tone="emerald" className="mt-2">Last: Band {latest.bandEstimate}</Badge>}
              </button>
            </Card>
          );
        })}
      </div>

      {activeSkill && (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-[var(--font-display)] text-lg font-bold text-white">
              {SKILLS.find((s) => s.key === activeSkill)?.emoji} {SKILLS.find((s) => s.key === activeSkill)?.label} quiz
            </h3>
            <button onClick={() => setActiveSkill(null)} className="text-xs text-slate-500 hover:text-slate-300">Close</button>
          </div>

          <div className="space-y-5">
            {activeQuestions.map((q, idx) => (
              <div key={idx}>
                <p className="text-sm font-medium text-slate-200">{idx + 1}. {q.q}</p>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {q.options.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      onClick={() => setAnswers((prev) => ({ ...prev, [idx]: oIdx }))}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                        answers[idx] === oIdx ? "border-violet-400 bg-violet-500/15 text-violet-100" : "border-white/10 bg-black/20 text-slate-300 hover:border-white/20",
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Button onClick={submit} disabled={isPending || Object.keys(answers).length < activeQuestions.length}>
              Submit answers
            </Button>
            {result && <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-300"><CheckCircle2 className="h-4 w-4" /> {result}</span>}
          </div>
        </Card>
      )}

      <Card>
        <h3 className="mb-4 font-[var(--font-display)] text-lg font-bold text-white">Attempt history</h3>
        {attempts.length === 0 ? (
          <EmptyState title="No attempts yet" description="Take a quiz above to see your estimated band." />
        ) : (
          <div className="space-y-2">
            {attempts.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-2.5 text-sm">
                <span className="capitalize text-slate-300">{a.skill}</span>
                <span className="text-slate-500">{a.score}/{a.totalQuestions}</span>
                <span className="font-semibold text-emerald-300">Band {a.bandEstimate}</span>
                <span className="text-xs text-slate-600">{formatDate(a.createdAt as string)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
