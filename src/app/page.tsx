import { db } from "@/db";
import {
  examProfile,
  roadmapTasks,
  roadmapPhases,
  mistakes,
  vocabulary,
  vocabularyProgress,
  writingSubmissions,
  speakingSessions,
  mockTests,
  dailyLogs,
} from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { ensureSeeded } from "@/lib/ensureSeed";
import { Card, SectionHeading, StatCard, ProgressBar, Badge, EmptyState } from "@/components/ui";
import { Countdown } from "@/components/Countdown";
import { BandTrendChart } from "@/components/BandTrendChart";
import { formatDate, SKILL_LABELS } from "@/lib/utils";
import Link from "next/link";
import { CalendarClock, Flame, ListChecks, BookOpenCheck, Target, Sparkles, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await ensureSeeded();

  const [profile] = await db.select().from(examProfile).limit(1);
  const allTasks = await db.select().from(roadmapTasks);
  const phases = await db.select().from(roadmapPhases).orderBy(roadmapPhases.orderIndex);
  const openMistakes = await db.select().from(mistakes).where(eq(mistakes.resolved, false));
  const vocabTotal = await db.select().from(vocabulary);
  const vocabProgressRows = await db.select().from(vocabularyProgress);
  const today = new Date().toISOString().slice(0, 10);
  const dueVocab = vocabTotal.filter((v) => {
    const prog = vocabProgressRows.find((p) => p.vocabId === v.id);
    if (!prog) return true;
    return !prog.nextReviewDate || prog.nextReviewDate <= today;
  });

  const recentWriting = await db.select().from(writingSubmissions).orderBy(desc(writingSubmissions.createdAt)).limit(8);
  const recentSpeaking = await db.select().from(speakingSessions).orderBy(desc(speakingSessions.createdAt)).limit(8);
  const recentMockTests = await db.select().from(mockTests).orderBy(desc(mockTests.createdAt)).limit(5);

  const streakRows = await db
    .select({ logDate: dailyLogs.logDate })
    .from(dailyLogs)
    .groupBy(dailyLogs.logDate)
    .orderBy(desc(dailyLogs.logDate));

  let streak = 0;
  const dateSet = new Set(streakRows.map((r) => r.logDate));
  const cursor = new Date();
  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    if (dateSet.has(key)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else break;
  }

  const doneTasks = allTasks.filter((t) => t.status === "done").length;
  const totalTasks = allTasks.length || 1;
  const overallProgress = Math.round((doneTasks / totalTasks) * 100);

  const upcomingTasks = allTasks
    .filter((t) => t.status !== "done")
    .sort((a, b) => (a.dueDate && b.dueDate ? a.dueDate.localeCompare(b.dueDate) : 0))
    .slice(0, 6);

  const writingTrend = [...recentWriting]
    .reverse()
    .map((w, i) => ({ label: `#${i + 1}`, band: w.bandOverall || 0 }));
  const speakingTrend = [...recentSpeaking]
    .reverse()
    .map((s, i) => ({ label: `#${i + 1}`, band: s.bandOverall || 0 }));

  const skillBands = {
    listening: profile?.currentListening || 0,
    reading: profile?.currentReading || 0,
    writing: profile?.currentWriting || recentWriting[0]?.bandOverall || 0,
    speaking: profile?.currentSpeaking || recentSpeaking[0]?.bandOverall || 0,
  };
  const overallBand =
    Math.round(((skillBands.listening + skillBands.reading + skillBands.writing + skillBands.speaking) / 4) * 2) / 2;

  const currentPhase = phases.find((p) =>
    allTasks.some((t) => t.phaseId === p.id && t.status !== "done"),
  ) || phases[0];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <Card className="relative overflow-hidden !p-0">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl float-slow" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="pulse-dot absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
              </span>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Mission: Band {profile?.targetBand ?? 9}.0</p>
            </div>
            <h1 className="font-[var(--font-display)] text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Hey {profile?.fullName || "there"}, let&apos;s build your <span className="text-gradient">Band 9</span> today.
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-400">
              Exam day: <span className="font-semibold text-slate-200">{formatDate(profile?.examDate)}</span> · Every tool
              below is free, personal, and built around your exact plan — Munzareen&apos;s book → Engnovate Cambridge
              1-21 → full mocks.
            </p>
          </div>
          <div>
            <Countdown examDate={profile?.examDate ?? null} />
          </div>
        </div>
      </Card>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Overall Est. Band" value={overallBand ? overallBand.toFixed(1) : "—"} sub={`Target ${profile?.targetBand ?? 9}.0`} tone="violet" icon={<Sparkles className="h-5 w-5" />} />
        <StatCard label="Listening" value={skillBands.listening ? skillBands.listening.toFixed(1) : "—"} tone="cyan" icon={<Target className="h-5 w-5" />} />
        <StatCard label="Reading" value={skillBands.reading ? skillBands.reading.toFixed(1) : "—"} tone="emerald" icon={<Target className="h-5 w-5" />} />
        <StatCard label="Writing" value={skillBands.writing ? skillBands.writing.toFixed(1) : "—"} tone="amber" icon={<Target className="h-5 w-5" />} />
        <StatCard label="Speaking" value={skillBands.speaking ? skillBands.speaking.toFixed(1) : "—"} tone="rose" icon={<Target className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Roadmap progress */}
        <Card className="lg:col-span-2">
          <SectionHeading eyebrow="Study Roadmap" title="Overall Progress" description={currentPhase ? `Current focus: ${currentPhase.title}` : undefined} />
          <div className="mt-4 flex items-center gap-4">
            <ProgressBar value={overallProgress} tone="violet" />
            <span className="whitespace-nowrap text-sm font-semibold text-slate-300">{overallProgress}%</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">{doneTasks} / {allTasks.length} tasks complete</p>

          <div className="mt-6 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Up next</p>
            {upcomingTasks.length === 0 ? (
              <EmptyState title="All caught up!" description="No pending roadmap tasks." />
            ) : (
              upcomingTasks.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-200">{t.title}</p>
                    <p className="text-xs text-slate-500">{t.dueDate ? `Due ${formatDate(t.dueDate)}` : "No due date"}</p>
                  </div>
                  <Badge tone="slate">{SKILL_LABELS[t.skill || "general"]}</Badge>
                </div>
              ))
            )}
          </div>
          <Link href="/roadmap" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-violet-300 hover:text-violet-200">
            Open full roadmap <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Card>

        {/* Quick widgets */}
        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-orange-500/15 p-2.5 text-orange-300">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Study streak</p>
                <p className="font-[var(--font-display)] text-2xl font-bold text-white">{streak} day{streak === 1 ? "" : "s"}</p>
              </div>
            </div>
            <Link href="/daily" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-violet-300 hover:text-violet-200">
              Log today <ArrowRight className="h-3 w-3" />
            </Link>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-cyan-500/15 p-2.5 text-cyan-300">
                <BookOpenCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Vocabulary due for review</p>
                <p className="font-[var(--font-display)] text-2xl font-bold text-white">{dueVocab.length}</p>
              </div>
            </div>
            <Link href="/vocabulary" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-violet-300 hover:text-violet-200">
              Review now <ArrowRight className="h-3 w-3" />
            </Link>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-rose-500/15 p-2.5 text-rose-300">
                <ListChecks className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Open mistakes to fix</p>
                <p className="font-[var(--font-display)] text-2xl font-bold text-white">{openMistakes.length}</p>
              </div>
            </div>
            <Link href="/mistakes" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-violet-300 hover:text-violet-200">
              Review log <ArrowRight className="h-3 w-3" />
            </Link>
          </Card>
        </div>
      </div>

      {/* Trends */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <SectionHeading eyebrow="Writing Lab" title="Band trend" description="Your last submissions, overall band" />
          <div className="mt-4">
            <BandTrendChart data={writingTrend} color="#f59e0b" />
          </div>
        </Card>
        <Card>
          <SectionHeading eyebrow="Speaking Lab" title="Band trend" description="Your last sessions, overall band" />
          <div className="mt-4">
            <BandTrendChart data={speakingTrend} color="#fb7185" />
          </div>
        </Card>
      </div>

      {/* Mock tests */}
      <Card>
        <SectionHeading
          eyebrow="Mock Tests"
          title="Recent Cambridge / Engnovate results"
          action={
            <Link href="/mock-tests" className="inline-flex items-center gap-1 text-sm font-semibold text-violet-300 hover:text-violet-200">
              Log a new test <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        />
        {recentMockTests.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="No mock tests logged yet" description="Add your first Engnovate or Cambridge test score." />
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-slate-500">
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Source</th>
                  <th className="pb-2 font-medium">Skill</th>
                  <th className="pb-2 font-medium">Score</th>
                  <th className="pb-2 font-medium">Band</th>
                </tr>
              </thead>
              <tbody>
                {recentMockTests.map((m) => (
                  <tr key={m.id} className="border-t border-white/5">
                    <td className="py-2.5 text-slate-400">{formatDate(m.dateTaken)}</td>
                    <td className="py-2.5 text-slate-300">{m.source} {m.bookOrSet}</td>
                    <td className="py-2.5"><Badge tone="slate">{SKILL_LABELS[m.skill]}</Badge></td>
                    <td className="py-2.5 text-slate-300">{m.rawScore ?? "—"}/{m.totalQuestions ?? 40}</td>
                    <td className="py-2.5 font-semibold text-emerald-300">{m.band ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="flex flex-col items-start gap-3 bg-gradient-to-br from-violet-500/10 to-cyan-500/5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <CalendarClock className="h-8 w-8 text-violet-300" />
          <div>
            <p className="text-sm font-semibold text-white">Haven&apos;t taken the Diagnostic Test yet?</p>
            <p className="text-xs text-slate-400">5-minute check per skill — tells you exactly where to start.</p>
          </div>
        </div>
        <Link href="/diagnostic" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/40">
          Start diagnostic <ArrowRight className="h-4 w-4" />
        </Link>
      </Card>
    </div>
  );
}
