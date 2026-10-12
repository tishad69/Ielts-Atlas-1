"use server";

import { db } from "@/db";
import { mistakes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addMistake(formData: FormData) {
  const skill = String(formData.get("skill") || "general");
  const questionType = String(formData.get("questionType") || "");
  const description = String(formData.get("description") || "").trim();
  if (!description) return;
  const correction = String(formData.get("correction") || "");
  const source = String(formData.get("source") || "");

  await db.insert(mistakes).values({ skill, questionType, description, correction, source });
  revalidatePath("/mistakes");
  revalidatePath("/");
}

export async function toggleMistakeResolved(formData: FormData) {
  const id = Number(formData.get("id"));
  const resolved = formData.get("resolved") === "true";
  await db.update(mistakes).set({ resolved: !resolved }).where(eq(mistakes.id, id));
  revalidatePath("/mistakes");
  revalidatePath("/");
}

export async function deleteMistake(formData: FormData) {
  const id = Number(formData.get("id"));
  await db.delete(mistakes).where(eq(mistakes.id, id));
  revalidatePath("/mistakes");
}
