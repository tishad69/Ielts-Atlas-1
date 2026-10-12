"use server";

import { db } from "@/db";
import { dailyLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addDailyLog(formData: FormData) {
  const logDate = String(formData.get("logDate") || new Date().toISOString().slice(0, 10));
  const skill = String(formData.get("skill") || "general");
  const minutesSpent = Number(formData.get("minutesSpent") || 0);
  const notes = String(formData.get("notes") || "");
  const mood = String(formData.get("mood") || "");

  await db.insert(dailyLogs).values({
    logDate,
    skill,
    minutesSpent,
    notes,
    mood: mood || null,
  });
  revalidatePath("/daily");
  revalidatePath("/");
}

export async function deleteDailyLog(formData: FormData) {
  const id = Number(formData.get("id"));
  await db.delete(dailyLogs).where(eq(dailyLogs.id, id));
  revalidatePath("/daily");
  revalidatePath("/");
}
