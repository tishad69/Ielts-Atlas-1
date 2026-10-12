"use client";

import { useState, useTransition } from "react";
import { Card, Button, Badge, EmptyState } from "@/components/ui";
import { formatDate, cn } from "@/lib/utils";
import { submitSpeaking, deleteSpeaking, chatReply } from "@/app/actions/speaking";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { Mic, Square, RefreshCw, Trash2, ChevronDown, ChevronUp, Send, MessageCircle, Loader2 } from "lucide-react";

type Session = {
  id: number;
  part: string | null;
  question: string | null;
  transcript: string;
  durationSeconds: number | null;
  wordsPerMinute: number | null;
  fillerCount: number | null;
  bandOverall: number | null;
  feedback: unknown;
  createdAt: Date | string;
};

const PARTS = [
  { value: "part1", label: "Part 1 — Introduction" },
  { value: "part2", label: "Part 2 — Cue Card" },
  { value: "part3", label: "Part 3 — Discussion" },
];

function BandPill({ label, value }: { label: string; value: number | null | undefined }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-white/10 bg-black/20 px-3 py-2">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <span className="font-[var(--font-display)] text-lg font-bold text-white">{value ?? "—"}</span>
    </div>
  );
}

function SoloRecorder({ aiMode }: { aiMode: boolean }) {
  const [part, setPart] = useState("part1");
  const [question, setQuestion] = useState(randomQuestionFallback("part1"));
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const rec = useSpeechRecognition();

  function newQuestion(p: string) {
    setQuestion(randomQuestionFallback(p));
    rec.reset();
    setSubmitted(false);
  }

  function handleSubmit() {
    const fd = new FormData();
    fd.set("part", part);
    fd.set("question", question);
    fd.set("transcript", rec.finalText || rec.interimText);
    fd.set("durationSeconds", String(rec.seconds || 1));
    startTransition(() => {
      submitSpeaking(fd).then(() => setSubmitted(true));
    });
  }

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {PARTS.map((p) => (
            <button
              key={p.value}
              onClick={() => {
                setPart(p.value);
                newQuestion(p.value);
              }}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                part === p.value ? "border-violet-400 bg-violet-500/15 text-violet-200" : "border-white/10 text-slate-400 hover:text-slate-200",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        <Badge tone={aiMode ? "emerald" : "slate"}>{aiMode ? "AI examiner" : "Free heuristic examiner"}</Badge>
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-slate-200">{question}</p>
          <button onClick={() => newQuestion(part)} className="shrink-0 rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-violet-300">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!rec.isSupported && (
        <p className="mt-3 text-xs text-amber-400">
          Your browser doesn&apos;t support live speech-to-text (try Chrome/Edge). You can still type your answer below.
        </p>
      )}

      <div className="mt-4 flex items-center gap-3">
        {!rec.isRecording ? (
          <Button onClick={rec.start}>
            <Mic className="h-4 w-4" /> Start speaking
          </Button>
        ) : (
          <Button variant="danger" onClick={rec.stop}>
            <Square className="h-4 w-4" /> Stop ({rec.seconds}s)
          </Button>
        )}
        {rec.isRecording && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-rose-300">
            <span className="pulse-dot h-2 w-2 rounded-full bg-rose-400" /> Listening — transcript keeps going through pauses
          </span>
        )}
      </div>

      <div className="mt-4">
        <label className="text-xs font-medium text-slate-400">Live transcript (editable)</label>
        <textarea
          value={rec.finalText + (rec.interimText ? ` ${rec.interimText}` : "")}
          onChange={(e) => rec.setFinalText(e.target.value)}
          rows={6}
          placeholder="Your spoken answer will appear here in real time..."
          className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm leading-relaxed text-slate-200 placeholder:text-slate-500 focus:border-violet-400 focus:outline-none"
        />
      </div>

      <div className="mt-4 flex justify-end">
        <Button onClick={handleSubmit} disabled={isPending || (!rec.finalText && !rec.interimText)}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Submit for band score
        </Button>
      </div>
      {submitted && <p className="mt-2 text-right text-xs font-medium text-emerald-400">Saved! See your result below.</p>}
    </Card>
  );
}

function randomQuestionFallback(part: string) {
  const bank: Record<string, string[]> = {
    part1: ["Let's talk about your hometown. Where is it?", "Do you work or are you a student?", "What do you usually do in your free time?"],
    part2: ["Describe a skill you would like to learn. Say what it is, why, how, and the benefit.", "Describe a memorable trip. Say where, who with, what you did, and why memorable."],
    part3: ["Do you think technology has changed how people communicate?", "What are the advantages and disadvantages of studying abroad?"],
  };
  const arr = bank[part] || bank.part1;
  return arr[Math.floor(Math.random() * arr.length)];
}

type ChatMessage = { role: "user" | "assistant"; content: string };

