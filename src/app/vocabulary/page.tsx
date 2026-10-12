import { db } from "@/db";
import { vocabulary, vocabularyProgress } from "@/db/schema";
import { desc } from "drizzle-orm";
import { ensureSeeded } from "@/lib/ensureSeed";
import { SectionHeading } from "@/components/ui";
import { VocabularyBoard } from "./VocabularyBoard";

export const dynamic = "force-dynamic";

export default async function VocabularyPage() {
  await ensureSeeded();
  const words = await db.select().from(vocabulary).orderBy(desc(vocabulary.createdAt));
  const progress = await db.select().from(vocabularyProgress);

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Vocabulary"
        title="Band 9 Word Bank"
        description="Spaced-repetition flashcards (Leitner system) so words actually stick. Add your own words from Munzareen's book, Engnovate tests, or Liz's lessons."
      />
      <VocabularyBoard words={words} progress={progress} />
    </div>
  );
}
