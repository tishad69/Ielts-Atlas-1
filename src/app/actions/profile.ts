"use server";

import { db } from "@/db";
import { examProfile } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const id = Number(formData.get("id"));
  const fullName = String(formData.get("fullName") || "");
  const examDate = String(formData.get("examDate") || "");
  const targetBand = Number(formData.get("targetBand") || 9);
  const currentListening = Number(formData.get("currentListening") || 0);
  const currentReading = Number(formData.get("currentReading") || 0);
  const currentWriting = Number(formData.get("currentWriting") || 0);
  const currentSpeaking = Number(formData.get("currentSpeaking") || 0);

  await db
    .update(examProfile)
    .set({
      fullName,
      examDate: examDate || null,
      targetBand,
      currentListening,
      currentReading,
      currentWriting,
      currentSpeaking,
      updatedAt: new Date(),
    })
    .where(eq(examProfile.id, id));

  revalidatePath("/");
  revalidatePath("/settings");
}
