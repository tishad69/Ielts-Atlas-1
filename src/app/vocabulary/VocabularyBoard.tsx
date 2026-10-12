"use client";

import { useMemo, useState, useTransition } from "react";
import { Card, Button, Badge, EmptyState, ProgressBar } from "@/components/ui";
import { cn } from "@/lib/utils";
import { addVocab, deleteVocab, reviewVocab } from "@/app/actions/vocabulary";
import { Plus, Trash2, Check, X, Layers } from "lucide-react";

type Word = {
  id: number;
  word: string;
  meaning: string;
  banglaMeaning: string | null;
  example: string | null;
  synonym: string | null;
  partOfSpeech: string | null;
  topic: string | null;
};
type Progress = { vocabId: number; box: number | null; nextReviewDate: string | null; timesCorrect: number | null; timesWrong: number | null };

export function VocabularyBoard({ words, progress }: { words: Word[]; progress: Progress[] }) {
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<"review" | "library" | "add">("review");
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [topicFilter, setTopicFilter] = useState("all");

  const today = new Date().toISOString().slice(0, 10);
  const progressMap = useMemo(() => new Map(progress.map((p) => [p.vocabId, p])), [progress]);

  const dueWords = useMemo(
    () => words.filter((w) => {
      const p = progressMap.get(w.id);
      if (!p) return true;
      return !p.nextReviewDate || p.nextReviewDate <= today;
    }),
    [words, progressMap, today],
  );

  const topics = useMemo(() => Array.from(new Set(words.map((w) => w.topic || "general"))), [words]);
  const filteredWords = topicFilter === "all" ? words : words.filter((w) => (w.topic || "general") === topicFilter);

  const avgBox = useMemo(() => {
    if (!progress.length) return 0;
    return progress.reduce((a, p) => a + (p.box || 1), 0) / progress.length;
  }, [progress]);

  const current = dueWords[cardIdx % Math.max(dueWords.length, 1)];

  function review(correct: boolean) {
    if (!current) return;
    const fd = new FormData();
    fd.set("vocabId", String(current.id));
    fd.set("correct", String(correct));
    startTransition(() => reviewVocab(fd));
    setFlipped(false);
    setCardIdx((i) => i + 1);
  }

  function remove(id: number) {
    const fd = new FormData();
    fd.set("id", String(id));
    startTransition(() => deleteVocab(fd));
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card><p className="text-xs text-slate-500">Total words</p><p className="font-[var(--font-display)] text-2xl font-bold text-white">{words.length}</p></Card>
        <Card><p className="text-xs text-slate-500">Due today</p><p className="font-[var(--font-display)] text-2xl font-bold text-amber-300">{dueWords.length}</p></Card>
        <Card>
          <p className="text-xs text-slate-500">Mastery level</p>
          <div className="mt-2"><ProgressBar value={(avgBox / 5) * 100} tone="emerald" /></div>
        </Card>
      </div>

      <div className="flex gap-2">
        {(["review", "library", "add"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} className={cn("rounded-full px-4 py-2 text-sm font-semibold capitalize transition-colors", mode === m ? "bg-violet-500/20 text-violet-200 ring-1 ring-violet-500/30" : "text-slate-400 hover:text-slate-200")}>
            {m === "review" ? "🔁 Review" : m === "library" ? "📚 Library" : "➕ Add word"}
          </button>
        ))}
      </div>

      {mode === "review" && (
        <Card className="mx-auto max-w-xl">
          {!current ? (
            <EmptyState title="Nothing due right now 🎉" description="Come back later or browse the library." />
          ) : (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <Badge tone="violet">{current.topic || "general"}</Badge>
                <span className="text-xs text-slate-500">{(cardIdx % dueWords.length) + 1} / {dueWords.length}</span>
              </div>
              <button
                onClick={() => setFlipped((f) => !f)}
                className="flex min-h-[220px] w-full flex-col items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/10 to-cyan-500/5 p-6 text-center transition-transform hover:scale-[1.01]"
              >
                {!flipped ? (
                  <>
                    <Layers className="mb-3 h-6 w-6 text-violet-300" />
                    <p className="font-[var(--font-display)] text-3xl font-bold text-white">{current.word}</p>
                    <p className="mt-2 text-xs italic text-slate-500">{current.partOfSpeech}</p>
                    <p className="mt-4 text-xs text-slate-500">Tap to reveal meaning</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-semibold text-emerald-300">{current.meaning}</p>
                    {current.banglaMeaning && <p className="mt-1 text-sm text-slate-400">{current.banglaMeaning}</p>}
                    {current.synonym && <p className="mt-2 text-xs text-slate-500">Synonyms: {current.synonym}</p>}
                    {current.example && <p className="mt-3 max-w-md text-sm italic text-slate-400">&quot;{current.example}&quot;</p>}
                  </>
                )}
              </button>

              {flipped && (
                <div className="mt-4 flex gap-3">
                  <Button variant="danger" className="flex-1" onClick={() => review(false)} disabled={isPending}>
                    <X className="h-4 w-4" /> Didn&apos;t know
                  </Button>
                  <Button className="flex-1" onClick={() => review(true)} disabled={isPending}>
                    <Check className="h-4 w-4" /> Knew it
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {mode === "library" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setTopicFilter("all")} className={cn("rounded-full border px-3 py-1 text-xs font-medium", topicFilter === "all" ? "border-violet-400 bg-violet-500/15 text-violet-200" : "border-white/10 text-slate-400")}>All</button>
            {topics.map((t) => (
              <button key={t} onClick={() => setTopicFilter(t)} className={cn("rounded-full border px-3 py-1 text-xs font-medium", topicFilter === t ? "border-violet-400 bg-violet-500/15 text-violet-200" : "border-white/10 text-slate-400")}>{t}</button>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredWords.map((w) => {
              const p = progressMap.get(w.id);
              return (
                <Card key={w.id} hover className="relative">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-[var(--font-display)] text-base font-bold text-white">{w.word}</p>
                      <p className="text-xs italic text-slate-500">{w.partOfSpeech}</p>
                    </div>
                    <button onClick={() => remove(w.id)} className="rounded-lg p-1 text-slate-600 hover:text-rose-300"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">{w.meaning}</p>
                  {w.banglaMeaning && <p className="text-xs text-slate-500">{w.banglaMeaning}</p>}
                  {w.example && <p className="mt-2 text-xs italic text-slate-500">&quot;{w.example}&quot;</p>}
                  <div className="mt-3 flex items-center justify-between">
                    <Badge tone="slate">{w.topic}</Badge>
                    <span className="text-[10px] text-slate-500">Box {p?.box || 1}/5</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {mode === "add" && (
        <Card className="max-w-2xl">
          <form
            action={(fd) => {
              startTransition(() => addVocab(fd));
            }}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
          >
            <input name="word" required placeholder="Word *" className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-violet-400 focus:outline-none" />
            <input name="partOfSpeech" placeholder="Part of speech" className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-violet-400 focus:outline-none" />
            <input name="meaning" required placeholder="Meaning (English) *" className="sm:col-span-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-violet-400 focus:outline-none" />
            <input name="banglaMeaning" placeholder="বাংলা অর্থ" className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-violet-400 focus:outline-none" />
            <input name="synonym" placeholder="Synonyms" className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-violet-400 focus:outline-none" />
            <input name="example" placeholder="Example sentence" className="sm:col-span-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-violet-400 focus:outline-none" />
            <input name="topic" placeholder="Topic (e.g. Environment)" className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-violet-400 focus:outline-none" />
            <Button type="submit"><Plus className="h-4 w-4" /> Add word</Button>
          </form>
        </Card>
      )}
    </div>
  );
}
