import { db } from "@/db";
import { examProfile, roadmapPhases, roadmapTasks, vocabulary, resources } from "@/db/schema";
import { SEED_VOCAB, SEED_RESOURCES, SEED_PHASES } from "./seedData";

let seeded = false;

export async function ensureSeeded() {
  if (seeded) return;

  const profiles = await db.select().from(examProfile).limit(1);
  if (profiles.length === 0) {
    const target = new Date();
    target.setDate(target.getDate() + 70); // ~10 weeks out as a sane default
    await db.insert(examProfile).values({
      fullName: "Future Band 9",
      examDate: target.toISOString().slice(0, 10),
      targetBand: 9,
      currentListening: 0,
      currentReading: 0,
      currentWriting: 0,
      currentSpeaking: 0,
    });
  }

  const phases = await db.select().from(roadmapPhases).limit(1);
  if (phases.length === 0) {
    for (let i = 0; i < SEED_PHASES.length; i++) {
      const phase = SEED_PHASES[i];
      const [inserted] = await db
        .insert(roadmapPhases)
        .values({ title: phase.title, description: phase.description, orderIndex: i, colorTag: phase.colorTag })
        .returning();
      for (let j = 0; j < phase.tasks.length; j++) {
        const t = phase.tasks[j];
        await db.insert(roadmapTasks).values({
          phaseId: inserted.id,
          title: t.title,
          description: t.description,
          skill: t.skill,
          priority: t.priority || "medium",
          orderIndex: j,
          status: "todo",
        });
      }
    }
  }

  const vocabRows = await db.select().from(vocabulary).limit(1);
  if (vocabRows.length === 0) {
    await db.insert(vocabulary).values(
      SEED_VOCAB.map((v) => ({
        word: v.word,
        meaning: v.meaning,
        banglaMeaning: v.banglaMeaning,
        example: v.example,
        synonym: v.synonym,
        partOfSpeech: v.partOfSpeech,
        topic: v.topic,
      })),
    );
  }

  const resourceRows = await db.select().from(resources).limit(1);
  if (resourceRows.length === 0) {
    await db.insert(resources).values(
      SEED_RESOURCES.map((r) => ({
        title: r.title,
        url: r.url,
        category: r.category,
        skill: r.skill,
        notes: r.notes,
      })),
    );
  }

  seeded = true;
}
