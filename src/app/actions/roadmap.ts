"use server";

import { db } from "@/db";
import { roadmapPhases, roadmapTasks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addPhase(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  const description = String(formData.get("description") || "");
  const colorTag = String(formData.get("colorTag") || "violet");
  const existing = await db.select().from(roadmapPhases);

  await db.insert(roadmapPhases).values({
    title,
    description,
    colorTag,
    orderIndex: existing.length,
  });
  revalidatePath("/roadmap");
}

export async function deletePhase(formData: FormData) {
  const id = Number(formData.get("id"));
  await db.delete(roadmapPhases).where(eq(roadmapPhases.id, id));
  revalidatePath("/roadmap");
}

export async function addTask(formData: FormData) {
  const phaseId = Number(formData.get("phaseId"));
  const title = String(formData.get("title") || "").trim();
  if (!title || !phaseId) return;
  const skill = String(formData.get("skill") || "general");
  const priority = String(formData.get("priority") || "medium");
  const dueDate = String(formData.get("dueDate") || "");

  const existing = await db.select().from(roadmapTasks).where(eq(roadmapTasks.phaseId, phaseId));

  await db.insert(roadmapTasks).values({
    phaseId,
    title,
    skill,
    priority,
    dueDate: dueDate || null,
    orderIndex: existing.length,
    status: "todo",
  });
  revalidatePath("/roadmap");
  revalidatePath("/");
}

export async function toggleTaskStatus(formData: FormData) {
  const id = Number(formData.get("id"));
  const nextStatus = String(formData.get("nextStatus"));
  await db
    .update(roadmapTasks)
    .set({ status: nextStatus, completedAt: nextStatus === "done" ? new Date() : null })
    .where(eq(roadmapTasks.id, id));
  revalidatePath("/roadmap");
  revalidatePath("/");
}

export async function deleteTask(formData: FormData) {
  const id = Number(formData.get("id"));
  await db.delete(roadmapTasks).where(eq(roadmapTasks.id, id));
  revalidatePath("/roadmap");
  revalidatePath("/");
}
