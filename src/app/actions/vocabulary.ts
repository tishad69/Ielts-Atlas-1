"use server";

import { db } from "@/db";
import { vocabulary, vocabularyProgress } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const BOX_INTERVAL_DAYS: Record<number, number> = { 1: 1, 2: 2, 3: 4, 4: 8, 5: 16 };

export async function addVocab(formData: FormData) {
  const word = String(formData.get("word") || "").trim();
  if (!word) return;
  const meaning = String(formData.get("meaning") || "").trim();
  const banglaMeaning = String(formData.get("banglaMeaning") || "");
  const example = String(formData.get("example") || "");
  const synonym = String(formData.get("synonym") || "");
  const partOfSpeech = String(formData.get("partOfSpeech") || "");
  const topic = String(formData.get("topic") || "general");

  await db.insert(vocabulary).values({ word, meaning, banglaMeaning, example, synonym, partOfSpeech, topic });
  revalidatePath("/vocabulary");
}

export async function deleteVocab(formData: FormData) {
  const id = Number(formData.get("id"));
  await db.delete(vocabulary).where(eq(vocabulary.id, id));
  revalidatePath("/vocabulary");
}

export async function reviewVocab(formData: FormData) {
  const vocabId = Number(formData.get("vocabId"));
  const correct = formData.get("correct") === "true";

  const [existing] = await db.select().from(vocabularyProgress).where(eq(vocabularyProgress.vocabId, vocabId));
  const currentBox = existing?.box ?? 1;
  const nextBox = correct ? Math.min(5, currentBox + 1) : 1;
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + (BOX_INTERVAL_DAYS[nextBox] || 1));

  if (existing) {
    await db
      .update(vocabularyProgress)
      .set({
        box: nextBox,
        timesCorrect: (existing.timesCorrect || 0) + (correct ? 1 : 0),
        timesWrong: (existing.timesWrong || 0) + (correct ? 0 : 1),
        nextReviewDate: nextReview.toISOString().slice(0, 10),
        lastReviewedAt: new Date(),
      })
      .where(eq(vocabularyProgress.id, existing.id));
  } else {
    await db.insert(vocabularyProgress).values({
      vocabId,
      box: nextBox,
      timesCorrect: correct ? 1 : 0,
      timesWrong: correct ? 0 : 1,
      nextReviewDate: nextReview.toISOString().slice(0, 10),
      lastReviewedAt: new Date(),
    });
  }
  revalidatePath("/vocabulary");
}