function ConversationPartner() {
  const [part, setPart] = useState("part1");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hi! I'm Mihu, your speaking partner. Tell me a little about yourself to get started." },
  ]);
  const [isPending, startTransition] = useTransition();
  const rec = useSpeechRecognition();

  function send(text: string) {
    if (!text.trim()) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: text.trim() }];
    setMessages(next);
    rec.reset();
    startTransition(() => {
      chatReply(next, part).then((reply) => {
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      });
    });
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-violet-300" />
          <h3 className="font-[var(--font-display)] text-lg font-bold text-white">AI Conversation Partner</h3>
        </div>
        <select value={part} onChange={(e) => setPart(e.target.value)} className="rounded-lg border border-white/10 bg-black/30 px-2.5 py-1.5 text-xs text-slate-200 focus:border-violet-400 focus:outline-none">
          {PARTS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>

      <div className="mt-4 max-h-80 space-y-3 overflow-y-auto scrollbar-thin rounded-xl border border-white/5 bg-black/20 p-4">
        {messages.map((m, i) => (
          <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[80%] rounded-2xl px-4 py-2.5 text-sm", m.role === "user" ? "bg-violet-500/20 text-violet-100" : "bg-white/5 text-slate-300")}>
              {m.content}
            </div>
          </div>
        ))}
        {isPending && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-white/5 px-4 py-2.5 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        {!rec.isRecording ? (
          <Button variant="outline" onClick={rec.start}>
            <Mic className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="danger" onClick={rec.stop}>
            <Square className="h-4 w-4" />
          </Button>
        )}
        <input
          value={rec.finalText + (rec.interimText ? ` ${rec.interimText}` : "")}
          onChange={(e) => rec.setFinalText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const text = rec.finalText + (rec.interimText ? ` ${rec.interimText}` : "");
              send(text);
              rec.stop();
            }
          }}
          placeholder="Speak or type your answer, then press Enter..."
          className="flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:border-violet-400 focus:outline-none"
        />
        <Button
          onClick={() => {
            const text = rec.finalText + (rec.interimText ? ` ${rec.interimText}` : "");
            send(text);
            rec.stop();
          }}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}

export function SpeakingLab({ sessions, aiMode }: { sessions: Session[]; aiMode: boolean }) {
  const [tab, setTab] = useState<"solo" | "chat">("solo");
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState<number | null>(sessions[0]?.id ?? null);

  function remove(id: number) {
    const fd = new FormData();
    fd.set("id", String(id));
    startTransition(() => deleteSpeaking(fd));
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button onClick={() => setTab("solo")} className={cn("rounded-full px-4 py-2 text-sm font-semibold transition-colors", tab === "solo" ? "bg-violet-500/20 text-violet-200 ring-1 ring-violet-500/30" : "text-slate-400 hover:text-slate-200")}>
          🎙️ Solo Practice
        </button>
        <button onClick={() => setTab("chat")} className={cn("rounded-full px-4 py-2 text-sm font-semibold transition-colors", tab === "chat" ? "bg-violet-500/20 text-violet-200 ring-1 ring-violet-500/30" : "text-slate-400 hover:text-slate-200")}>
          💬 AI Conversation Partner
        </button>
      </div>

      {tab === "solo" ? <SoloRecorder aiMode={aiMode} /> : <ConversationPartner />}

      <div className="space-y-4">
        <h3 className="font-[var(--font-display)] text-lg font-bold text-white">Session history</h3>
        {sessions.length === 0 ? (
          <EmptyState title="No sessions yet" description="Your scored speaking sessions will appear here." />
        ) : (
          sessions.map((s) => {
            const fb = (s.feedback as { fluency?: number; lexical?: number; grammar?: number; strengths?: string[]; issues?: string[] }) || {};
            const isOpen = expanded === s.id;
            return (
              <Card key={s.id}>
                <button onClick={() => setExpanded(isOpen ? null : s.id)} className="flex w-full items-center justify-between gap-3 text-left">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/20 to-violet-500/10 font-[var(--font-display)] text-lg font-bold text-white">
                      {s.bandOverall ?? "—"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">{s.part} · {s.wordsPerMinute ?? 0} wpm · {s.fillerCount ?? 0} fillers</p>
                      <p className="text-xs text-slate-500">{formatDate(s.createdAt as string)}</p>
                    </div>
                  </div>
                  {isOpen ? <ChevronUp className="h-5 w-5 text-slate-500" /> : <ChevronDown className="h-5 w-5 text-slate-500" />}
                </button>
                {isOpen && (
                  <div className="mt-5 space-y-4 border-t border-white/5 pt-5">
                    <div className="grid grid-cols-3 gap-3">
                      <BandPill label="Fluency" value={fb.fluency} />
                      <BandPill label="Lexical" value={fb.lexical} />
                      <BandPill label="Grammar" value={fb.grammar} />
                    </div>
                    {s.question && <p className="text-sm text-slate-400"><span className="font-semibold text-slate-300">Q:</span> {s.question}</p>}
                    <p className="whitespace-pre-wrap rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-slate-400">{s.transcript}</p>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-400">Strengths</p>
                        <ul className="space-y-1.5">{(fb.strengths || []).map((item, i) => <li key={i} className="text-sm text-slate-300">✓ {item}</li>)}</ul>
                      </div>
                      <div>
                        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-rose-400">Issues to fix</p>
                        <ul className="space-y-1.5">{(fb.issues || []).map((item, i) => <li key={i} className="text-sm text-slate-300">⚠ {item}</li>)}</ul>
                      </div>
                    </div>
                    <button onClick={() => remove(s.id)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300">
                      <Trash2 className="h-3.5 w-3.5" /> Delete session
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
