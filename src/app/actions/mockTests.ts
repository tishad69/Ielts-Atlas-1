"use server";

import { db } from "@/db";
import { mockTests } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { bandForSkill } from "@/lib/bandTables";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function addMockTest(formData: FormData) {
  const source = String(formData.get("source") || "Cambridge");
  const bookOrSet = String(formData.get("bookOrSet") || "");
  const testNumber = String(formData.get("testNumber") || "");
  const skill = String(formData.get("skill") || "listening");
  const rawScoreRaw = formData.get("rawScore");
  const totalQuestions = Number(formData.get("totalQuestions") || 40);
  const manualBand = formData.get("band") ? Number(formData.get("band")) : null;
  const dateTaken = String(formData.get("dateTaken") || new Date().toISOString().slice(0, 10));
  const notes = String(formData.get("notes") || "");
  const file = formData.get("file") as File | null;

  const rawScore = rawScoreRaw ? Number(rawScoreRaw) : null;
  let band = manualBand;
  if (band === null && rawScore !== null && (skill === "listening" || skill === "reading")) {
    band = bandForSkill(skill, rawScore, totalQuestions);
  }

  let attachmentUrl: string | null = null;
  let attachmentType: string | null = null;
  if (file && file.size > 0) {
    const bytes = Buffer.from(await file.arrayBuffer());
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    const ext = path.extname(file.name) || "";
    const filename = `${crypto.randomUUID()}${ext}`;
    await writeFile(path.join(uploadsDir, filename), bytes);
    attachmentUrl = `/uploads/${filename}`;
    attachmentType = file.type.startsWith("video") ? "video" : "image";
  }

  await db.insert(mockTests).values({
    source,
    bookOrSet,
    testNumber,
    skill,
    rawScore,
    totalQuestions,
    band,
    dateTaken,
    notes,
    attachmentUrl,
    attachmentType,
  });

  revalidatePath("/mock-tests");
  revalidatePath("/");
}

export async function deleteMockTest(formData: FormData) {
  const id = Number(formData.get("id"));
  await db.delete(mockTests).where(eq(mockTests.id, id));
  revalidatePath("/mock-tests");
}
