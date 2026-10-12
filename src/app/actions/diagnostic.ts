"use server";

import { db } from "@/db";
import { diagnosticAttempts, examProfile } from "@/db/schema";
import { DIAGNOSTIC_QUESTIONS } from "@/lib/seedData";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function submitDiagnostic(formData: FormData) {
  const skill = String(formData.get("skill") || "grammar");
  const questions = DIAGNOSTIC_QUESTIONS[skill] || [];
  let score = 0;
  const details: Array<{ q: string; correct: boolean; picked: number; answer: number }> = [];

  questions.forEach((q, idx) => {
    const picked = Number(formData.get(`answer-${idx}`));
    const correct = picked === q.answer;
    if (correct) score += 1;
    details.push({ q: q.q, correct, picked, answer: q.answer });
  });

  const total = questions.length || 1;
  const bandEstimate = Math.round((3 + (score / total) * 6) * 2) / 2;

  await db.insert(diagnosticAttempts).values({
    skill,
    score,
    totalQuestions: total,
    bandEstimate,
    details,
  });

  // auto-sync the reading/listening estimate into the profile snapshot if relevant
  const [profile] = await db.select().from(examProfile).limit(1);
  if (profile) {
    if (skill === "reading") await db.update(examProfile).set({ currentReading: bandEstimate }).where(eq(examProfile.id, profile.id));
    if (skill === "listening") await db.update(examProfile).set({ currentListening: bandEstimate }).where(eq(examProfile.id, profile.id));
  }

  revalidatePath("/diagnostic");
  revalidatePath("/");
}
