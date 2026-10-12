"use server";

import { db } from "@/db";
import { resources } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addResource(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  const url = String(formData.get("url") || "");
  const category = String(formData.get("category") || "link");
  const skill = String(formData.get("skill") || "general");
  const notes = String(formData.get("notes") || "");

  await db.insert(resources).values({ title, url, category, skill, notes });
  revalidatePath("/resources");
}

export async function toggleFavorite(formData: FormData) {
  const id = Number(formData.get("id"));
  const isFavorite = formData.get("isFavorite") === "true";
  await db.update(resources).set({ isFavorite: !isFavorite }).where(eq(resources.id, id));
  revalidatePath("/resources");
}

export async function deleteResource(formData: FormData) {
  const id = Number(formData.get("id"));
  await db.delete(resources).where(eq(resources.id, id));
  revalidatePath("/resources");
}
