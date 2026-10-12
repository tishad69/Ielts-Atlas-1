"use server";

import { db } from "@/db";
import { speakingSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { analyzeSpeaking, SPEAKING_QUESTION_BANK } from "@/lib/speakingEngine";
import { aiEnabled, aiSpeakingFeedback, aiChatReply } from "@/lib/ai";

export async function submitSpeaking(formData: FormData) {
  const part = String(formData.get("part") || "part1");
  const question = String(formData.get("question") || "");
  const transcript = String(formData.get("transcript") || "").trim();
  const durationSeconds = Number(formData.get("durationSeconds") || 60);
  if (!transcript) return;

  const heuristic = analyzeSpeaking(transcript, durationSeconds);
  let record: { bandOverall: number; feedback: Record<string, unknown> } = {
    bandOverall: heuristic.bandOverall,
    feedback: {
      fluency: heuristic.bandFluency,
      lexical: heuristic.bandLexical,
      grammar: heuristic.bandGrammar,
      strengths: heuristic.strengths,
      issues: heuristic.issues,
      stats: heuristic,
    },
  };

  if (aiEnabled()) {
    try {
      const ai = await aiSpeakingFeedback(transcript, question, part);
      record = {
        bandOverall: ai.bandOverall,
        feedback: {
          fluency: ai.fluency,
          lexical: ai.lexical,
          grammar: ai.grammar,
          strengths: ai.strengths,
          issues: ai.issues,
          modelAnswer: ai.modelAnswer,
          stats: heuristic,
        },
      };
    } catch {
      // keep heuristic fallback
    }
  }

  await db.insert(speakingSessions).values({
    part,
    question,
    transcript,
    durationSeconds,
    wordsPerMinute: heuristic.wordsPerMinute,
    fillerCount: heuristic.fillerCount,
    ...record,
  });

  revalidatePath("/speaking");
  revalidatePath("/");
}

export async function deleteSpeaking(formData: FormData) {
  const id = Number(formData.get("id"));
  await db.delete(speakingSessions).where(eq(speakingSessions.id, id));
  revalidatePath("/speaking");
}

export async function randomQuestion(part: string) {
  const bank = SPEAKING_QUESTION_BANK[part] || SPEAKING_QUESTION_BANK.part1;
  return bank[Math.floor(Math.random() * bank.length)];
}

const FALLBACK_FOLLOWUPS: Record<string, string[]> = {
  part1: [
    "Interesting! Could you tell me a bit more about why that is?",
    "Nice. Do you think your opinion on this will change in the future?",
    "Thanks for sharing. How often does that happen for you?",
    "Good answer. Can you compare that with how things were a few years ago?",
  ],
  part2: [
    "Great story — what was the most challenging part of that experience?",
    "That sounds memorable. How did it make you feel afterwards?",
    "Thanks for describing that. Would you recommend it to others? Why?",
  ],
  part3: [
    "That's a fair point. Do you think the government should play a bigger role here?",
    "Interesting perspective — what about the opposite view, is there merit to it?",
    "Good. How do you think this issue will look in 10 years?",
  ],
};

function heuristicFillerNote(userText: string) {
  const fillers = (userText.toLowerCase().match(/\b(um|uh|like|you know|i mean|actually|basically)\b/g) || []).length;
  if (fillers >= 3) return " [Tip: I noticed a few filler words (um/like) — try pausing silently instead.]";
  if (userText.split(/\s+/).filter(Boolean).length < 15) return " [Tip: try extending your answer with a reason and an example.]";
  return "";
}

export async function chatReply(history: Array<{ role: string; content: string }>, part: string) {
  if (aiEnabled()) {
    try {
      const reply = await aiChatReply(history as { role: "user" | "assistant" | "system"; content: string }[]);
      return reply;
    } catch {
      // fall through to heuristic
    }
  }
  const pool = FALLBACK_FOLLOWUPS[part] || FALLBACK_FOLLOWUPS.part1;
  const lastUser = [...history].reverse().find((m) => m.role === "user");
  const note = lastUser ? heuristicFillerNote(lastUser.content) : "";
  const q = pool[Math.floor(Math.random() * pool.length)];
  return `${q}${note}`;
}
