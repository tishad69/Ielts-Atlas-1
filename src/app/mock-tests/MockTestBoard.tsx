"use client";

import { useMemo, useState, useTransition } from "react";
import { Card, Button, Badge, EmptyState, SectionHeading } from "@/components/ui";
import { SKILL_LABELS, formatDate } from "@/lib/utils";
import { bandForSkill } from "@/lib/bandTables";
import { addMockTest, deleteMockTest } from "@/app/actions/mockTests";
import { BandTrendChart } from "@/components/BandTrendChart";
import { Plus, Trash2, Calculator, Upload } from "lucide-react";

type MockTest = {
  id: number;
  source: string | null;
  bookOrSet: string | null;
  testNumber: string | null;
  skill: string;
  rawScore: number | null;
  totalQuestions: number | null;
  band: number | null;
  dateTaken: string | null;
  notes: string | null;
  attachmentUrl: string | null;
  attachmentType: string | null;
};

function BandCalculator() {
  const [skill, setSkill] = useState<"listening" | "reading">("listening");
  const [raw, setRaw] = useState(30);
  const band = bandForSkill(skill, raw, 40);

  return (
    <Card>
      <div className="flex items-center gap-2">
        <Calculator className="h-5 w-5 text-cyan-300" />
        <h3 className="font-[var(--font-display)] text-lg font-bold text-white">Quick Band Calculator</h3>
      </div>
      <p className="mt-1 text-xs text-slate-500">Indicative Academic IELTS conversion (out of 40) — varies ±1 mark by test edition.</p>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          {(["listening", "reading"] as const).map((s) => (
            <button key={s} onClick={() => setSkill(s)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${skill === s ? "border-cyan-400 bg-cyan-500/15 text-cyan-200" : "border-white/10 text-slate-400"}`}>
              {SKILL_LABELS[s]}
            </button>
          ))}
        </div>
        <input
          type="range"
          min={0}
          max={40}
          value={raw}
          onChange={(e) => setRaw(Number(e.target.value))}
          className="h-2 flex-1 min-w-[160px] accent-violet-500"
        />
        <span className="text-sm text-slate-300">{raw} / 40</span>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/10 font-[var(--font-display)] text-xl font-bold text-white">
          {band}
        </div>
      </div>
    </Card>
  );
}

export function MockTestBoard({ rows }: { rows: MockTest[] }) {
  const [isPending, startTransition] = useTransition();
  const [skill, setSkill] = useState("listening");
  const [raw, setRaw] = useState("");
  const [total, setTotal] = useState("40");

  const previewBand = raw && (skill === "listening" || skill === "reading") ? bandForSkill(skill, Number(raw), Number(total) || 40) : null;

  const trendBySkill = useMemo(() => {
    const out: Record<string, { label: string; band: number }[]> = {};
    for (const s of ["listening", "reading", "writing", "speaking"]) {
      out[s] = rows
        .filter((r) => r.skill === s && r.band)
        .slice()
        .reverse()
        .map((r, i) => ({ label: `#${i + 1}`, band: r.band || 0 }));
    }
    return out;
  }, [rows]);

  function remove(id: number) {
    const fd = new FormData();
    fd.set("id", String(id));
    startTransition(() => deleteMockTest(fd));
  }

  return (
    <div className="space-y-6">
      <BandCalculator />

      <Card>
        <h3 className="mb-3 flex items-center gap-2 font-[var(--font-display)] text-lg font-bold text-white">
          <Upload className="h-5 w-5 text-violet-300" /> Log a test result
        </h3>
        <form
          action={(fd) => {
            startTransition(() => addMockTest(fd));
          }}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          <select name="source" className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 focus:border-violet-400 focus:outline-none">
            <option>Engnovate</option>
            <option>Cambridge</option>
            <option>Other</option>
          </select>
          <input name="bookOrSet" placeholder="Book / Set (e.g. Cambridge 17)" className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-violet-400 focus:outline-none" />
          <input name="testNumber" placeholder="Test # (e.g. Test 3)" className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-violet-400 focus:outline-none" />
          <select name="skill" value={skill} onChange={(e) => setSkill(e.target.value)} className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 focus:border-violet-400 focus:outline-none">
            {Object.entries(SKILL_LABELS).filter(([k]) => ["listening", "reading", "writing", "speaking"].includes(k)).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>

          <input name="rawScore" value={raw} onChange={(e) => setRaw(e.target.value)} type="number" placeholder="Raw score (if L/R)" className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-violet-400 focus:outline-none" />
          <input name="totalQuestions" value={total} onChange={(e) => setTotal(e.target.value)} type="number" placeholder="Out of" className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-violet-400 focus:outline-none" />
          <input name="band" placeholder={previewBand ? `Auto: ${previewBand}` : "Band (manual, e.g. for W/S)"} step="0.5" type="number" className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-violet-400 focus:outline-none" />
          <input name="dateTaken" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 focus:border-violet-400 focus:outline-none" />

          <input name="notes" placeholder="Notes — what to improve next time" className="sm:col-span-2 lg:col-span-3 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-violet-400 focus:outline-none" />
          <input name="file" type="file" accept="image/*,video/*" className="rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-slate-300 file:mr-2 file:rounded-md file:border-0 file:bg-violet-500/20 file:px-2 file:py-1.5 file:text-xs file:text-violet-200" />

          <Button type="submit" disabled={isPending} className="sm:col-span-2 lg:col-span-4 justify-center">
            <Plus className="h-4 w-4" /> Save result
          </Button>
        </form>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {["listening", "reading", "writing", "speaking"].map((s) => (
          <Card key={s}>
            <SectionHeading title={`${SKILL_LABELS[s]} trend`} />
            <div className="mt-3">
              <BandTrendChart data={trendBySkill[s] || []} />
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="mb-4 font-[var(--font-display)] text-lg font-bold text-white">History</h3>
        {rows.length === 0 ? (
          <EmptyState title="No tests logged yet" description="Start tracking your Engnovate / Cambridge progress above." />
        ) : (
          <div className="space-y-3">
            {rows.map((r) => (
              <div key={r.id} className="flex flex-col gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4 sm:flex-row sm:items-center">
                {r.attachmentUrl && (
                  <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black/30">
                    {r.attachmentType === "video" ? (
                      <video src={r.attachmentUrl} className="h-full w-full object-cover" controls />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.attachmentUrl} alt="evidence" className="h-full w-full object-cover" />
                    )}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="slate">{SKILL_LABELS[r.skill]}</Badge>
                    <span className="text-xs text-slate-500">{formatDate(r.dateTaken)}</span>
                    <span className="text-xs text-slate-500">{r.source} {r.bookOrSet} {r.testNumber}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-300">
                    Score: {r.rawScore ?? "—"}/{r.totalQuestions ?? 40} → <span className="font-semibold text-emerald-300">Band {r.band ?? "—"}</span>
                  </p>
                  {r.notes && <p className="mt-1 text-xs text-slate-500">{r.notes}</p>}
                </div>
                <button onClick={() => remove(r.id)} className="self-start rounded-lg p-1.5 text-slate-600 hover:bg-white/5 hover:text-rose-300">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
