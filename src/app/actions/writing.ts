"use server";

import { db } from "@/db";
import { writingSubmissions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { analyzeWriting, enhanceToBandNine } from "@/lib/writingEngine";
import { aiEnabled, aiWritingFeedback } from "@/lib/ai";

export async function submitWriting(formData: FormData) {
  const taskType = String(formData.get("taskType") || "task2");
  const prompt = String(formData.get("prompt") || "");
  const essayText = String(formData.get("essayText") || "").trim();
  if (!essayText) return;

  const wordCount = essayText.split(/\s+/).filter(Boolean).length;
  const heuristic = analyzeWriting(essayText, prompt, taskType);
  const heuristicRewrite = enhanceToBandNine(essayText);

  let record = {
    bandTa: heuristic.bandTa,
    bandCc: heuristic.bandCc,
    bandLr: heuristic.bandLr,
    bandGr: heuristic.bandGr,
    bandOverall: heuristic.bandOverall,
    feedback: { strengths: heuristic.strengths, issues: heuristic.issues, stats: heuristic },
    rewriteText: heuristicRewrite,
    engine: "heuristic" as "heuristic" | "ai",
  };

  if (aiEnabled()) {
    try {
      const ai = await aiWritingFeedback(essayText, prompt, taskType);
      record = {
        bandTa: ai.bandTa,
        bandCc: ai.bandCc,
        bandLr: ai.bandLr,
        bandGr: ai.bandGr,
        bandOverall: ai.bandOverall,
        feedback: { strengths: ai.strengths, issues: ai.issues, stats: heuristic },
        rewriteText: ai.rewrite,
        engine: "ai",
      };
    } catch {
      // fall back silently to heuristic result already computed
    }
  }

  await db.insert(writingSubmissions).values({
    taskType,
    prompt,
    essayText,
    wordCount,
    ...record,
  });

  revalidatePath("/writing");
  revalidatePath("/");
}

export async function deleteWriting(formData: FormData) {
  const id = Number(formData.get("id"));
  await db.delete(writingSubmissions).where(eq(writingSubmissions.id, id));
  revalidatePath("/writing");
}
